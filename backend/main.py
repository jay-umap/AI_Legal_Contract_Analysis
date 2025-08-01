# backend/main.py - FINAL VERIFIED CORRECTED VERSION (with history, robust regex parsing, and chat context)

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from google.generativeai import GenerativeModel
# from google.api_core.client_options import ClientOptions # Not strictly needed here
from dotenv import load_dotenv
import io
import os
import traceback
from PyPDF2 import PdfReader
import docx
import re
import sys # For sys.exit
import datetime # NEW: For timestamps in history

# Load environment variables
load_dotenv()

# Set your Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# -----------------------------------------------------------------------------------------
# START OF SECTION: CONNECTING WITH API KEY (UNCHANGED AS PER YOUR REQUEST)
# -----------------------------------------------------------------------------------------
# Set your Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini API and Initialize Model
try:
    # Use the default endpoint or specify explicitly if needed
    genai.configure(api_key=GEMINI_API_KEY)

    # --- Direct Model Initialization ---
    # Based on past logs, 'gemini-pro' is a common target.
    # If 'gemini-pro-2.5' has specifically worked for you, change this to 'gemini-pro-2.5'
    # For initial debugging, 'gemini-pro' is often more broadly available.
    selected_model_name = "gemini-2.5-pro" # Change to "gemini-pro-2.5" if that's your target/working model

    # Verify if the model is generally available
    # You can uncomment this part for more detailed model listing at startup
    print("Attempting to list models to verify API key and general access...")
    for m in genai.list_models():
        print(f"Available model: {m.name}, capabilities: {m.supported_generation_methods}")
    print("Finished listing models.")
    
    # Try initializing the specific model
    model = GenerativeModel(model_name=selected_model_name)
    print(f"Using Gemini model: {selected_model_name}")

except Exception as e:
    print(f"Failed to initialize Gemini models. Error: {e}")
    print("Please ensure your GEMINI_API_KEY is correct, enabled, and the model ('gemini-pro' or 'gemini-pro-2.5') is available in your region.")
    # Use sys.exit(1) for cleaner exit on startup failure
    import sys
    sys.exit(1)


# -----------------------------------------------------------------------------------------
# END OF SECTION: CONNECTING WITH API KEY
# -----------------------------------------------------------------------------------------


# Initialize FastAPI app
app = FastAPI()

# CORS setup - Reverted to specific origins for security
origins = [
    "http://127.0.0.1:5500", # Your frontend
    "http://localhost:5500", # Your frontend
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory user database (demo only)
users_db = {}

# CHANGE 1: Add global variables for storing last analyzed document text for chat context AND user history
# This section is added after users_db = {} (around line 55-56 in your provided code)
last_analyzed_document_text = ""
user_history = [] # Stores history entries {title, timestamp, tags, summary, ai_response_text}


# --- File Text Extraction ---
def extract_text_from_file(file: UploadFile):
    try:
        file_ext = file.filename.split(".")[-1].lower()
        if file_ext == "pdf":
            reader = PdfReader(io.BytesIO(file.file.read()))
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text
        elif file_ext == "docx":
            document = docx.Document(io.BytesIO(file.file.read()))
            return "\n".join([para.text for para in document.paragraphs])
        elif file_ext == "txt":
            return file.file.read().decode("utf-8")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format.")
    except Exception as e:
        traceback.print_exc() # Print full traceback to console for debugging
        raise HTTPException(status_code=500, detail=f"Failed to extract text: {e}. Check file content or format.")

# --- API Routes ---

@app.post("/register/")
async def register_user(
    full_name: str = Form(...),
    dob: str = Form(...),
    gender: str = Form(...),
    profession: str = Form(...),
    password: str = Form(...)
):
    if full_name in users_db:
        raise HTTPException(status_code=400, detail="User already exists.")

    users_db[full_name] = {
        "password": password,
        "dob": dob,
        "gender": gender,
        "profession": profession
    }
    return {"message": "Registration successful."}

@app.post("/login/")
async def login_user(
    full_name: str = Form(...),
    password: str = Form(...)
):
    user = users_db.get(full_name)
    if not user or user["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    return {"message": "Login successful.", "full_name": full_name}


@app.post("/upload/")
async def upload_contract_for_analysis(file: UploadFile = File(...)):
    # CHANGE 2.1: Declare global variables for modification (around line 105)
    global last_analyzed_document_text
    global user_history
    try:
        text = extract_text_from_file(file)
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from document or document is empty.")

        # CHANGE 2.2: Store the extracted text for later chatbot context (around line 110)
        # Limit the stored text to avoid excessively large context for chat, e.g., 10,000 characters
        last_analyzed_document_text = text[:10000] 

        # CHANGE 2.3: Update prompt format to request bullet points and bold headers (around line 113)
        prompt = f"""
        You are a legal AI assistant. Analyze the following contract text and provide the following structured information.
        If a section is not found or not applicable, state "No data" for that section.

        Expected Output Format:
        **Section:**
        - [Type of contract (e.g., Employment, NDA, Lease)]
        - - [Any other primary categories or classifications of the document]
        **Document:** [Document category (e.g., Agreement, Policy)]
        **Summary:**
        - [Concise point 1 about purpose, parties, or key terms]
        - - [Concise point 2 about main obligations or rights]
        - - [Concise point 3 about duration, fees, or critical aspects]
        **Risk Clause:**
        - [Identify and summarize potential risks. Use bullet points for multiple items.]
        **Non-Standard:**
        - [Identify and summarize unusual terms. Use bullet points for multiple items.]

        Contract Text:
        ---
        {text}
        ---
        """
        
        response = model.generate_content(prompt)
        ai_response_text = response.text
        print("Gemini Analysis Raw Response:", ai_response_text) # Log raw AI response

        # CHANGE 2.4: CORRECTED Parsing of AI Response into expected sections using REGEX (around line 139)
        sections_data = {
            "Section": "No data",
            "Document": "No data",
            "Summary": "No data",
            "Risk Clause": "No data",
            "Non-Standard": "No data"
        }

        # Define regex patterns for each section to match bolded headers and capture content
        # Using re.DOTALL makes '.' match newlines, re.IGNORECASE makes it case-insensitive
        
        # Section: (.*?) then look for **Document: or end
        section_match = re.search(r"\*\*Section:\*\*\s*(.*?)(?=\n\*\*Document:|\Z)", ai_response_text, re.DOTALL | re.IGNORECASE)
        if section_match:
            sections_data["Section"] = section_match.group(1).strip()

        # Document: (.*?) then look for **Summary: or end
        document_match = re.search(r"\*\*Document:\*\*\s*(.*?)(?=\n\*\*Summary:|\Z)", ai_response_text, re.DOTALL | re.IGNORECASE)
        if document_match:
            sections_data["Document"] = document_match.group(1).strip()

        # Summary: (.*?) then look for **Risk Clause: or end
        summary_match = re.search(r"\*\*Summary:\*\*\s*(.*?)(?=\n\*\*Risk Clause:|\Z)", ai_response_text, re.DOTALL | re.IGNORECASE)
        if summary_match:
            sections_data["Summary"] = summary_match.group(1).strip()

        # Risk Clause: (.*?) then look for **Non-Standard: or end
        risk_clause_match = re.search(r"\*\*Risk Clause:\*\*\s*(.*?)(?=\n\*\*Non-Standard:|\Z)", ai_response_text, re.DOTALL | re.IGNORECASE)
        if risk_clause_match:
            sections_data["Risk Clause"] = risk_clause_match.group(1).strip()

        # Non-Standard: (.*?) then look for ** (any bolded text) or end of string
        non_standard_match = re.search(r"\*\*Non-Standard:\*\*\s*(.*?)(?=\n\*\*|\Z)", ai_response_text, re.DOTALL | re.IGNORECASE)
        if non_standard_match:
            sections_data["Non-Standard"] = non_standard_match.group(1).strip()
        
        # CHANGE 2.5: Save history entry (after successful analysis and parsing)
        # This block is added after the parsing logic and before the final return statement.
        from datetime import datetime
        
        # Extract tags from Section and Document or create based on default
        tags = []
        if sections_data["Section"] != "No data":
            # Simple way to get tags from a bulleted section. Adjust as needed.
            tags.extend([s.strip().replace('-', '').replace('*', '').strip() for s in sections_data["Section"].split('\n') if s.strip()])
        if sections_data["Document"] != "No data":
            tags.append(sections_data["Document"].strip())
        tags = list(set([t for t in tags if t])) # Remove duplicates and empty tags

        # Create a history entry matching the structure in history.html
        history_entry = {
            "title": file.filename,
            "timestamp": datetime.now().strftime("%Y-%m-%d • %H:%M"),
            "tags": tags if tags else ["Analysis"], # Default tag if no specific tags extracted
            "summary": sections_data["Summary"],
            "ai_response_text": ai_response_text # Store raw AI response for 'AI Response' button
        }
        user_history.insert(0, history_entry) # Add to the beginning of the list (newest first)
        print(f"Added to history: {history_entry['title']}")

        # Return the parsed data
        return JSONResponse(content={"response": ai_response_text, "parsed_sections": sections_data})

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Contract analysis failed: {e}")
    
@app.post("/ask/")
async def ask_chatbot(prompt: str = Form(...)):
    # CHANGE 3.1: Declare global variable for access (around line 178)
    global last_analyzed_document_text 
    try:
        # CHANGE 3.2: Conditionally construct prompt with document context (around line 180)
        chat_prompt_with_context = prompt # Default to just user's prompt

        if last_analyzed_document_text:
            # Use a snippet of the document text for context to avoid hitting token limits
            # Adjust the length (e.g., 4000 characters) based on typical document size and Gemini's limits
            document_snippet = last_analyzed_document_text[:4000] 

            chat_prompt_with_context = f"""
            You are an AI Legal Assistant. The user has previously uploaded and is referring to a document.
            The relevant portion of that document's content is:
            ---
            {document_snippet}
            ---
            Based on the above document, and general legal knowledge if applicable, respond to the user's question: "{prompt}"
            If the question cannot be answered solely from the provided document snippet, state that you need more information or that the answer is not directly in the document.
            """
            print(f"Chatbot prompt with document context (truncated): {chat_prompt_with_context[:500]}...") # Log truncated prompt

        initial_message = {
            'role': 'model',
            'parts': ["Hello! I am your AI Legal Assistant. How may I assist you today with your legal inquiries or document analysis?"]
        }
        
        # Start chat with a GenerativeModel instance
        # CHANGE 3.3: Pass the contextual prompt to send_message (around line 200)
        chat_session = model.start_chat(history=[initial_message])
        response = chat_session.send_message(chat_prompt_with_context) # Use contextual prompt here

        # Check for safety concerns
        if hasattr(response, '_result') and hasattr(response._result, 'prompt_feedback') and response._result.prompt_feedback.block_reason:
            return JSONResponse(content={"response": "I cannot respond to this query due to safety guidelines."}, status_code=400)

        # CHANGE 3.4: Enhance initial greeting for "Hi" or "Hello" if it's not a doc-related question (around line 207)
        if not last_analyzed_document_text and prompt.lower() in ["hi", "hello", "hii"]:
            return JSONResponse(content={"response": "Hello! I am your AI Legal Assistant. How may I assist you today with your legal inquiries or document analysis?"})
        
        return JSONResponse(content={"response": response.text})
    except Exception as e:
        print(f"Error during chatbot interaction: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Chatbot interaction failed: {e}")

# CHANGE 4: Add new endpoints for history retrieval and deletion
# This section is added at the very end of your main.py file.
@app.get("/history/")
async def get_user_history():
    global user_history # Declare global to access it
    return JSONResponse(content={"history": user_history})

@app.get("/history/{item_index}/ai_response")
async def get_ai_response(item_index: int):
    global user_history # Declare global to access it
    if 0 <= item_index < len(user_history):
        return JSONResponse(content={"ai_response": user_history[item_index]["ai_response_text"]})
    raise HTTPException(status_code=404, detail="History item not found.")

@app.delete("/history/{item_index}")
async def delete_history_item(item_index: int):
    global user_history # Declare global to modify it
    if 0 <= item_index < len(user_history):
        deleted_item = user_history.pop(item_index)
        print(f"Deleted from history: {deleted_item['title']}")
        return JSONResponse(content={"message": "Item deleted successfully."})
    raise HTTPException(status_code=404, detail="History item not found.")


# backend/main.py - ADDITION for Profile Feature
@app.get("/profile/{full_name}")
async def get_user_profile(full_name: str):
    user_data = users_db.get(full_name)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # Return a copy of user_data, excluding the password for security
    profile_data = {
        "full_name": full_name,
        "dob": user_data.get("dob"),
        "gender": user_data.get("gender"),
        "profession": user_data.get("profession")
    }
    return JSONResponse(content=profile_data)
# ⚖️ AI Legal Assistance for Contracts & Compliance

> *“Understanding contracts is a right — not a privilege.”*

**AI Legal Assistant** is a web-based tool that helps non-lawyers understand complex legal documents. Built by **Team Code Rangers**, it uses **Google Gemini AI** to identify risky clauses and convert legal jargon into plain English — making contract review **easy, secure, and fast**.

---

## ✨ Features

- 🔍 **Clause Flagging** – Detects risky or unusual contract clauses  
- 🧾 **Plain Language Summaries** – Explains legal terms in simple words  
- ⚡ **Instant Insights** – Upload a file and get real-time analysis  
- 🔐 **Privacy Focused** – Keeps user data safe and secure  
- 🌐 **Fully Web-Based** – No installs required  
- 🎙️ **Voice Features** – Text-to-speech & voice input supported  

---

---

## 💼 Real-World Use Cases

| Contract Type               | What It Flags or Simplifies                          |
|----------------------------|------------------------------------------------------|
| Freelance Agreements        | Vague scope, cancellation without pay               |
| Rental Agreements           | Sudden eviction, unfair penalties                   |
| Employment Contracts        | No notice termination, confidentiality traps        |
| Loan & Banking Documents    | Hidden penalties, interest traps                    |
| Insurance Policies          | Claim exclusions, fine print                        |
| Startup/Investment Deals    | Equity dilution, founder rights                    |

---
## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript, Web Speech API  
- **Backend:** Python, FastAPI, Google Gemini API, Uvicorn  
- **Libraries:** PyPDF2, python-docx, dotenv  
- **Tools:** GitHub, VS Code  

---

## 🚀 Quick Setup

### 🔧 Backend Setup

```bash
git clone https://github.com/your-username/AI_Legal_Assistant.git
cd AI_Legal_Assistant/backend
python -m venv venv
.\venv\Scripts\activate   # For Windows
# source venv/bin/activate   # For Linux/Mac
pip install "fastapi[all]" python-dotenv google-generativeai pypdf2 python-docx

GEMINI_API_KEY=your_gemini_api_key_here

uvicorn main:app --reload
```

## 🌐 Frontend Setup
Open frontend/index.html directly in your browser, or use the Live Server extension in VS Code.

## 👨‍💻 Team Code Rangers

1. Digvijay Thakur: Designed and implemented the user interface of the application.

2. Jay Umap: Developed APIs, integrated AI models, and managed server logic.

3. Pradyum Patwari: Assisted in UI design, responsiveness, and frontend debugging.

4. Om Gandharwar: Led problem analysis, project research, and solution brainstorming.

## 📄 Research Paper
To explore the background, motivation, and innovation behind this tool, check out our full research:
📎 AI Legal Assistant – Research Paper

## Watch a video demonstration of this project in action:

## Link - (https://drive.google.com/file/d/1dlE6w3_aN4usfJquTHHtGDVLlOoAz0s7/view?usp=sharing)


## 💬 Feedback & Contributions
We welcome contributions and suggestions from the community!
If you have an idea, issue, or improvement, feel free to open an issue or submit a pull request.
Let’s make legal clarity accessible for everyone.



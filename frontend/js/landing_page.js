// Ensure the script runs after the DOM is fully loaded
window.onload = function() {
    // --- Particle Background Animation (using Three.js) ---
    const canvas = document.getElementById('backgroundCanvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true }); // alpha: true for transparent background

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Improve quality on high-DPI screens

    // Create particles
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x8888ff); // Light blue/purple
    const color2 = new THREE.Color(0xaaaaee); // Lighter blue/purple

    for (let i = 0; i < particleCount; i++) {
        // Position particles randomly in a cube
        positions[i * 3] = (Math.random() - 0.5) * 200; // x
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200; // y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200; // z

        // Assign random color blend
        const color = new THREE.Color();
        color.lerpColors(color1, color2, Math.random());
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.5, // Size of particles
        vertexColors: true, // Use colors defined in geometry
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending // For glowing effect
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    camera.position.z = 100;

    // Animation loop for particles
    function animateParticles() {
        requestAnimationFrame(animateParticles);

        // Rotate the particle system subtly
        particleSystem.rotation.x += 0.0005;
        particleSystem.rotation.y += 0.0008;

        // Move particles slightly
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 1] -= 0.05; // Move particles downwards

            // If a particle goes off-screen, reset its position to the top
            if (positions[i * 3 + 1] < -100) {
                positions[i * 3 + 1] = 100;
            }
        }
        particleSystem.geometry.attributes.position.needsUpdate = true; // Mark positions as updated

        renderer.render(scene, camera);
    }

    animateParticles(); // Start the particle animation

    // Handle window resizing
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- Typing Effect for Slogan ---
    const sloganElement = document.querySelector('.slogan');
    const sloganText = "Your smart partner for contract and compliance analysis.";
    let charIndex = 0;

    function typeSlogan() {
        if (charIndex < sloganText.length) {
            sloganElement.textContent += sloganText.charAt(charIndex);
            charIndex++;
            setTimeout(typeSlogan, 50); // Typing speed (milliseconds per character)
        }
    }

    // Start typing effect after a short delay to align with CSS animation
    setTimeout(() => {
        typeSlogan();
    }, 1500); // Adjust this delay to match when the slogan appears via CSS animation
};
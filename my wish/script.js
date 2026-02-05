// Global variables
const OPENROUTER_API_KEY = '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';
let currentStep = 1;
const totalSteps = 4;
let selectedSkills = [];
let selectedInterests = [];

// Auth State Management
// Auth State Management
async function checkLoginState() {
    let isLoggedIn = false;
    let user = {};

    // Check Supabase Session if available
    if (typeof supabase !== 'undefined' && supabase) {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (session) {
                isLoggedIn = true;
                user = {
                    email: session.user.email,
                    name: session.user.user_metadata?.full_name || 'User'
                };
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userProfile', JSON.stringify(user));
            } else if (localStorage.getItem('isLoggedIn') === 'true') {
                isLoggedIn = true;
                user = JSON.parse(localStorage.getItem('userProfile') || '{}');
            }
        } catch (e) {
            console.error('Supabase error:', e);
            isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            user = JSON.parse(localStorage.getItem('userProfile') || '{}');
        }
    } else {
        isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        user = JSON.parse(localStorage.getItem('userProfile') || '{}');
    }

    const body = document.body;
    const event = new CustomEvent('authChanged', { detail: { isLoggedIn, user } });
    window.dispatchEvent(event);
    updateNavbar(isLoggedIn);
}

function updateNavbar(isLoggedIn) {
    const navControls = document.querySelector('.nav-controls');
    // Early return if not on a page with nav-controls (e.g. login.html might differ)
    if (!navControls) return;

    if (isLoggedIn) {
        // Show Profile/Dashboard
        navControls.innerHTML = `
            <a href="dashboard.html" class="hover:text-purple-200 transition text-sm mr-4">Dashboard</a>
            <div class="relative group">
                <button class="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-white/10 hover:bg-white/20 transition">
                    <i class="fas fa-user"></i>
                </button>
                <div class="absolute right-0 mt-2 w-48 bg-gray-900 rounded-xl shadow-xl border border-white/10 overflow-hidden hidden group-hover:block nav-dropdown">
                    <div class="p-3 border-b border-white/10">
                        <p class="font-bold text-sm truncate" id="navUserName">User</p>
                        <p class="text-xs opacity-70 truncate" id="navUserEmail">user@example.com</p>
                    </div>
                    <a href="settings.html" class="block px-4 py-2 text-sm hover:bg-white/10 transition">
                        <i class="fas fa-cog mr-2"></i> Settings
                    </a>
                    <button onclick="logout()" class="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition text-red-400">
                        <i class="fas fa-sign-out-alt mr-2"></i> Logout
                    </button>
                </div>
            </div>
            <select id="languageSelect" onchange="changeLanguage(this.value)" class="ml-4 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs focus:outline-none text-white hidden md:block">
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Telugu">Telugu</option>
            </select>
        `;

        // Load user info
        const user = JSON.parse(localStorage.getItem('userProfile') || '{}');
        if (user.name) document.getElementById('navUserName').textContent = user.name;
        if (user.email) document.getElementById('navUserEmail').textContent = user.email;

    } else {
        // Show Login/Signup using absolute paths to ensure links work from subpages if needed
        navControls.innerHTML = `
            <a href="login.html" class="px-4 py-2 text-sm font-semibold hover:text-purple-200 transition">Login</a>
            <a href="login.html" class="px-4 py-2 bg-white text-purple-900 rounded-full text-sm font-bold hover:bg-purple-100 transition shadow-lg">Sign Up</a>
            <select id="languageSelect" onchange="changeLanguage(this.value)" class="ml-4 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs focus:outline-none text-white hidden md:block">
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Telugu">Telugu</option>
            </select>
        `;
    }
}

async function logout() {
    if (typeof supabase !== 'undefined' && supabase) {
        await supabase.auth.signOut();
    }

    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('sb-' + (typeof SUPABASE_PROJECT_ID !== 'undefined' ? SUPABASE_PROJECT_ID : '')); // Attempt to clear SDK keys if known

    checkLoginState();
    window.location.href = 'main.html';
}

// Run on load
document.addEventListener('DOMContentLoaded', checkLoginState);

// Language Dictionary
const translations = {
    'English': {
        'nav_home': 'Home', 'nav_ai': 'AI Assistant', 'nav_about': 'About', 'nav_careers': 'Careers',
        'hero_title': 'Discover Your Perfect Career Path', 'hero_desc': 'Our AI-powered engine analyzes your skills, interests, and personality.',
        'btn_start': 'Start Your Journey', 'btn_chat': 'Chat with AI'
    },
    'Hindi': {
        'nav_home': 'होम', 'nav_ai': 'एआई सहायक', 'nav_about': 'हमारे बारे में', 'nav_careers': 'करियर',
        'hero_title': 'अपना सही करियर पथ खोजें', 'hero_desc': 'हमारा एआई इंजन आपके कौशल, रुचियों और व्यक्तित्व का विश्लेषण करता है।',
        'btn_start': 'यात्रा शुरू करें', 'btn_chat': 'एआई से बात करें'
    },
    'Telugu': {
        'nav_home': 'హోమ్', 'nav_ai': 'AI అసిస్టెంట్', 'nav_about': 'గురించి', 'nav_careers': 'కెరీర్లు',
        'hero_title': 'మీ సరైన కెరీర్ మార్గాన్ని కనుగొనండి', 'hero_desc': 'మా AI ఇంజిన్ మీ నైపుణ్యాలు, ఆసక్తులు మరియు వ్యక్తిత్వాన్ని విశ్లేషిస్తుంది.',
        'btn_start': 'ప్రారంభించండి', 'btn_chat': 'AIతో చాట్ చేయండి'
    }
};

// Career data
const careers = [
    {
        title: "UX/UI Designer",
        icon: "fa-paint-brush",
        match: 92,
        description: "Create intuitive and visually appealing digital experiences.",
        skills: ["Design", "Creativity", "User Research"],
        salary: "$75,000 - $110,000",
        growth: "+13% (10-year projection)",
        rationale: "Your strong design skills and interest in creative arts make this a perfect match. The field combines your technical abilities with your creative vision."
    },
    {
        title: "Data Scientist",
        icon: "fa-chart-line",
        match: 88,
        description: "Analyze complex data to help organizations make better decisions.",
        skills: ["Analytics", "Programming", "Research"],
        salary: "$95,000 - $165,000",
        growth: "+22% (10-year projection)",
        rationale: "Your analytical skills and interest in technology align perfectly with this high-growth field. Data science offers excellent compensation and remote work opportunities."
    },
    {
        title: "Product Manager",
        icon: "fa-tasks",
        match: 85,
        description: "Guide product development from concept to launch.",
        skills: ["Leadership", "Communication", "Project Management"],
        salary: "$85,000 - $145,000",
        growth: "+10% (10-year projection)",
        rationale: "Your leadership abilities and communication skills make you well-suited for overseeing product development. This role balances technical and business aspects."
    },
    {
        title: "Digital Marketing Specialist",
        icon: "fa-bullhorn",
        match: 82,
        description: "Create and execute online marketing strategies.",
        skills: ["Marketing", "Analytics", "Communication"],
        salary: "$60,000 - $95,000",
        growth: "+8% (10-year projection)",
        rationale: "Your marketing skills combined with analytical thinking position you well in this evolving field. Digital marketing offers creative and analytical challenges."
    },
    {
        title: "Software Developer",
        icon: "fa-code",
        match: 78,
        description: "Build and maintain software applications.",
        skills: ["Programming", "Problem Solving", "Analytics"],
        salary: "$80,000 - $140,000",
        growth: "+15% (10-year projection)",
        rationale: "Your programming skills and interest in technology make this a solid career choice. The field offers excellent growth potential and flexibility."
    }
];

// Navigation helper
function showSection(sectionId) {
    ['landing', 'assessment', 'results', 'ai-assistant'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === sectionId) el.classList.remove('hidden');
            else el.classList.add('hidden');
        }
    });
}

// Dashboard Navigation
function showDashboardSection(sectionId) {
    // Hide all sections
    ['dashboard-home', 'assessment-section', 'ai-assistant-section', 'roadmap-section', 'compiler-section', 'library-section'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    // Show selected section
    const selected = document.getElementById(sectionId);
    if (selected) selected.classList.remove('hidden');

    // Update active state on sidebar links
    document.querySelectorAll('.menu-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`[onclick*="${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');
}

// Start assessment
function startAssessment() {
    const landing = document.getElementById('landing');
    const assessment = document.getElementById('assessment');

    if (landing && assessment) {
        landing.classList.add('hidden');
        assessment.classList.remove('hidden');
        updateProgress();
    } else {
        // If elements don't exist (e.g. on main page linking to dashboard)
        window.location.href = 'dashboard.html';
    }
}

// Change step in assessment
function changeStep(direction) {
    // Hide current step
    document.getElementById(`step${currentStep}`).classList.add('hidden');

    // Update step indicators
    const currentIndicator = document.querySelector(`.step-indicator[data-step="${currentStep}"]`);
    if (currentIndicator) {
        currentIndicator.classList.remove('active');
        currentIndicator.classList.add('completed');
    }

    // Update current step
    currentStep += direction;

    // Show new step
    document.getElementById(`step${currentStep}`).classList.remove('hidden');
    const newIndicator = document.querySelector(`.step-indicator[data-step="${currentStep}"]`);
    if (newIndicator) newIndicator.classList.add('active');

    // Update buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    if (prevBtn) prevBtn.classList.toggle('hidden', currentStep === 1);
    if (nextBtn) nextBtn.classList.toggle('hidden', currentStep === totalSteps);
    if (submitBtn) submitBtn.classList.toggle('hidden', currentStep !== totalSteps);

    // Update progress
    updateProgress();
}

// Update progress bar
function updateProgress() {
    const percent = (currentStep / totalSteps) * 100;
    const currentStepEl = document.getElementById('currentStep');
    const progressPercentEl = document.getElementById('progressPercent');
    const progressFillEl = document.getElementById('progressFill');

    if (currentStepEl) currentStepEl.textContent = currentStep;
    if (progressPercentEl) progressPercentEl.textContent = Math.round(percent);
    if (progressFillEl) progressFillEl.style.width = `${percent}%`;
}

// Handle skill selection
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.skill-tag').forEach(tag => {
        tag.addEventListener('click', function () {
            this.classList.toggle('selected');
            const skill = this.getAttribute('data-skill');

            if (this.classList.contains('selected')) {
                selectedSkills.push(skill);
            } else {
                selectedSkills = selectedSkills.filter(s => s !== skill);
            }
        });
    });

    // Enter key to send chat message
    const chatInput = document.getElementById('chat-input') || document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Resume Upload Handler
    const fileUpload = document.getElementById('chat-file-upload');
    if (fileUpload) {
        fileUpload.addEventListener('change', function (e) {
            if (this.files && this.files[0]) {
                const fileName = this.files[0].name;
                addChatMessage(`Uploaded: ${fileName}`, 'user');

                // Show analyzing status
                const loadingId = 'analyzing-' + Date.now();
                addChatMessage('<i class="fas fa-spinner fa-spin mr-2"></i>Analyzing resume...', 'bot', loadingId);

                setTimeout(() => {
                    removeChatMessage(loadingId);

                    // Detailed Simulated Response
                    const detailedAnalysis = `
                        <div class="space-y-4">
                            <div class="border-b border-white/10 pb-2">
                                <h4 class="font-bold text-lg text-purple-300">Resume Analysis Report</h4>
                                <p class="text-xs opacity-70">File: ${fileName}</p>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-2">
                                <div class="bg-white/5 p-2 rounded">
                                    <div class="text-xs text-white/50">ATS Score</div>
                                    <div class="text-xl font-bold text-green-400">82/100</div>
                                </div>
                                <div class="bg-white/5 p-2 rounded">
                                    <div class="text-xs text-white/50">Role Match</div>
                                    <div class="text-xl font-bold text-blue-400">High</div>
                                </div>
                            </div>

                            <div>
                                <h5 class="font-semibold text-sm mb-1 text-green-300"><i class="fas fa-check-circle mr-1"></i> Strengths Detected</h5>
                                <ul class="list-disc list-inside text-xs opacity-80 space-y-1">
                                    <li>Strong Project Management Experience</li>
                                    <li>Leadership & Team Coordination</li>
                                    <li>Agile Methodology Keywords</li>
                                </ul>
                            </div>

                            <div>
                                <h5 class="font-semibold text-sm mb-1 text-red-300"><i class="fas fa-exclamation-triangle mr-1"></i> Missing / Weak Areas</h5>
                                <ul class="list-disc list-inside text-xs opacity-80 space-y-1">
                                    <li><strong>Technical Skills:</strong> Python, SQL, Tableau not found.</li>
                                    <li><strong>Certifications:</strong> PMP or Scrum Master recommended.</li>
                                </ul>
                            </div>

                            <button onclick="switchRoadmapTab('skills')" class="w-full bg-purple-600/50 hover:bg-purple-600 p-2 rounded text-xs transition mt-2">
                                <i class="fas fa-magic mr-1"></i> Generate Skill Roadmap
                            </button>
                        </div>
                    `;

                    addChatMessage(detailedAnalysis, 'bot');
                }, 2000);
            }
        });
    }

    // Initialize Voice Control if available
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        initVoiceControl();
    } else {
        console.log("Web Speech API not supported");
    }
});

// Submit assessment
function submitAssessment() {
    // Collect interests
    document.querySelectorAll('#step3 input[type="checkbox"]:checked').forEach(checkbox => {
        selectedInterests.push(checkbox.value);
    });

    // Save data to localStorage
    localStorage.setItem('userSkills', JSON.stringify(selectedSkills));
    localStorage.setItem('userInterests', JSON.stringify(selectedInterests));

    // Redirect to recommendations page
    window.location.href = 'career Recommendations.html';
}

// Display career recommendations
function displayCareerRecommendations() {
    const careerCards = document.getElementById('careerCards');
    if (!careerCards) return;

    careerCards.innerHTML = '';

    // Sort careers by match percentage
    const sortedCareers = [...careers].sort((a, b) => b.match - a.match);

    // Display top 3-5 careers
    sortedCareers.slice(0, 5).forEach((career, index) => {
        const card = document.createElement('div');
        card.className = 'career-card rounded-2xl p-4';
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                    <i class="fas ${career.icon} text-white"></i>
                </div>
                <div class="text-right">
                    <div class="text-xl font-bold">${career.match}%</div>
                    <div class="text-xs opacity-80">Match</div>
                </div>
            </div>
            <h3 class="text-base font-bold mb-2">${career.title}</h3>
            <p class="text-xs opacity-90 mb-4">${career.description}</p>
            <div class="mb-4">
                <div class="text-xs opacity-70 mb-2">Key Skills</div>
                <div class="flex flex-wrap gap-2">
                    ${career.skills.map(skill => `<span class="text-xs px-2 py-1 rounded-full bg-white/20">${skill}</span>`).join('')}
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-4 text-xs">
                <div>
                    <div class="text-xs opacity-70">Salary Range</div>
                    <div class="font-semibold">${career.salary}</div>
                </div>
                <div>
                    <div class="text-xs opacity-70">Growth</div>
                    <div class="font-semibold">${career.growth}</div>
                </div>
            </div>
            <div class="border-t border-white/10 pt-4">
                <div class="text-xs opacity-70 mb-1">Why this career?</div>
                <p class="text-xs opacity-90">${career.rationale}</p>
            </div>
            <button class="w-full mt-4 btn-glass py-1.5 rounded-lg text-xs font-semibold">
                Learn More <i class="fas fa-arrow-right ml-1"></i>
            </button>
        `;

        careerCards.appendChild(card);
    });
}

// Restart assessment
function restartAssessment() {
    // Reset form
    currentStep = 1;
    selectedSkills = [];
    selectedInterests = [];

    // Reset skill tags
    document.querySelectorAll('.skill-tag').forEach(tag => {
        tag.classList.remove('selected');
    });

    // Reset checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Reset step indicators
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
        indicator.classList.remove('active', 'completed');
        if (index === 0) indicator.classList.add('active');
    });

    // Show landing page or reset dashboard view
    const results = document.getElementById('results');
    const assessment = document.getElementById('assessment');
    const landing = document.getElementById('landing');

    if (results) results.classList.add('hidden');
    if (assessment) assessment.classList.remove('hidden');
    if (landing) landing.classList.remove('hidden');

    updateProgress();
}

async function sendMessage() {
    const input = document.getElementById('chat-input') || document.getElementById('chatInput');
    const message = input.value.trim();
    const languageSelect = document.getElementById('languageSelect');
    const voiceLanguageSelect = document.getElementById('voiceLanguageSelect');
    // Default to English if element missing
    const language = languageSelect ? languageSelect.value : 'English';
    const voiceLang = voiceLanguageSelect ? voiceLanguageSelect.value : 'en-US';

    if (!message) return;

    // Add user message
    addChatMessage(message, 'user');

    // Clear input
    input.value = '';

    // Check if API key is set (using OpenRouter key now)
    if (!OPENROUTER_API_KEY) {
        setTimeout(() => {
            addChatMessage("Please configure your Gemini API Key in the code (variable GEMINI_API_KEY) to enable the real AI model. Showing simulation for now.", 'bot');
            const responses = [
                "That's a great question! Based on your profile, I'd recommend exploring careers in technology or design.",
                "I understand your concern. Many people find career transitions challenging, but with the right preparation, it's definitely achievable.",
                "Our algorithm considers multiple factors including your skills, interests, and work preferences to provide personalized recommendations.",
                "The job market is constantly evolving. That's why we focus on careers with strong growth potential and long-term stability."
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addChatMessage(randomResponse, 'bot');
        }, 1000);
        return;
    }

    // Show loading indicator
    const loadingId = 'loading-' + Date.now();
    addChatMessage('<i class="fas fa-circle-notch fa-spin mr-2"></i>Thinking...', 'bot', loadingId);

    try {
        // Map voice lang code to language name for AI context
        const langMap = {
            'en-US': 'English',
            'hi-IN': 'Hindi',
            'te-IN': 'Telugu',
            'es-ES': 'Spanish',
            'fr-FR': 'French'
        };
        const aiLanguage = langMap[voiceLang] || language || 'English';

        const context = `You are a helpful career counseling AI assistant named Nex AI. 
        User Profile - Skills: ${selectedSkills.join(', ') || 'None selected'}, Interests: ${selectedInterests.join(', ') || 'None selected'}.
        User Query: ${message}.
        IMPORTANT: You MUST respond ONLY in ${aiLanguage}. Translate your entire response to ${aiLanguage}.`;

        // Direct call to OpenRouter
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                // Add header to prevent CORS issues if needed, though usually OK with OpenRouter
            },
            body: JSON.stringify({
                model: "openai/gpt-3.5-turbo", // or "mistralai/mistral-7b-instruct" for free tier
                messages: [{ role: "system", content: context }, { role: "user", content: message }]
            })
        });

        const data = await response.json();
        removeChatMessage(loadingId);

        if (data.choices && data.choices[0].message) {
            const aiText = data.choices[0].message.content.replace(/\n/g, '<br>');
            speakText(data.choices[0].message.content, voiceLang);
            addChatMessage(aiText, 'bot');
        } else {
            console.warn("API Error or No Choices:", data);
            throw new Error("API returned invalid data"); // Trigger fallback
        }
    } catch (error) {
        removeChatMessage(loadingId);
        console.error("AI Service failed, switching to simulation:", error);

        // FALBACK SIMULATION
        const responses = [
            "That's an interesting point! Based on your interest in " + (selectedInterests[0] || "technology") + ", I think you'd do great.",
            "I can certainly help with that. Have you considered looking into certification courses to boost your profile?",
            "Your skills in " + (selectedSkills[0] || "problem solving") + " are highly valued in the current market.",
            "I recommend updating your resume to highlight your recent projects. Would you like me to review it?",
            "Focusing on building a portfolio is key. Try adding some real-world projects."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage(randomResponse, 'bot');
        speakText(randomResponse, voiceLang);
    }
}

function removeChatMessage(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
}

function addChatMessage(message, sender, id = null) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'mb-3 fade-in';
    if (id) messageDiv.id = id;

    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="flex justify-end">
                <div class="glass p-3 rounded-lg max-w-xs">
                    <p class="text-sm">${message}</p>
                </div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="flex">
                <div class="glass p-3 rounded-lg max-w-xs">
                    <p class="text-sm">${message}</p>
                </div>
            </div>
        `;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// --- Voice Control & Language Logic ---

let recognition;
let isListening = false;
const synth = window.speechSynthesis;

function initVoiceControl() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log("Voice Command:", transcript);
        handleVoiceCommand(transcript);
    };

    recognition.onend = () => {
        isListening = false;
        updateMicVisuals(false);
    };
}

function toggleVoiceControl() {
    if (!recognition) return alert("Voice control not supported.");

    // Get selected language for recognition
    const voiceLanguageSelect = document.getElementById('voiceLanguageSelect');
    const selectedLang = voiceLanguageSelect ? voiceLanguageSelect.value : 'en-US';

    if (isListening) {
        recognition.stop();
    } else {
        recognition.lang = selectedLang; // Set recognition language
        recognition.start();
        isListening = true;
        updateMicVisuals(true);
        speakText("Listening...", selectedLang);
    }
}

function updateMicVisuals(active) {
    const btn = document.getElementById('chatMicBtn');
    if (btn) {
        if (active) {
            btn.classList.add('bg-red-500', 'animate-pulse');
            btn.classList.remove('bg-white/10');
        } else {
            btn.classList.remove('bg-red-500', 'animate-pulse');
            btn.classList.add('bg-white/10');
        }
    }
}

function handleVoiceCommand(command) {
    // Navigation Commands
    if (command.includes('home') || command.includes('dashboard')) {
        window.location.href = 'dashboard.html';
        speakText("Going to dashboard", "English");
    } else if (command.includes('login') || command.includes('sign in')) {
        window.location.href = 'login.html';
        speakText("Opening login page", "English");
    } else if (command.includes('scroll down')) {
        window.scrollBy(0, 500);
    } else if (command.includes('scroll up')) {
        window.scrollBy(0, -500);
    }
    // Chat / Input
    else {
        const chatInput = document.getElementById('chat-input') || document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = command;
            sendMessage();
        }
    }
}

function speakText(text, languageCode) {
    if (synth.speaking) synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // languageCode is already in BCP 47 format (e.g., 'en-US', 'hi-IN')
    utterance.lang = languageCode || 'en-US';

    // Try to find a voice that matches the language
    const voices = synth.getVoices();
    const matchingVoice = voices.find(voice => voice.lang === languageCode);
    if (matchingVoice) {
        utterance.voice = matchingVoice;
    }

    synth.speak(utterance);
}

function changeLanguage(lang) {
    // Simple text replacement for demo purposes
    // In a full app, you'd use a framework or loop through data-i18n attributes
    console.log("Language changed to:", lang);
    // Logic to update UI text based on 'translations' object would go here
}
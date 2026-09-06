const canvas = document.getElementById('labCanvas');
const ctx = canvas.getContext('2d');

// Load Exact High-Quality Icons
const likeImg = new Image();
likeImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>';

const dislikeImg = new Image();
dislikeImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>';

let mode = 'straight';
let isSwitchOn = false;
let currentDirection = 'DOWN'; // 'DOWN' / 'UP'
let showHand = true;
let isMalayalam = false;

let flowOffset = 0;
let fieldRotation = 0;
let score = 0;
let qIdx = 0;
let answered = false;

const defaultQuestions = [
    {
        q_en: "When current flows DOWNWARDS (Top to Bottom), how should the Right Hand be positioned?",
        q_ml: "കറന്റ് മുകളിൽ നിന്ന് താഴേക്ക് (Top to Bottom) ഒഴുകുമ്പോൾ വലതുകൈ എങ്ങനെയാണ് പിടിക്കേണ്ടത്?",
        options_en: ["Right Hand Thumb DOWN 👎", "Right Hand Thumb UP 👍", "Left Hand DOWN"],
        options_ml: ["വലതുകൈ തമ്പ് താഴേക്ക് 👎 (Dislike)", "വലതുകൈ തമ്പ് മുകളിലേക്ക് 👍 (Like)", "ഇടതുകൈ താഴേക്ക്"],
        correct: 0,
        exp_en: "Current Top to Bottom -> Right-Hand Thumb DOWN (Dislike position).",
        exp_ml: "കറന്റ് താഴേക്ക് പോകുമ്പോൾ വലതുകൈയുടെ പെരുവിരൽ താഴേക്ക് (Dislike 👎 പോലെ) പിടിക്കണം."
    },
    {
        q_en: "When current in a circular loop is CLOCKWISE, what is the magnetic field direction inside?",
        q_ml: "ലൂപ്പിലൂടെ കറന്റ് CLOCKWISE ദിശയിൽ ഒഴുകുമ്പോൾ കോയിലിനുള്ളിലെ കാന്തികമണ്ഡലത്തിന്റെ ദിശ ഏതാണ്?",
        options_en: ["Inward into the coil (⊗)", "Outward from the coil (⊙)", "Parallel"],
        options_ml: ["കോയിലിനുള്ളിലേക്ക് (Inward ⊗)", "കോയിലിന് പുറത്തേക്ക് (Outward ⊙)", "സമാന്തരം"],
        correct: 0,
        exp_en: "Clockwise current produces an INWARD magnetic field (⊗) inside the loop.",
        exp_ml: "ക്ലോക്ക്‌വൈസ് കറന്റ് ലൂപ്പിനുള്ളിലേക്ക് (Inward ⊗) കാന്തികമണ്ഡലം ഉണ്ടാക്കുന്നു."
    },
    {
        q_en: "When current in a circular loop is ANTICLOCKWISE, what is the flux direction inside?",
        q_ml: "ലൂപ്പിൽ കറന്റ് ANTICLOCKWISE ദിശയിലാണെങ്കിൽ അതിനുള്ളിലെ ഫ്ലക്സ് ദിശ എങ്ങോട്ടാണ്?",
        options_en: ["Outward from the coil (⊙)", "Inward into the coil (⊗)", "Zero"],
        options_ml: ["കോയിലിന് പുറത്തേക്ക് (Outward ⊙)", "കോയിലിനുള്ളിലേക്ക് (Inward ⊗)", "സീറോ"],
        correct: 0,
        exp_en: "Anticlockwise current produces an OUTWARD magnetic field (⊙) inside the loop.",
        exp_ml: "ആന്റി-ക്ലോക്ക്‌വൈസ് കറന്റ് ലൂപ്പിന് പുറത്തേക്ക് (Outward ⊙) ഫ്ലക്സ് ഉണ്ടാക്കുന്നു."
    },
    {
        q_en: "When current flows UPWARDS in a straight wire, what is the magnetic field direction?",
        q_ml: "നേർരേഖാ കണ്ടക്ടറിൽ കറന്റ് മുകളിലേക്ക് (Bottom to Top) ഒഴുകുമ്പോൾ കാന്തികമണ്ഡലത്തിന്റെ ദിശ ഏതാണ്?",
        options_en: ["Anti-Clockwise", "Clockwise", "No Field"],
        options_ml: ["അപ്രദക്ഷിണദിശ (Anti-Clockwise)", "പ്രദക്ഷിണദിശ (Clockwise)", "കാന്തികമണ്ഡലമില്ല"],
        correct: 0,
        exp_en: "Current Bottom to Top -> Right-Hand Thumb UP 👍 -> Anti-Clockwise field.",
        exp_ml: "കറന്റ് മുകളിലേക്ക് പോകുമ്പോൾ വലതുകൈ തമ്പ് മുകളിലേക്ക് 👍 -> അപ്രദക്ഷിണദിശ (Anti-Clockwise)."
    },
    {
        q_en: "Which rule helps us find the direction of magnetic field lines around a conductor?",
        q_ml: "കണ്ടക്ടറിന് ചുറ്റുമുള്ള കാന്തികമണ്ഡലത്തിന്റെ ദിശ അറിയാൻ ഏത് നിയമമാണ് ഉപയോഗിക്കുന്നത്?",
        options_en: ["Right-Hand Thumb Rule", "Left-Hand Rule", "Ohm's Law"],
        options_ml: ["വലതുകൈ പെരുവിരൽ നിയമം (Right-Hand Thumb Rule)", "ഇടതുകൈ നിയമം", "ഓംസ് ലോ"],
        correct: 0,
        exp_en: "Always use the Right-Hand Thumb Rule for magnetic field directions.",
        exp_ml: "എപ്പോഴും വലതുകൈ പെരുവിരൽ നിയമം തന്നെയാണ് ഉപയോഗിക്കേണ്ടത്."
    }
];

let questions = [...defaultQuestions];

function switchMode(newMode) {
    mode = newMode;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (mode === 'straight') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('canvasTitle').innerText = '🔬 Straight Conductor Circuit Lab';
        document.getElementById('handBtn').style.display = 'inline-block';
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('canvasTitle').innerText = '🔬 Circular Loop Circuit Lab (Fig 4.8)';
        document.getElementById('handBtn').style.display = 'none';
    }
    updateStatus();
}

function toggleSwitch() {
    isSwitchOn = !isSwitchOn;
    document.getElementById('switchBtn').innerText = isSwitchOn ? '🔴 Switch OFF' : '🔌 Switch ON';
    document.getElementById('switchBtn').classList.toggle('btn-active', isSwitchOn);
    updateStatus();
}

function reverseCurrent() {
    currentDirection = (currentDirection === 'DOWN') ? 'UP' : 'DOWN';
    updateStatus();
}

function toggleHand() {
    showHand = !showHand;
    document.getElementById('handBtn').classList.toggle('btn-active', showHand);
}

function toggleLanguage() {
    isMalayalam = !isMalayalam;
    loadQuestion();
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}

function updateStatus() {
    const sb = document.getElementById('statusBox');
    if (!isSwitchOn) {
        sb.innerHTML = "<strong>Status:</strong> Switch is OFF. No current flow or magnetic field.";
        return;
    }

    if (mode === 'straight') {
        if (currentDirection === 'DOWN') {
            sb.innerHTML = "<strong>Current Flow:</strong> Top to Bottom (+ to -).<br><strong>Right Hand Guide:</strong> Thumb DOWN 👎 (Clockwise Result).<br><strong>Magnetic Field:</strong> Clockwise (പ്രദക്ഷിണം).";
        } else {
            sb.innerHTML = "<strong>Current Flow:</strong> Bottom to Top (+ to -).<br><strong>Right Hand Guide:</strong> Thumb UP 👍 (Anti-Clockwise Result).<br><strong>Magnetic Field:</strong> Anti-Clockwise (അപ്രദക്ഷിണം).";
        }
    } else {
        if (currentDirection === 'DOWN') {
            sb.innerHTML = "<strong>Loop Current:</strong> Clockwise (പ്രദക്ഷിണദിശ).<br><strong>Internal Magnetic Field:</strong> INWARD into the coil (⊗ - പേജിലേക്ക് അകത്തേക്ക്).";
        } else {
            sb.innerHTML = "<strong>Loop Current:</strong> Anticlockwise (അപ്രദക്ഷിണദിശ).<br><strong>Internal Magnetic Field:</strong> OUTWARD from the coil (⊙ - പേജിന് പുറത്തേക്ക്).";
        }
    }
}

function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 - 20;

    if (mode === 'straight') {
        drawStraightMode(cx, cy);
    } else {
        drawLoopMode(cx, cy);
    }

    if (isSwitchOn) {
        flowOffset = (flowOffset + 0.06) % (Math.PI * 2);
        fieldRotation += (currentDirection === 'DOWN') ? 0.05 : -0.05;
    }

    requestAnimationFrame(drawScene);
}

function drawStraightMode(cx, cy) {
    // Base Cardboard
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 140, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Wire Conductor
    ctx.fillStyle = '#cb5e0c';
    ctx.fillRect(cx - 8, cy - 120, 16, 240);

    // Wire Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px Arial';
    ctx.fillText('Top', cx + 20, cy - 100);
    ctx.fillText('Bottom', cx + 20, cy + 110);

    // Circuit Connections
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 120);
    ctx.lineTo(cx - 180, cy - 120);
    ctx.lineTo(cx - 180, cy + 160);
    ctx.lineTo(cx - 20, cy + 160);

    ctx.moveTo(cx, cy + 120);
    ctx.lineTo(cx + 180, cy + 120);
    ctx.lineTo(cx + 180, cy + 160);
    ctx.lineTo(cx + 80, cy + 160);
    ctx.stroke();

    drawBatteryAndSwitch(cx, cy + 160);

    if (isSwitchOn) {
        for (let r = 50; r <= 110; r += 30) {
            ctx.beginPath();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.ellipse(cx, cy, r, r * 0.35, 0, 0, Math.PI * 2);
            ctx.stroke();

            const arrowAngle = fieldRotation + (r * 0.1);
            const ax = cx + r * Math.cos(arrowAngle);
            const ay = cy + (r * 0.35) * Math.sin(arrowAngle);
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(ax, ay, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Current Motion Dots
        ctx.fillStyle = '#ef4444';
        let offsetPx = (flowOffset / (Math.PI * 2)) * 25;
        for (let y = cy - 110; y <= cy + 100; y += 25) {
            let drawY = (currentDirection === 'DOWN') ? (y + offsetPx) : (y - offsetPx);
            if (drawY >= cy - 110 && drawY <= cy + 100) {
                ctx.beginPath();
                ctx.arc(cx, drawY, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    if (showHand) {
        const imgToDraw = (currentDirection === 'UP') ? likeImg : dislikeImg;
        ctx.drawImage(imgToDraw, cx + 55, cy - 40, 80, 80);
    }
}

// CIRCULAR LOOP MODE (FIG 4.8)
function drawLoopMode(cx, cy) {
    const rx = 110;
    const ry = 110;

    // Base
    ctx.fillStyle = '#854d0e';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 20, 170, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Loop Wire
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(cx, cy - 20, rx, 0, Math.PI * 2);
    ctx.stroke();

    // Connectors
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy + 90);
    ctx.lineTo(cx - 180, cy + 90);
    ctx.lineTo(cx - 180, cy + 160);
    ctx.lineTo(cx - 20, cy + 160);

    ctx.moveTo(cx + 30, cy + 90);
    ctx.lineTo(cx + 180, cy + 90);
    ctx.lineTo(cx + 180, cy + 160);
    ctx.lineTo(cx + 80, cy + 160);
    ctx.stroke();

    drawBatteryAndSwitch(cx, cy + 160);

    if (isSwitchOn) {
        const isClockwise = (currentDirection === 'DOWN');

        // Current Flow Dots
        const numDots = 10;
        for (let i = 0; i < numDots; i++) {
            let angle = (i * (Math.PI * 2 / numDots)) + (isClockwise ? flowOffset : -flowOffset);
            let dx = cx + rx * Math.cos(angle);
            let dy = (cy - 20) + ry * Math.sin(angle);

            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(dx, dy, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (isClockwise) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy - 20, 32, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(cx - 15, cy - 35); ctx.lineTo(cx + 15, cy - 5);
            ctx.moveTo(cx + 15, cy - 35); ctx.lineTo(cx - 15, cy - 5);
            ctx.stroke();

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('INWARD FIELD (⊗)', cx, cy + 30);
            ctx.font = '12px Arial';
            ctx.fillText('(Clockwise Current -> Into Page)', cx, cy + 48);
        } else {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy - 20, 32, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(cx, cy - 20, 9, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = 'bold 16px Arial';
            ctx.fillText('OUTWARD FIELD (⊙)', cx, cy + 30);
            ctx.font = '12px Arial';
            ctx.fillText('(Anticlockwise Current -> Out of Page)', cx, cy + 48);
        }
    } else {
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Switch ON to observe Current Flow & Magnetic Field', cx, cy - 20);
    }
}

function drawBatteryAndSwitch(cx, baseY) {
    const isDown = (currentDirection === 'DOWN');

    ctx.fillStyle = isDown ? '#ef4444' : '#3b82f6';
    ctx.fillRect(cx - 20, baseY - 15, 15, 30);

    ctx.fillStyle = isDown ? '#3b82f6' : '#ef4444';
    ctx.fillRect(cx + 5, baseY - 25, 15, 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Arial';
    ctx.fillText(isDown ? '+' : '-', cx - 16, baseY - 20);
    ctx.fillText(isDown ? '-' : '+', cx + 9, baseY - 30);

    ctx.fillStyle = isSwitchOn ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.arc(cx + 50, baseY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(isSwitchOn ? 'ON' : 'OFF', cx + 40, baseY + 25);
}

function loadQuestion() {
    answered = false;
    const q = questions[qIdx];
    document.getElementById('qProgress').innerText = `Question ${qIdx + 1} of ${questions.length}`;
    document.getElementById('qText').innerText = isMalayalam ? q.q_ml : q.q_en;

    const optList = document.getElementById('optionsList');
    optList.innerHTML = '';
    document.getElementById('explanationBox').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';

    if (qIdx >= 4) {
        document.getElementById('finishBtn').style.display = 'inline-flex';
        document.getElementById('aiBtn').style.display = 'inline-flex';
    } else {
        document.getElementById('finishBtn').style.display = 'none';
        document.getElementById('aiBtn').style.display = 'none';
    }

    const opts = isMalayalam ? q.options_ml : q.options_en;
    opts.forEach((opt, idx) => {
        const div = document.createElement('div');
        div.className = 'quiz-option';
        div.innerText = opt;
        div.onclick = () => checkAns(idx, div);
        optList.appendChild(div);
    });
}

function checkAns(selectedIdx, selectedEl) {
    if (answered) return;
    answered = true;

    const q = questions[qIdx];
    const allOptions = document.querySelectorAll('.quiz-option');

    allOptions.forEach((el, idx) => {
        el.classList.add('disabled');
        if (idx === q.correct) el.classList.add('correct');
    });

    if (selectedIdx === q.correct) {
        score += 10;
        document.getElementById('scoreText').innerText = `⭐ ${score} PTS`;
    } else {
        selectedEl.classList.add('wrong');
    }

    const expBox = document.getElementById('explanationBox');
    expBox.style.display = 'block';
    expBox.innerHTML = `<strong>Explanation:</strong> ${isMalayalam ? q.exp_ml : q.exp_en}`;

    document.getElementById('nextBtn').style.display = 'inline-flex';
}

function nextQuestion() {
    if (qIdx < questions.length - 1) {
        qIdx++;
        loadQuestion();
    } else {
        generateAIQuestion();
    }
}

function generateAIQuestion() {
    const aiQ = {
        q_en: `AI Question ${questions.length + 1}: What indicates magnetic field direction inside a circular loop?`,
        q_ml: `AI ചോദ്യം ${questions.length + 1}: സർക്കുലർ ലൂപ്പിനുള്ളിലെ കാന്തികമണ്ഡലത്തിന്റെ ദിശ ഏതാണ് കാണിക്കുന്നത്?`,
        options_en: ["Direction of Current Flow (Clockwise / Anticlockwise)", "Battery Voltage", "Wire Length"],
        options_ml: ["കറന്റിന്റെ ചുറ്റൽ ദിശ (Clockwise / Anticlockwise)", "ബാറ്ററി വോൾട്ടേജ്", "വയറിന്റെ നീളം"],
        correct: 0,
        exp_en: "Clockwise current gives Inward Field (⊗), Anticlockwise current gives Outward Field (⊙).",
        exp_ml: "ക്ലോക്ക്‌വൈസ് കറന്റ് അകത്തേക്കും (⊗), ആന്റി-ക്ലോക്ക്‌വൈസ് കറന്റ് പുറത്തേക്കും (⊙) ഫ്ലക്സ് നൽകുന്നു."
    };
    questions.push(aiQ);
    qIdx = questions.length - 1;
    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('resultScreen').style.display = 'none';
    loadQuestion();
}

function finishQuiz() {
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'block';
    document.getElementById('finalScoreText').innerText = `Your Total Score: ${score} PTS`;
}

function resumeAIQuiz() {
    generateAIQuestion();
}

function restartQuiz() {
    score = 0;
    qIdx = 0;
    questions = [...defaultQuestions];
    document.getElementById('scoreText').innerText = `⭐ 0 PTS`;
    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('resultScreen').style.display = 'none';
    loadQuestion();
}

drawScene();
loadQuestion();
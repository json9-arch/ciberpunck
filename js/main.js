/* ------------------------------------------------------------------ */
        /* 1. SOUND FX ENGINE (Web Audio API - Retro Synth Clicks)            */
        /* ------------------------------------------------------------------ */
        let audioEnabled = true;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        let audioCtx = null;

        function playSynthClick(freq = 440, type = 'sine', duration = 0.05) {
            if (!audioEnabled) return;
            try {
                if (!audioCtx) audioCtx = new AudioCtx();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + duration);
            } catch (e) {
                // Audio context suppressed until user gesture
            }
        }

        function toggleAudio() {
            audioEnabled = !audioEnabled;
            const icon = document.getElementById('sound-icon');
            const btn = document.getElementById('sound-btn');
            if (audioEnabled) {
                icon.className = 'fa-solid fa-volume-high';
                btn.classList.remove('border-red-500/40', 'text-red-400');
                btn.classList.add('border-electric-cyan/40', 'text-electric-cyan');
                playSynthClick(880, 'square');
            } else {
                icon.className = 'fa-solid fa-volume-xmark';
                btn.classList.remove('border-electric-cyan/40', 'text-electric-cyan');
                btn.classList.add('border-red-500/40', 'text-red-400');
            }
        }

        /* ------------------------------------------------------------------ */
        /* 2. SPA TAB SWITCHING NAVIGATION SYSTEM                             */
        /* ------------------------------------------------------------------ */
        function switchTab(tabId) {
            playSynthClick(587, 'triangle');

            const pageMap = {
                inicio: 'index.html',
                modos: 'index.html#modos',
                js: 'javascript.html',
                jquery: 'jquery.html',
                json: 'json.html',
                hosting: 'hosting.html',
                quiz: 'cuestionario.html'
            };

            const target = pageMap[tabId];
            if (!target) return;

            // On the home page, "modos" is a section of index.html.
            if ((tabId === 'inicio' || tabId === 'modos') && location.pathname.endsWith('index.html')) {
                document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
                const selectedTab = document.getElementById(`tab-${tabId}`);
                if (selectedTab) selectedTab.classList.remove('hidden');
                window.scrollTo({ top: tabId === 'modos' ? document.getElementById('tab-modos').offsetTop - 80 : 0, behavior: 'smooth' });
                return;
            }

            // If the target is the current page, just scroll to its content.
            const current = location.pathname.split('/').pop() || 'index.html';
            const targetPage = target.split('#')[0];
            if (current === targetPage) {
                if (target.includes('#')) {
                    const id = target.split('#')[1];
                    const el = document.getElementById(id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                return;
            }

            window.location.href = target;
        }

        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
            playSynthClick(440, 'sine');
        }

        /* ------------------------------------------------------------------ */
        /* 3. INTERACTIVE PRICE CALCULATOR & TICKET GENERATOR                 */
        /* ------------------------------------------------------------------ */
        let currentCalcState = {
            mode: 'rubber', // rubber ($25), anime ($40), cyber ($60)
            format: 'headshot', // headshot ($0), half (+$15), full (+$30)
        };

        const MODE_PRICES = { rubber: 25, anime: 40, cyber: 60 };
        const FORMAT_PRICES = { headshot: 0, half: 15, full: 30 };
        const MODE_NAMES = { rubber: 'Rubber Hose (Retro 30s)', anime: 'Anime Clásico (90s)', cyber: 'Cyber Glow' };
        const FORMAT_NAMES = { headshot: 'Headshot / Avatar', half: 'Half Body', full: 'Full Body' };

        function updateCalc(type, val) {
            playSynthClick(784, 'sine');
            currentCalcState[type] = val;

            // Highlight buttons
            if (type === 'mode') {
                document.querySelectorAll('.calc-mode-btn').forEach(b => {
                    b.className = 'calc-mode-btn p-3 rounded border border-gray-700 bg-deep-space text-gray-400 font-mono text-xs';
                });
                const active = document.getElementById(`btn-mode-${val}`);
                active.className = 'calc-mode-btn p-3 rounded border border-electric-cyan bg-electric-cyan/20 text-white font-bold font-mono text-xs';
            }

            if (type === 'format') {
                document.querySelectorAll('.calc-format-btn').forEach(b => {
                    b.className = 'calc-format-btn p-3 rounded border border-gray-700 bg-deep-space text-gray-400 font-mono text-xs';
                });
                const active = document.getElementById(`btn-format-${val}`);
                active.className = 'calc-format-btn p-3 rounded border border-neon-magenta bg-neon-magenta/20 text-white font-bold font-mono text-xs';
            }

            calculateTotal();
        }

        function selectModeInCalc(modeKey) {
            if (location.pathname.split('/').pop() === 'index.html' || location.pathname.split('/').pop() === '') {
                const modes = document.getElementById('tab-modos');
                if (modes) modes.classList.remove('hidden');
                const calculator = document.getElementById('calculator-section');
                if (calculator) {
                    updateCalc('mode', modeKey);
                    calculator.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                window.location.href = `index.html#modos`;
            }
        }

        function calculateTotal() {
            const totalEl = document.getElementById('total-price');
            const ticketEl = document.getElementById('ticket-preview');
            if (!totalEl || !ticketEl) return;

            let basePrice = MODE_PRICES[currentCalcState.mode] + FORMAT_PRICES[currentCalcState.format];

            const hasBg = document.getElementById('extra-bg')?.checked;
            const hasChar = document.getElementById('extra-char')?.checked;
            const hasComm = document.getElementById('extra-commercial')?.checked;

            let total = basePrice;
            if (hasBg) total += 25;
            if (hasChar) total += Math.round(basePrice * 0.7);
            if (hasComm) total += 40;

            totalEl.textContent = `$${total} USD`;
            updateTicketText(total);
        }

        function updateTicketText(totalVal = 25) {
            const nameInput = document.getElementById('client-name').value.trim() || 'Anon';
            const hasBg = document.getElementById('extra-bg').checked ? 'Fondo Neón (+$25)' : null;
            const hasChar = document.getElementById('extra-char').checked ? 'Personaje Extra (+70%)' : null;
            const hasComm = document.getElementById('extra-commercial').checked ? 'Licencia Comercial (+$40)' : null;

            const extrasList = [hasBg, hasChar, hasComm].filter(Boolean).join(', ') || 'Ninguno';

            const ticketContent = `[ CYBER ART COMMISSIONS TICKET ]
• Cliente / Nickname: ${nameInput}
• Modo Seleccionado: ${MODE_NAMES[currentCalcState.mode]}
• Formato Cobertura: ${FORMAT_NAMES[currentCalcState.format]}
• Extras Incluidos: ${extrasList}
• Total Estimado: $${totalVal} USD
• Estado Ticket: LISTO PARA ENVIAR`;

            document.getElementById('ticket-preview').textContent = ticketContent;
        }

        function copyTicket() {
            playSynthClick(1046, 'square');
            const textToCopy = document.getElementById('ticket-preview').textContent;
            
            // Clipboard fallback as specified
            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                const notif = document.getElementById('copy-notification');
                notif.classList.remove('hidden');
                setTimeout(() => notif.classList.add('hidden'), 3000);
            } catch (err) {
                console.error('Error al copiar ticket', err);
            }
            document.body.removeChild(textarea);
        }

        /* ------------------------------------------------------------------ */
        /* 4. JAVASCRIPT & JQUERY INTERACTIVE DEMOS                           */
        /* ------------------------------------------------------------------ */
        let jsCount = 0;
        function runJsDemo() {
            playSynthClick(659, 'sawtooth');
            jsCount++;
            const display = document.getElementById('js-demo-counter');
            display.textContent = `Cargas Neón: ${jsCount}`;
            display.classList.add('scale-110');
            setTimeout(() => display.classList.remove('scale-110'), 150);
        }

        // jQuery events on DOM ready
        $(document).ready(function() {
            $('#jq-fade-btn').on('click', function() {
                playSynthClick(523, 'sine');
                $('#jq-target-box').fadeToggle(300);
            });

            $('#jq-slide-btn').on('click', function() {
                playSynthClick(698, 'sine');
                $('#jq-target-box').slideToggle(300);
            });
        });

        /* ------------------------------------------------------------------ */
        /* 5. JSON PARSER DEMO TOOL                                          */
        /* ------------------------------------------------------------------ */
        function parseJsonDemo() {
            playSynthClick(880, 'sine');
            const inputVal = document.getElementById('json-input').value;
            const outputDiv = document.getElementById('json-output');

            try {
                const parsedObj = JSON.parse(inputVal);
                let html = `<span class="text-neon-green font-bold">✓ JSON VÁLIDO PARSEADO EN MEMORIA:</span><br><br>`;
                for (let key in parsedObj) {
                    html += `<span class="text-electric-cyan">${key}</span>: <span class="text-acid-yellow">${JSON.stringify(parsedObj[key])}</span><br>`;
                }
                outputDiv.innerHTML = html;
            } catch (err) {
                outputDiv.innerHTML = `<span class="text-red-400 font-bold">✗ ERROR DE SINTAXIS JSON:</span><br><span class="text-gray-400">${err.message}</span>`;
            }
        }

        /* ------------------------------------------------------------------ */
        /* 6. DNS PROPAGATION FLOW VISUALIZER                                 */
        /* ------------------------------------------------------------------ */
        const DNS_STEPS = {
            1: "<strong>Paso 1:</strong> El usuario escribe 'cyberartcomisiones.vercel.app' en el navegador. La solicitud verifica el caché local.",
            2: "<strong>Paso 2:</strong> El ISP (Proveedor de Internet) consulta el Servidor DNS Recursivo para traducir el dominio a IP.",
            3: "<strong>Paso 3:</strong> Los Servidores Raíz e IP de NameServers de Vercel responden con el registro A/CNAME oficial.",
            4: "<strong>Paso 4:</strong> La dirección IP del Servidor CDN de Vercel es retornada y la web responde en milisegundos."
        };

        function stepDns(stepNum) {
            playSynthClick(400 + (stepNum * 100), 'triangle');
            document.getElementById('dns-explanation').innerHTML = DNS_STEPS[stepNum];

            for (let i = 1; i <= 4; i++) {
                const el = document.getElementById(`dns-step-${i}`);
                if (i === stepNum) {
                    el.className = 'p-3 rounded bg-electric-cyan/20 border border-electric-cyan text-white cursor-pointer font-bold';
                } else {
                    el.className = 'p-3 rounded bg-deep-space border border-gray-800 text-gray-400 cursor-pointer hover:bg-electric-cyan/10';
                }
            }
        }

        /* ------------------------------------------------------------------ */
        /* 7. CUESTIONARIO INTERACTIVO WEB ENGINE                             */
        /* ------------------------------------------------------------------ */
        const QUIZ_QUESTIONS = [
            {
                q: "1. ¿Cuál es el rol principal de JavaScript en la tríada del desarrollo web frente a HTML y CSS?",
                options: [
                    "A) Definir la estructura y etiquetas semánticas de la página.",
                    "B) Proporcionar dinamismo, lógica de programación y manejo de eventos.",
                    "C) Aplicar estilos visuales neón y tipografías responsive.",
                    "D) Almacenar la base de datos de manera física en el servidor."
                ],
                correct: 1,
                explanation: "JavaScript se encarga del comportamiento y la lógica interactiva del cliente."
            },
            {
                q: "2. ¿Cómo se declara una variable constante inmutable en JS moderno (ES6)?",
                options: ["A) var", "B) let", "C) const", "D) define"],
                correct: 2,
                explanation: "'const' permite crear variables cuyo identificador no puede ser reasignado."
            },
            {
                q: "3. ¿Por qué nació históricamente la librería jQuery?",
                options: [
                    "A) Para reemplazar completamente a HTML en los servidores.",
                    "B) Para simplificar la sintaxis del DOM y resolver inconsistencias entre navegadores.",
                    "C) Para diseñar interfaces en 3D con WebGL.",
                    "D) Para enviar correos electrónicos sin necesidad de servidor."
                ],
                correct: 1,
                explanation: "jQuery abstrajo las diferencias de compatibilidad entre navegadores como IE y Firefox."
            },
            {
                q: "4. ¿Cuál es la sintaxis selector básica de jQuery?",
                options: ["A) select('selector')", "B) $('selector').accion()", "C) DOM.get('selector')", "D) #selector.run()"],
                correct: 1,
                explanation: "El símbolo '$' es el caracter principal para seleccionar nodos en jQuery."
            },
            {
                q: "5. En JSON, ¿cuál es una regla obligatoria referente a las claves (keys)?",
                options: [
                    "A) No pueden contener números.",
                    "B) Deben ir siempre encerradas entre comillas dobles (\"\").",
                    "C) Deben escribirse en mayúsculas sostenidas.",
                    "D) Deben ser variables globales de JavaScript."
                ],
                correct: 1,
                explanation: "En la especificación JSON estricta, todas las claves deben usar comillas dobles."
            },
            {
                q: "6. ¿Qué función nativa de JavaScript convierte un Objeto en una cadena formateada JSON?",
                options: ["A) JSON.parse()", "B) JSON.stringify()", "C) Object.toJSON()", "D) String.fromJSON()"],
                correct: 1,
                explanation: "JSON.stringify() serializa objetos en cadenas de texto JSON."
            },
            {
                q: "7. ¿Qué tipo de plataforma de despliegue es Vercel para proyectos web?",
                options: [
                    "A) Un servidor de base de datos SQL relacional.",
                    "B) Una plataforma Cloud optimizada para hosting estático Jamstack y CI/CD desde GitHub.",
                    "C) Un registrador privado de nombres de dominio .com únicamente.",
                    "D) Un editor de imágenes cibernéticas en la nube."
                ],
                correct: 1,
                explanation: "Vercel permite desplegar sitios estáticos y de frontend directamente sincronizados con GitHub."
            },
            {
                q: "8. ¿Qué significa TLD en el contexto de un Nombre de Dominio Web?",
                options: [
                    "A) Technical Level Data",
                    "B) Top-Level Domain (Dominio de Nivel Superior como .com, .net, .org)",
                    "C) Terminal Logic Display",
                    "D) Transfer Layer Device"
                ],
                correct: 1,
                explanation: "TLD es la extensión final de un nombre de dominio (.com, .net, .app, etc.)."
            }
        ];

        let userAnswers = {};

        function renderQuiz() {
            const container = document.getElementById('quiz-questions-container');
            container.innerHTML = '';

            QUIZ_QUESTIONS.forEach((qObj, qIdx) => {
                const card = document.createElement('div');
                card.className = 'cyber-glass p-5 rounded-lg border border-gray-800 space-y-3';
                card.id = `q-card-${qIdx}`;

                let optionsHtml = '';
                qObj.options.forEach((opt, optIdx) => {
                    optionsHtml += `
                        <button onclick="selectQuizOption(${qIdx}, ${optIdx})" id="q-opt-${qIdx}-${optIdx}" class="q-opt-btn w-full text-left p-3 rounded bg-deep-space border border-gray-800 hover:border-electric-cyan font-mono text-xs text-gray-300 transition">
                            ${opt}
                        </button>
                    `;
                });

                card.innerHTML = `
                    <div class="font-mono font-bold text-sm text-white">${qObj.q}</div>
                    <div class="space-y-2">${optionsHtml}</div>
                    <div id="q-feedback-${qIdx}" class="hidden p-3 rounded font-mono text-xs mt-2"></div>
                `;

                container.appendChild(card);
            });
        }

        function selectQuizOption(qIdx, optIdx) {
            if (userAnswers[qIdx] !== undefined) return; // Prevent changing answer

            playSynthClick(700, 'sine');
            userAnswers[qIdx] = optIdx;

            const qObj = QUIZ_QUESTIONS[qIdx];
            const feedbackDiv = document.getElementById(`q-feedback-${qIdx}`);
            feedbackDiv.classList.remove('hidden');

            // Disable all options for this question
            const card = document.getElementById(`q-card-${qIdx}`);
            const buttons = card.querySelectorAll('.q-opt-btn');

            buttons.forEach((btn, idx) => {
                btn.onclick = null; // remove handler
                if (idx === qObj.correct) {
                    btn.className = 'q-opt-btn w-full text-left p-3 rounded bg-neon-green/20 border border-neon-green font-mono text-xs text-white font-bold';
                } else if (idx === optIdx && optIdx !== qObj.correct) {
                    btn.className = 'q-opt-btn w-full text-left p-3 rounded bg-red-500/20 border border-red-500 font-mono text-xs text-red-300';
                } else {
                    btn.className = 'q-opt-btn w-full text-left p-3 rounded bg-deep-space/50 border border-gray-800 font-mono text-xs text-gray-600';
                }
            });

            if (optIdx === qObj.correct) {
                feedbackDiv.className = 'p-3 rounded bg-neon-green/10 border border-neon-green text-neon-green font-mono text-xs';
                feedbackDiv.innerHTML = `<strong>¡CORRECTO!</strong> ${qObj.explanation}`;
            } else {
                feedbackDiv.className = 'p-3 rounded bg-red-500/10 border border-red-500 text-red-400 font-mono text-xs';
                feedbackDiv.innerHTML = `<strong>INCORRECTO.</strong> ${qObj.explanation}`;
            }

            updateScore();
        }

        function updateScore() {
            let score = 0;
            const answeredCount = Object.keys(userAnswers).length;

            for (let qIdx in userAnswers) {
                if (userAnswers[qIdx] === QUIZ_QUESTIONS[qIdx].correct) {
                    score++;
                }
            }

            document.getElementById('quiz-score').textContent = score;

            if (answeredCount === QUIZ_QUESTIONS.length) {
                const resultCard = document.getElementById('quiz-result-card');
                resultCard.classList.remove('hidden');

                const title = document.getElementById('quiz-grade-title');
                const desc = document.getElementById('quiz-grade-desc');

                if (score >= 7) {
                    title.textContent = "GRADE S // CYBER ARCHITECT";
                    desc.textContent = "¡Excelente! Has superado la autoevaluación con honores cibernéticos.";
                } else if (score >= 5) {
                    title.textContent = "GRADE A // WEB RUNNER";
                    desc.textContent = "Buen trabajo. Tienes un dominio sólido de los conceptos clave.";
                } else {
                    title.textContent = "GRADE C // REVISIÓN REQUERIDA";
                    desc.textContent = "Te sugerimos repasar las secciones de JS, jQuery y JSON en el menú superior.";
                }

                resultCard.scrollIntoView({ behavior: 'smooth' });
            }
        }

        function resetQuiz() {
            playSynthClick(440, 'square');
            userAnswers = {};
            document.getElementById('quiz-score').textContent = '0';
            document.getElementById('quiz-result-card').classList.add('hidden');
            renderQuiz();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        /* ------------------------------------------------------------------ */
        /* 8. APPLICATION INITIALIZATION                                      */
        /* ------------------------------------------------------------------ */
        window.addEventListener('DOMContentLoaded', function() {
            if (document.getElementById('calculator-section')) calculateTotal();
            if (document.getElementById('quiz-questions-container')) renderQuiz();

            // Home-page anchor support
            if (location.hash === '#modos' && document.getElementById('tab-modos')) {
                document.getElementById('tab-modos').classList.remove('hidden');
                document.getElementById('tab-inicio')?.classList.add('hidden');
                setTimeout(() => document.getElementById('tab-modos')?.scrollIntoView({ behavior: 'smooth' }), 50);
            }

            console.log("%c CYBER ART COMMISSIONS // TERMINAL ONLINE ", "background: #0A0012; color: #00F0FF; font-size: 14px; font-weight: bold; border: 1px solid #00F0FF; padding: 4px;");
        });

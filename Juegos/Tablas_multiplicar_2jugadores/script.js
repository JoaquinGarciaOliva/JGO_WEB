document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a elementos del DOM ---
    const scoreElementP1 = document.getElementById('score-p1');
    const scoreElementP2 = document.getElementById('score-p2');
    const nameInputP1 = document.getElementById('player1-name-input');
    const nameInputP2 = document.getElementById('player2-name-input');
    const tableSelect = document.getElementById('table-select');
    const timeSelect = document.getElementById('time-select');
    const shuffleCheckbox = document.getElementById('shuffle-checkbox');
    const timerElement = document.getElementById('timer');
    const startButton = document.getElementById('start-button');
    const cardArea = document.getElementById('multiplication-card');
    const buttonsContainerP1 = document.getElementById('result-buttons-p1');
    const buttonsContainerP2 = document.getElementById('result-buttons-p2');

    // --- Variables de Estado del Juego ---
    let scores = { p1: 0, p2: 0 };
    let currentTable = 1;
    let currentMultiplier = 1;
    let currentAnswer = 0;
    let isGameRunning = false;
    let countdownInterval;
    let timeLeft;

    // --- Funciones de Utilidad ---

    /**
     * Función para mezclar un array (Algoritmo Fisher-Yates).
     */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Actualiza los marcadores de puntos en el DOM.
     */
    function updateScoreDisplay() {
        scoreElementP1.textContent = scores.p1;
        scoreElementP2.textContent = scores.p2;
    }

    /**
     * Genera la siguiente multiplicación y actualiza la tarjeta.
     */
    function nextMultiplication() {
        currentTable = parseInt(tableSelect.value);
        currentMultiplier = Math.floor(Math.random() * 10) + 1; // 1 a 10
        currentAnswer = currentTable * currentMultiplier;

        // Muestra la multiplicación en la tarjeta
        cardArea.textContent = `${currentTable} x ${currentMultiplier} = ?`;

        // Resetear los botones
        updateResultButtons(buttonsContainerP1);
        updateResultButtons(buttonsContainerP2);
    }

    /**
     * Crea e inserta los 10 botones de respuesta en el contenedor dado.
     * @param {HTMLElement} container - El div para los botones (p1 o p2).
     */
    function updateResultButtons(container) {
        // Limpiar botones anteriores
        const buttonsTitle = container.querySelector('.buttons-title');
        container.innerHTML = '';
        container.appendChild(buttonsTitle); // Reinsertar el título

        // Obtener los 10 resultados de la tabla (1x1 a 1x10, etc.)
        let allTableResults = Array.from({ length: 10 }, (_, i) => currentTable * (i + 1));
        let buttonValues;

        if (shuffleCheckbox.checked) {
            buttonValues = shuffleArray([...allTableResults]); // Copiar y mezclar
        } else {
            buttonValues = allTableResults; // Usar ordenados
        }

        // Crear los 10 botones
        for (let i = 0; i < 10; i++) {
            const value = buttonValues[i];
            const button = document.createElement('button');
            button.className = 'result-btn';
            button.textContent = value;
            button.setAttribute('data-value', value);
            button.disabled = !isGameRunning;
            container.appendChild(button);
        }
    }

    /**
     * Maneja el clic en un botón de resultado.
     * @param {Event} event - El evento de clic.
     * @param {string} playerId - 'p1' o 'p2'.
     */
    function handleResultClick(event, playerId) {
        if (!isGameRunning) return;

        const button = event.target;
        const selectedValue = parseInt(button.getAttribute('data-value'));

        // Deshabilitar botones de AMBOS jugadores después de la primera respuesta
        const allButtons = document.querySelectorAll('.result-btn');
        allButtons.forEach(btn => btn.disabled = true);

        let isCorrect;

        if (selectedValue === currentAnswer) {
            scores[playerId] += 1;
            button.classList.add('correct');
            isCorrect = true;
        } else {
            scores[playerId] -= 1;
            button.classList.add('incorrect');
            isCorrect = false;
        }

        updateScoreDisplay();

        // Mostrar feedback rápido y pasar a la siguiente pregunta
        setTimeout(() => {
            // Limpiar clases de feedback (no es necesario en este modelo, ya que la botonera se regenera en nextMultiplication)
            
            // Generar la siguiente pregunta INMEDIATAMENTE
            nextMultiplication(); 
            
            // Los botones se habilitan automáticamente en nextMultiplication al regenerarse
        }, 300); // 0.3 segundos de feedback visual
    }


    // --- Funciones del Temporizador ---

    /**
     * Actualiza el contador de tiempo en el DOM.
     */
    function updateTimerDisplay() {
        const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
        const seconds = String(timeLeft % 60).padStart(2, '0');
        timerElement.textContent = `${minutes}:${seconds}`;
        
        if (timeLeft <= 10) {
            timerElement.style.color = 'red';
        } else {
            timerElement.style.color = '#e91e63';
        }
    }

    /**
     * Inicia o reanuda el temporizador.
     */
    function startTimer() {
        countdownInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                endGame();
            }
        }, 1000);
    }

    // --- Lógica del Juego ---

    /**
     * Inicia el juego.
     */
    function startGame() {
        if (isGameRunning) return;

        isGameRunning = true;
        scores = { p1: 0, p2: 0 };
        timeLeft = parseInt(timeSelect.value);
        updateScoreDisplay();
        startButton.textContent = "¡JUGANDO!";
        startButton.classList.add('disabled');
        startButton.disabled = true;

        // Deshabilitar controles y campos de nombre
        tableSelect.disabled = true;
        timeSelect.disabled = true;
        shuffleCheckbox.disabled = true;
        nameInputP1.disabled = true;
        nameInputP2.disabled = true;


        nextMultiplication(); // Generar la primera pregunta y botones
        startTimer(); // Iniciar el temporizador
    }

    /**
     * Finaliza el juego.
     */
    function endGame() {
        isGameRunning = false;
        clearInterval(countdownInterval);

        const winner = scores.p1 > scores.p2 ? nameInputP1.value : 
                       scores.p2 > scores.p1 ? nameInputP2.value : 
                       'Empate';
        
        const message = winner === 'Empate' 
            ? `¡Tiempo terminado! Es un **EMPATE** con ${scores.p1} puntos cada uno.`
            : `¡Tiempo terminado! El ganador es **${winner}** con ${Math.max(scores.p1, scores.p2)} puntos.`;

        // Actualizar la interfaz
        cardArea.textContent = message;
        startButton.textContent = "INICIAR JUEGO";
        startButton.classList.remove('disabled');
        startButton.disabled = false;
        
        // Habilitar controles y campos de nombre
        tableSelect.disabled = false;
        timeSelect.disabled = false;
        shuffleCheckbox.disabled = false;
        nameInputP1.disabled = false;
        nameInputP2.disabled = false;
        
        // Deshabilitar botones de respuesta
        const allButtons = document.querySelectorAll('.result-btn');
        allButtons.forEach(btn => btn.disabled = true);

        alert(message);
    }

    // --- Escuchadores de Eventos ---

    startButton.addEventListener('click', startGame);

    // Event Delegation para el Jugador 1
    buttonsContainerP1.addEventListener('click', (event) => {
        if (event.target.classList.contains('result-btn')) {
            handleResultClick(event, 'p1');
        }
    });

    // Event Delegation para el Jugador 2
    buttonsContainerP2.addEventListener('click', (event) => {
        if (event.target.classList.contains('result-btn')) {
            handleResultClick(event, 'p2');
        }
    });

    // Eventos de cambio para regenerar botones cuando no está jugando
    const controlsToRegenerate = [tableSelect, shuffleCheckbox];
    controlsToRegenerate.forEach(control => {
        control.addEventListener('change', () => {
            if (!isGameRunning) {
                updateResultButtons(buttonsContainerP1);
                updateResultButtons(buttonsContainerP2);
            }
        });
    });
    
    // Inicialización al cargar la página
    timeLeft = parseInt(timeSelect.value); // Obtener el valor inicial de tiempo
    updateScoreDisplay();
    updateTimerDisplay();
    // Generar la botonera inicial, pero deshabilitada
    updateResultButtons(buttonsContainerP1);
    updateResultButtons(buttonsContainerP2);
});
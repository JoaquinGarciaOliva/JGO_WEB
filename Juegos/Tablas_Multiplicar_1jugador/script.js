document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a elementos del DOM ---
    const scoreElement = document.getElementById('score');
    const tableSelect = document.getElementById('table-select');
    const shuffleCheckbox = document.getElementById('shuffle-checkbox');
    const timerElement = document.getElementById('timer');
    const startButton = document.getElementById('start-button');
    const cardArea = document.getElementById('multiplication-card');
    const resultButtonsContainer = document.getElementById('result-buttons');
    const resultButtons = document.querySelectorAll('.result-btn');

    // --- Variables de Estado del Juego ---
    let score = 0;
    let currentTable = 1;
    let currentMultiplier = 1;
    let currentAnswer = 0;
    let isGameRunning = false;
    let countdownInterval;

    const GAME_DURATION = 120; // 2 minutos en segundos
    let timeLeft = GAME_DURATION;

    // --- Funciones de Utilidad ---

    /**
     * Función para mezclar un array (Algoritmo Fisher-Yates).
     * @param {Array} array - El array a mezclar.
     * @returns {Array} El array mezclado.
     */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Actualiza el marcador de puntos en el DOM.
     */
    function updateScoreDisplay() {
        scoreElement.textContent = score;
    }

    /**
     * Genera la siguiente multiplicación y actualiza la tarjeta.
     */
    function nextMultiplication() {
        currentTable = parseInt(tableSelect.value);
        
        // Genera un multiplicador aleatorio del 1 al 10
        currentMultiplier = Math.floor(Math.random() * 10) + 1; 

        currentAnswer = currentTable * currentMultiplier;

        // Muestra la multiplicación en la tarjeta
        cardArea.textContent = `${currentTable} x ${currentMultiplier} = ?`;

        updateResultButtons();
    }

    /**
     * Actualiza los 10 botones de resultados.
     */
    function updateResultButtons() {
        // Obtenemos los 10 resultados de la tabla (1x1 a 1x10, 2x1 a 2x10, etc.)
        let allTableResults = Array.from({ length: 10 }, (_, i) => currentTable * (i + 1));
        
        // La lista de números que aparecerán en los botones.
        let buttonValues;

        if (shuffleCheckbox.checked) {
            // Si está marcado, usamos los 10 resultados de la tabla y los mezclamos
            buttonValues = shuffleArray(allTableResults);
        } else {
            // Si no está marcado, simplemente usamos los números del 1 al 10 de la tabla de forma ordenada
            buttonValues = allTableResults;
        }

        // Asignar los valores y atributos a los botones
        resultButtons.forEach((button, index) => {
            const value = buttonValues[index];
            button.textContent = value;
            button.setAttribute('data-value', value);
            button.classList.remove('disabled', 'correct', 'incorrect');
            button.disabled = !isGameRunning;
        });
    }

    /**
     * Maneja el clic en un botón de resultado.
     * @param {Event} event - El evento de clic.
     */
    function handleResultClick(event) {
        if (!isGameRunning) return;

        const button = event.target;
        const selectedValue = parseInt(button.getAttribute('data-value'));

        // Deshabilitar todos los botones temporalmente para evitar clics dobles
        resultButtons.forEach(btn => btn.disabled = true);

        if (selectedValue === currentAnswer) {
            score += 1;
            button.classList.add('correct');
        } else {
            score -= 1;
            button.classList.add('incorrect');
        }

        updateScoreDisplay();

        // Esperar un momento antes de la siguiente pregunta
        setTimeout(() => {
            // Limpiar las clases de feedback
            button.classList.remove('correct', 'incorrect');
            
            // Generar la siguiente pregunta
            nextMultiplication();
            
            // Habilitar los botones de nuevo
            resultButtons.forEach(btn => btn.disabled = false);
        }, 500); // 0.5 segundos de feedback visual
    }


    // --- Funciones del Temporizador ---

    /**
     * Actualiza el contador de tiempo en el DOM.
     */
    function updateTimerDisplay() {
        const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
        const seconds = String(timeLeft % 60).padStart(2, '0');
        timerElement.textContent = `${minutes}:${seconds}`;
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
        score = 0;
        timeLeft = GAME_DURATION;
        updateScoreDisplay();
        startButton.textContent = "¡JUGANDO!";
        startButton.classList.add('disabled');
        startButton.disabled = true;

        // Deshabilitar controles de selección de tabla y checkbox durante el juego
        tableSelect.disabled = true;
        shuffleCheckbox.disabled = true;

        nextMultiplication(); // Generar la primera pregunta
        startTimer(); // Iniciar el temporizador
    }

    /**
     * Finaliza el juego.
     */
    function endGame() {
        isGameRunning = false;
        clearInterval(countdownInterval);

        // Actualizar la interfaz
        cardArea.textContent = `¡Tiempo terminado! Tu puntuación final es: ${score}`;
        startButton.textContent = "INICIAR JUEGO";
        startButton.classList.remove('disabled');
        startButton.disabled = false;
        
        // Habilitar controles de selección de tabla y checkbox
        tableSelect.disabled = false;
        shuffleCheckbox.disabled = false;
        
        // Deshabilitar botones de respuesta
        resultButtons.forEach(btn => btn.disabled = true);

        alert(`¡Juego Terminado! Tu puntuación final es: ${score} puntos.`);
    }

    // --- Escuchadores de Eventos ---

    startButton.addEventListener('click', startGame);

    // Adjuntar el manejador de clic a los botones de resultado
    resultButtonsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('result-btn')) {
            handleResultClick(event);
        }
    });

    // Evento para regenerar los botones cuando se cambie la tabla o el checkbox (aunque deshabilitados durante el juego)
    tableSelect.addEventListener('change', () => {
        if (!isGameRunning) updateResultButtons();
    });

    shuffleCheckbox.addEventListener('change', () => {
        if (!isGameRunning) updateResultButtons();
    });
    
    // Inicialización al cargar la página
    updateScoreDisplay();
    updateTimerDisplay();
    // Inicialmente, los botones están deshabilitados hasta que se presione Iniciar
    resultButtons.forEach(btn => btn.disabled = true);
    updateResultButtons(); 
});
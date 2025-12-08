document.addEventListener('DOMContentLoaded', () => {
    // --- Selectores del DOM ---
    const cardContainer = document.querySelector('.card-container');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const newOperationsButton = document.getElementById('newOperationsButton');
    const flipSpeedSelect = document.getElementById('flipSpeed');
    const numCardsSelect = document.getElementById('numCardsSelect');
    const timeLimitSelect = document.getElementById('timeLimitSelect');
    const multiplicationTableSelect = document.getElementById('multiplicationTableSelect'); // Del archivo 1
    const randomizeAnswersCheckbox = document.getElementById('randomizeAnswers');           // Del archivo 1

    // Se asume que estos contenedores existen en el HTML para la botonera de 2 jugadores
    const player1ButtonsContainer = document.getElementById('player1Buttons');
    const player2ButtonsContainer = document.getElementById('player2Buttons');

    // --- Variables de Estado ---
    const totalCards = 2; // Número de tarjetas visibles simultáneamente
    let cardData = [];
    let currentCardIndex = 0;
    let isWaiting = false;
    let isGameRunning = false;
    let flipDelay = null;
    let autoFlipTimer = null;
    let selectedTable = null; // Para la tabla de multiplicar fija

    // 🔢 PUNTUACIONES (De Lógica 2: Competición)
    let player1Score = 0;
    let player2Score = 0;

    let totalShown = 0;
    let roundLimit = null;

    // ⏱ TEMPORIZADOR (De Lógica 2: Competición)
    let timeRemaining = null;
    let countdownInterval = null;

    // --- Funciones auxiliares ---

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /* ────────────────────────────────
        POBLACIÓN DE SELECTS Y TEMPORIZADOR
    ───────────────────────────────── */

    function populateFlipSpeed() {
        flipSpeedSelect.innerHTML = "";
        const blankOption = document.createElement("option");
        blankOption.value = "";
        blankOption.textContent = "";
        blankOption.selected = true;
        flipSpeedSelect.appendChild(blankOption);

        for (let i = 1; i <= 20; i++) {
            const option = document.createElement("option");
            option.value = i * 1000;
            option.textContent = i;
            flipSpeedSelect.appendChild(option);
        }
    }

    function populateNumCards() {
        numCardsSelect.innerHTML = "";
        const blankOption = document.createElement("option");
        blankOption.value = "";
        blankOption.textContent = "";
        blankOption.selected = true;
        numCardsSelect.appendChild(blankOption);

        for (let i = 10; i <= 200; i += 10) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            numCardsSelect.appendChild(option);
        }
    }

    function populateTimeLimit() {
        timeLimitSelect.innerHTML = "";
        const blankOption = document.createElement("option");
        blankOption.value = "";
        blankOption.textContent = "";
        blankOption.selected = true;
        timeLimitSelect.appendChild(blankOption);

        for (let i = 1; i <= 30; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            timeLimitSelect.appendChild(option);
        }
    }

    // ⭐ INTEGRACIÓN 1: Desplegable de Tablas de Multiplicar
    function populateMultiplicationTable() {
        multiplicationTableSelect.innerHTML = '';
        const blankOption = document.createElement('option');
        blankOption.value = '';
        blankOption.textContent = '';
        blankOption.selected = true;
        multiplicationTableSelect.appendChild(blankOption);

        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            multiplicationTableSelect.appendChild(option);
        }
    }

    function updateCountdownDisplay() {
        const display = document.getElementById('countdownDisplay');

        if (timeRemaining === null) {
            display.textContent = "";
            return;
        }

        const min = Math.floor(timeRemaining / 60);
        const sec = timeRemaining % 60;

        display.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
    }

    function startCountdown() {
        clearInterval(countdownInterval);

        countdownInterval = setInterval(() => {
            if (!isGameRunning) return;

            timeRemaining--;
            updateCountdownDisplay();

            if (timeRemaining <= 0) {
                clearInterval(countdownInterval);
                endGame();
            }
        }, 1000);
    }

    /* ────────────────────────────────
        GENERACIÓN Y ADAPTACIÓN DE OPERACIONES
    ───────────────────────────────── */

    // ⭐ INTEGRACIÓN 2: Generación de Multiplicaciones
  /* ────────────────────────────────
       GENERACIÓN Y ADAPTACIÓN DE OPERACIONES (FUSIONADA)
    ───────────────────────────────── */

    /**
     * FUSIONADO: Combina la lógica de generar 4 operaciones con la selección de tabla.
     */
    function generateOperation() {
        const operations = ['+', '-', '×', '÷'];
        // Si hay una tabla seleccionada, siempre es multiplicación. Si no, es aleatorio entre las 4.
        const operator = selectedTable !== null && selectedTable !== '' 
            ? '×' 
            : operations[Math.floor(Math.random() * operations.length)];

        let topNum;
        let bottomNum;
        let result;

        if (operator === '+') {
            topNum = Math.floor(Math.random() * 11); // 0 a 10
            bottomNum = Math.floor(Math.random() * 11); // 0 a 10
            result = topNum + bottomNum;
        } else if (operator === '-') {
            // Restas: 1 cifra (0 a 9), resultado natural (>= 0)
            let numA = Math.floor(Math.random() * 10);
            let numB = Math.floor(Math.random() * 10);
            topNum = Math.max(numA, numB);
            bottomNum = Math.min(numA, numB);
            result = topNum - bottomNum;
        } else if (operator === '×') {
            let table, multiplier;
            
            if (selectedTable && selectedTable !== 0) {
                table = selectedTable;
                multiplier = Math.floor(Math.random() * 10) + 1; // 1 a 10
            } else {
                table = Math.floor(Math.random() * 10) + 1; // 1 a 10
                multiplier = Math.floor(Math.random() * 10) + 1; // 1 a 10
            }

            topNum = multiplier; 
            bottomNum = table; 
            result = topNum * bottomNum;
        } else if (operator === '÷') {
            const divisor = Math.floor(Math.random() * 10) + 1; // 1 a 10
            const cociente = Math.floor(Math.random() * 10) + 1; // 1 a 10 (el resultado)
            
            topNum = divisor * cociente; // Dividendo (el número grande)
            bottomNum = divisor;         // Divisor (el número del 1 al 10)
            result = cociente;
        }
        
        return { topNum, bottomNum, operator, result };
    }


    /**
     * FUSIONADO: Adapta la generación y habilitación de los 20 botones
     * para el modo de 2 jugadores, aplicando la lógica de operaciones.
     */
    function updateResultButtons() {
        // Limpiar y regenerar botones para ambos jugadores
        player1ButtonsContainer.innerHTML = '';
        player2ButtonsContainer.innerHTML = '';

        const randomize = randomizeAnswersCheckbox.checked;

        let currentCardData = cardData[currentCardIndex];
        if (!currentCardData) {
            currentCardData = generateOperation(); 
        }

        const operator = currentCardData.operator;
        let possibleAnswers = [];
        const correctResult = currentCardData.result;
        let maxNumber = 20;

        // 1. Definir opciones y límite superior
        if (operator === '+') {
            if (correctResult > 20) {
                maxNumber = Math.ceil(correctResult / 5) * 5; 
            }
        } else if (operator === '×') {
            const tableNum = currentCardData.bottomNum;
            for (let i = 1; i <= 10; i++) {
                possibleAnswers.push(tableNum * i);
            }
            possibleAnswers = [...new Set(possibleAnswers)];
            maxNumber = 20; 
        } else { // Resta y División
            maxNumber = 20;
        }

        // 2. Generar el conjunto de números base (del 1 al 20 o más si es suma grande)
        let baseNumbers = [];
        for (let i = 1; i <= maxNumber; i++) {
            baseNumbers.push(i);
        }

        // 3. Modificar la lista de números base según la operación y aleatorización
        if (operator === '×') {
            // Rellenamos los primeros 10 valores con los resultados de la tabla (y desordenamos si toca)
            if (randomize) {
                 possibleAnswers = shuffleArray(possibleAnswers);
            } else {
                 possibleAnswers.sort((a, b) => a - b);
            }
            
            baseNumbers = possibleAnswers.slice(0, 10);
            
            // Si hay menos de 10 resultados, o si necesitamos llegar a 20, rellenamos con el índice numérico
            for (let i = 11; i <= 20; i++) {
                if (i > baseNumbers.length || i <= 20) {
                    baseNumbers.push(i);
                }
            }

        } else if (operator === '-' || operator === '÷') {
             // 1 al 20, ordenado (randomize solo afecta a '×')
             baseNumbers = baseNumbers.slice(0, 20); 
        } else if (operator === '+') {
            // 1 hasta maxNumber, ordenado
            baseNumbers = baseNumbers.slice(0, maxNumber);
        }

        // 4. Aseguramos el 0 al inicio
        let finalOptions = [0, ...baseNumbers];
        const optionsWithoutZero = finalOptions.slice(1); 

        // 5. Función auxiliar para crear y poblar las botoneras
        const populateButtons = (container, playerId) => {
            container.innerHTML = ''; // Limpiar el contenedor antes de rellenar

            // Fila 0: Botón "0"
            const row0 = document.createElement('div');
            row0.classList.add('button-row');
           
            let button0 = document.createElement('button');
            button0.id = 'scoreMarker';
            button0.textContent = '0';
            button0.classList.add('score-button');
            row0.appendChild(button0);
            container.appendChild(row0);

            let buttonValue = 1;
            
            // Generar 4 filas con 5 botones (del 1 al 20)
            for (let r = 0; r < 4; r++) {
                const row = document.createElement('div');
                row.classList.add('button-row');
                
                for (let c = 0; c < 5; c++) {
                    if (buttonValue <= 20) {
                        let button = document.createElement('button');
                        
                        // Asignación del valor
                        let contentValue = optionsWithoutZero[buttonValue - 1] !== undefined ? optionsWithoutZero[buttonValue - 1] : buttonValue;
                        button.textContent = contentValue;
                        button.classList.add('score-button');
                        
                        // Lógica de desactivación
                        if (buttonValue > 10) {
                            // 11 al 20 siempre desactivados, salvo en Suma
                            if (operator !== '+') {
                                button.disabled = true;
                                button.classList.add('disabled-button');
                            }
                        } else if (operator === '×') {
                            // 1 al 10 en multiplicación siempre están activos (muestran resultados de la tabla)
                            button.disabled = false;
                            button.classList.remove('disabled-button');
                        } else if (operator === '-' || operator === '÷') {
                            // 1 al 10 en resta/división siempre están activos
                            button.disabled = false;
                            button.classList.remove('disabled-button');
                        } else if (operator === '+') {
                            // En suma, del 1 al 20 (o más) están activos si son parte de la lista base
                            button.disabled = false;
                            button.classList.remove('disabled-button');
                        }

                        row.appendChild(button);
                        buttonValue++;
                    }
                }
                container.appendChild(row);
            }
        };

        // Poblamos las botoneras de ambos jugadores
        populateButtons(player1ButtonsContainer, 'player1');
        populateButtons(player2ButtonsContainer, 'player2');

        // Re-adjuntar listeners para los botones dinámicamente creados
        attachButtonListeners('player1Buttons', 'player1');
        attachButtonListeners('player2Buttons', 'player2');
    } 

    function createCardElement(data, index) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;

        const imageClass = (index + 1) % 2 === 0 ? 'image-even' : 'image-odd';

        const operationHTML = `
            <div class="operation">
                <span class="num2">${data.topNum}</span>
                <span class="num1-with-sign">
                    <span class="sign">${data.operator}</span>
                    <span class="num1">${data.bottomNum}</span>
                </span>
                <div class="num2-line"></div>
            </div>`;

        card.innerHTML = `
            <div class="card-face card-back ${imageClass}"></div>
            <div class="card-face card-front">
                ${operationHTML}
                <span class="result">${data.result}</span>
            </div>`;

        return card;
    }

    
    /* ────────────────────────────────
        PUNTUACIÓN / FIN DEL JUEGO
    ───────────────────────────────── */

    function updateScoreDisplay() {
        // Actualiza los displays de puntuación de ambos jugadores
        document.getElementById('player1ScoreDisplay').textContent = player1Score;
        document.getElementById('player2ScoreDisplay').textContent = player2Score;
    }

    function endGame() {
        pauseGame();

        document.querySelectorAll('.player-buttons button')
            .forEach(button => button.disabled = true);

        let msg = "";

        if (player1Score > player2Score)
            msg = `¡Jugador 1 GANA! (${player1Score} a ${player2Score})`;
        else if (player2Score > player1Score)
            msg = `¡Jugador 2 GANA! (${player2Score} a ${player1Score})`;
        else
            msg = `¡EMPATE! Ambos jugadores tienen ${player1Score} puntos.`;

        alert(`¡Juego Terminado! \n${msg}`);
    }

    /* ────────────────────────────────
        CONTROL DE PARTIDA Y LÓGICA DE RESPUESTA
    ───────────────────────────────── */

    function initializeCards(resetAll = false) {
        cardContainer.innerHTML = "";
        cardData = [];
        currentCardIndex = 0;

        if (resetAll) {
            totalShown = 0;
            player1Score = 0;
            player2Score = 0;
        }

        // Reset de temporizador
        clearInterval(countdownInterval);
        timeRemaining = timeLimitSelect.value === "" ? null : parseInt(timeLimitSelect.value) * 60;
        updateCountdownDisplay();

        // Generar cartas
        for (let i = 0; i < totalCards; i++)
            cardData.push(generateOperation());

        cardData.forEach((data, idx) =>
            cardContainer.appendChild(createCardElement(data, idx))
        );

        document.querySelectorAll('.card').forEach(card =>
            card.classList.remove('flipped', 'correct', 'wrong')
        );

        document.querySelectorAll('.result').forEach(el => el.style.visibility = "hidden");

        updateScoreDisplay();
        updateResultButtons(); // Importante: Inicializa los botones para la primera carta

        if (isGameRunning) pauseGame();
        else document.querySelectorAll('.player-buttons button').forEach(btn => btn.disabled = true);
    }

    function startGame() {
        if (isGameRunning) return;

        isGameRunning = true;
        startButton.disabled = true;
        pauseButton.disabled = false;

        // Habilitar todos los botones de respuesta
        document.querySelectorAll('.player-buttons button')
            .forEach(btn => btn.disabled = false);

        if (timeRemaining !== null) startCountdown();

        showCurrentCard();
    }

    function pauseGame() {
        isGameRunning = false;
        startButton.disabled = false;
        pauseButton.disabled = true;

        clearTimeout(autoFlipTimer);
        clearInterval(countdownInterval);

        // Deshabilitar todos los botones de respuesta
        document.querySelectorAll('.player-buttons button')
            .forEach(btn => btn.disabled = true);
    }

    function showCurrentCard() {
        if (!isGameRunning) return;

        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.classList.remove('flipped', 'correct', 'wrong'));

        const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"]`);
        if (!currentCard) return;

        currentCard.classList.add('flipped');

        currentCard.querySelector('.result').style.visibility = "hidden";

        // Vuelve a generar los botones para que se adapten a la nueva carta
        updateResultButtons(); 
        
        startAutoFlipTimer();
    }

    function startAutoFlipTimer() {
        clearTimeout(autoFlipTimer);
        if (isGameRunning && flipDelay) {
            autoFlipTimer = setTimeout(() => handleNoResponse(), flipDelay);
        }
    }

    function flipNextCardAfterResponse() {
        if (!isGameRunning) return;

        totalShown++; // Aumentamos el contador de rondas solo *después* de la respuesta.

        // Chequear si el juego debe terminar por límite de rondas
        if (roundLimit !== null && totalShown >= roundLimit) {
            endGame();
            return;
        }

        currentCardIndex = (currentCardIndex + 1) % totalCards;

        if (currentCardIndex === 0) {
            // Recarga y reinicia el ciclo de cartas al inicio del array
            document.querySelectorAll('.card').forEach(card =>
                card.classList.remove('flipped', 'correct', 'wrong')
            );

            setTimeout(() => {
                cardData = [];
                for (let i = 0; i < totalCards; i++) cardData.push(generateOperation());

                document.querySelectorAll('.card').forEach((card, idx) => {
                    const data = cardData[idx];
                    card.querySelector('.num1').textContent = data.bottomNum;
                    card.querySelector('.num2').textContent = data.topNum;
                    card.querySelector('.sign').textContent = data.operator;
                    card.querySelector('.result').textContent = data.result;
                    card.querySelector('.result').classList.remove('show-result', 'correct-answer', 'wrong-answer');
                });

                showCurrentCard();
            }, 650);

        } else showCurrentCard();
    }

    function handleNoResponse() {
        // ... (Lógica de no respuesta: se mantiene igual)
        if (!isGameRunning) return;

        isWaiting = true;
        clearTimeout(autoFlipTimer);

        const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"] .card-front`);
        const parentCard = currentCard.parentElement;
        const resultSpan = currentCard.querySelector('.result');

        resultSpan.style.visibility = "visible";
        resultSpan.classList.add('wrong-answer');
        parentCard.classList.add('wrong');

        setTimeout(() => {
            parentCard.classList.remove('wrong');
            resultSpan.classList.remove('wrong-answer');
            resultSpan.style.visibility = "hidden";
            isWaiting = false;
            flipNextCardAfterResponse();
        }, 1000);
    }

    function handleButtonClick(button, playerId) {
        if (isWaiting || !isGameRunning) return;

        clearTimeout(autoFlipTimer);

        const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"] .card-front`);
        const parentCard = currentCard.parentElement;
        const result = parseInt(currentCard.querySelector('.result').textContent);
        const clickedNumber = parseInt(button.textContent);
        const resultSpan = currentCard.querySelector('.result');

        resultSpan.style.visibility = "visible";
        resultSpan.classList.remove('correct-answer', 'wrong-answer');

        const isCorrect = clickedNumber === result;

        if (isCorrect) {
            parentCard.classList.add('correct');
            resultSpan.classList.add('correct-answer');
        } else {
            parentCard.classList.add('wrong');
            resultSpan.classList.add('wrong-answer');
        }

        // Suma/Resta de puntuación de competición (Lógica 2)
        if (playerId === "player1")
            player1Score += isCorrect ? 1 : -1;
        else
            player2Score += isCorrect ? 1 : -1;

        updateScoreDisplay();
        isWaiting = true;

        setTimeout(() => {
            parentCard.classList.remove('correct', 'wrong');
            resultSpan.classList.remove('correct-answer', 'wrong-answer');
            resultSpan.style.visibility = "hidden";
            isWaiting = false;
            flipNextCardAfterResponse();
        }, 1000);
    }

    function attachButtonListeners(containerId, playerId) {
        // Limpia listeners anteriores (importante al regenerar botones)
        document.querySelectorAll(`#${containerId} button`).forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });

        // Adjunta listeners a todos los botones, incluido el "0"
        document.querySelectorAll(`#${containerId} button`).forEach(btn => {
            btn.addEventListener('click', () => handleButtonClick(btn, playerId));
        });
    }

    /* ────────────────────────────────
        EVENTOS Y INICIALIZACIÓN
    ───────────────────────────────── */

    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', pauseGame);
    newOperationsButton.addEventListener('click', () => initializeCards(true));

    flipSpeedSelect.addEventListener('change', e => {
        flipDelay = e.target.value ? parseInt(e.target.value) : null;
        if (isGameRunning) startAutoFlipTimer();
    });

    numCardsSelect.addEventListener('change', e => {
        roundLimit = e.target.value ? parseInt(e.target.value) : null;
        initializeCards(true);
    });

    timeLimitSelect.addEventListener('change', () => {
        if (timeLimitSelect.value === "") {
            timeRemaining = null;
        } else {
            timeRemaining = parseInt(timeLimitSelect.value) * 60;
        }
        updateCountdownDisplay();
    });

    multiplicationTableSelect.addEventListener('change', e => {
        const tableValue = e.target.value;
        if (tableValue) {
            selectedTable = parseInt(tableValue);
            document.querySelector('header h1').textContent = `Tabla del ${selectedTable}`;
        } else {
            selectedTable = null;
            document.querySelector('header h1').textContent = `Tablas de Multiplicar`;
        }
        initializeCards(true);
    });

    randomizeAnswersCheckbox.addEventListener('change', () => {
        // Los botones se regeneran y re-adjuntan listeners en `updateResultButtons()`
        updateResultButtons(); 
    });
    
    // --- Inicialización ---
    populateFlipSpeed();
    populateNumCards();
    populateTimeLimit();
    populateMultiplicationTable();

    roundLimit = numCardsSelect.value ? parseInt(numCardsSelect.value) : null;
    
    // Inicializa la estructura del juego (genera cartas, establece botones, etc.)
    initializeCards(true);

});
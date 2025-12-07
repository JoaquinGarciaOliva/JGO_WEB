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
    function generateOperation() {
        // Usa selectedTable (de 1 a 10) o elige una aleatoria (1-10)
        const table = selectedTable || (Math.floor(Math.random() * 10) + 1);
        const multiplier = Math.floor(Math.random() * 10) + 1;

        return { topNum: table, bottomNum: multiplier, operator: '×', result: table * multiplier };
    }

    function createCardElement(data, index) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;

        const imageClass = (index + 1) % 2 === 0 ? 'image-even' : 'image-odd';

        const operationHTML = `
            <div class="operation">
                <span class="num2">${data.bottomNum}</span>
                <span class="num1-with-sign">
                    <span class="sign">${data.operator}</span>
                    <span class="num1">${data.topNum}</span>
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

    // ⭐ INTEGRACIÓN 3: Lógica de Botones de Respuesta Adaptable (para 2 jugadores)
    function updateResultButtons() {
        // Limpiar y regenerar botones para ambos jugadores
        player1ButtonsContainer.innerHTML = '';
        player2ButtonsContainer.innerHTML = '';

        const randomize = randomizeAnswersCheckbox.checked;

        let currentCardData;
        if (cardData.length > currentCardIndex) {
            currentCardData = cardData[currentCardIndex];
        } else {
            currentCardData = {
                topNum: selectedTable || 1,
                bottomNum: 1,
                result: selectedTable || 1
            };
        }

        // Base para las opciones de respuesta: el número SUPERIOR (topNum)
        const adaptationBase = currentCardData.topNum;
        let adaptedOptions = [];
        for (let i = 1; i <= 10; i++) {
            adaptedOptions.push(adaptationBase * i);
        }

        let uniqueResults = [...new Set(adaptedOptions)];

        if (randomize) {
            uniqueResults = shuffleArray(uniqueResults);
        }

        // Función auxiliar para crear y poblar las botoneras
        const populateButtons = (container, playerId) => {
            // Fila 0: Botón "0" (scoreMarker)
            const row0 = document.createElement('div');
            row0.classList.add('button-row');
            
            let button0 = document.createElement('button');
            button0.textContent = '0';
            button0.id = `scoreMarker${playerId === 'player1' ? '' : '2'}`; // Asigna IDs únicos
            row0.appendChild(button0);
            container.appendChild(row0);

            const row1 = document.createElement('div');
            row1.classList.add('button-row');
            const row2 = document.createElement('div');
            row2.classList.add('button-row');

            uniqueResults.forEach((result, index) => {
                let button = document.createElement('button');
                const targetRow = index < 5 ? row1 : row2;
                button.textContent = result;
                button.classList.add('multiplication-result-button');
                targetRow.appendChild(button);
            });

            container.appendChild(row1);
            container.appendChild(row2);
        };

        // Poblamos las botoneras de ambos jugadores
        populateButtons(player1ButtonsContainer, 'player1');
        populateButtons(player2ButtonsContainer, 'player2');

        // Re-adjuntar listeners para los botones dinámicamente creados
        attachButtonListeners('player1Buttons', 'player1');
        attachButtonListeners('player2Buttons', 'player2');
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
                    card.querySelector('.num1').textContent = data.topNum;
                    card.querySelector('.num2').textContent = data.bottomNum;
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
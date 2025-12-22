document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.querySelector('.card-container');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const newOperationsButton = document.getElementById('newOperationsButton');
    const flipSpeedSelect = document.getElementById('flipSpeed');
    const playerScoreSpan = document.getElementById('playerScore');
    const numCardsSelect = document.getElementById('numCardsSelect');
    const multiplicationTableSelect = document.getElementById('multiplicationTableSelect');
    const scoreButtonsContainer = document.querySelector('.score-buttons');
    const randomizeAnswersCheckbox = document.getElementById('randomizeAnswers');

    const totalCards = 2;
    let cardData = [];
    let currentCardIndex = 0;
    let isWaiting = false;
    let isGameRunning = false;
    let flipDelay = null;
    let autoFlipTimer = null;
    let selectedTable = null;

    let hits = 0;
    let totalShown = 0;

    let roundLimit = 10;

    // --- Funciones auxiliares ---

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // --- Funciones de Población de Selects (Sin cambios) ---

    function populateFlipSpeed() {
        flipSpeedSelect.innerHTML = '';
        const blankOption = document.createElement('option');
        blankOption.value = '';
        blankOption.textContent = '';
        blankOption.selected = true;
        flipSpeedSelect.appendChild(blankOption);
        for (let i = 1; i <= 20; i++) {
            const option = document.createElement('option');
            option.value = i * 1000;
            option.textContent = i;
            flipSpeedSelect.appendChild(option);
        }
    }

    function populateNumCards() {
        numCardsSelect.innerHTML = '';
        const blankOption = document.createElement('option');
        blankOption.value = '';
        blankOption.textContent = '';
        blankOption.selected = true;
        numCardsSelect.appendChild(blankOption);

        for (let i = 10; i <= 200; i += 10) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            numCardsSelect.appendChild(option);
        }
    }

    // *** FUNCIÓN MODIFICADA: Ahora el texto vacío no es un error ***
    function populateMultiplicationTable() {
        multiplicationTableSelect.innerHTML = '';
        const blankOption = document.createElement('option');
        blankOption.value = '';
        blankOption.textContent = ''; // Solo espacio en blanco
        blankOption.selected = true;
        multiplicationTableSelect.appendChild(blankOption);

        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            const tableText = (i === 0) ? 'Aleatorio' : i;
            option.value = i;
            option.textContent = i; // Solo el número de la tabla
            multiplicationTableSelect.appendChild(option);
        }
    }
    // ************************

    // --- Lógica de Botones de Resultado (MODIFICADA: Adaptación al número de abajo) ---
// ... (código anterior sin cambios)

// --- Lógica de Botones de Resultado (CORREGIDA: Adaptación al número de ARRIBA) ---

function updateResultButtons() {
    scoreButtonsContainer.innerHTML = '';
    const randomize = randomizeAnswersCheckbox.checked;

    // ** Lógica para adaptar la botonera al número de abajo **
    let currentCardData;
    const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"]`);

    // Busca los datos de la carta actual o usa la tabla del 1 como fallback si no hay cartas.
    if (cardData.length > currentCardIndex) {
        currentCardData = cardData[currentCardIndex];
    } else {
        // Caso inicial o sin cartas visibles: usa la tabla seleccionada o la tabla del 1 como base.
        currentCardData = {
            topNum: selectedTable || 1,
            bottomNum: 1,
            result: selectedTable || 1
        };
    }

    // ******************************************************************
    // ** CORRECCIÓN: La base para la botonera debe ser el número SUPERIOR (topNum)
    // ******************************************************************
    const adaptationBase = currentCardData.topNum; // <-- ¡Cambiado a topNum!
    let adaptedOptions = [];
    for (let i = 1; i <= 10; i++) {
        // Genera los resultados de la tabla del número superior: adaptationBase * i
        adaptedOptions.push(adaptationBase * i);
    }


    // Eliminamos duplicados
    let uniqueResults = [...new Set(adaptedOptions)];


    if (randomize) {
        uniqueResults = shuffleArray(uniqueResults);
    }

    const row0 = document.createElement('div');
    row0.classList.add('button-row');
    row0.id = 'button-row-0';

    let button0 = document.createElement('button');
    button0.textContent = '0';
    button0.id = 'scoreMarker';
    row0.appendChild(button0);
    scoreButtonsContainer.appendChild(row0);

    const row1 = document.createElement('div');
    row1.classList.add('button-row');
    row1.id = 'button-row-1-5';

    const row2 = document.createElement('div');
    row2.classList.add('button-row');
    row2.id = 'button-row-6-10';

    uniqueResults.forEach((result, index) => {
        let button = document.createElement('button');
        // Usamos el índice para dividir en dos filas, más de 5 en la segunda
        const targetRow = index < 5 ? row1 : row2;

        button.textContent = result;
        button.classList.add('multiplication-result-button');
        targetRow.appendChild(button);
    });


    scoreButtonsContainer.appendChild(row1);
    scoreButtonsContainer.appendChild(row2);

    document.querySelectorAll('.score-buttons .button-row button').forEach(button => {
        button.addEventListener('click', () => handleButtonClick(button));
    });
}

// ... (resto del código sin cambios)
    // --- Lógica del Juego (MODIFICADA: generateOperation para tabla aleatoria) ---

    // *** FUNCIÓN MODIFICADA ***
    function generateOperation() {
        // Si no hay tabla seleccionada (null), genera un número de tabla aleatorio (1-10)
        const table = selectedTable || (Math.floor(Math.random() * 10) + 1);
        const multiplier = Math.floor(Math.random() * 10) + 1;

        // Si selectedTable es null, table contendrá la tabla aleatoria
        // Si selectedTable NO es null, table contendrá el valor fijo.
        return { topNum: table, bottomNum: multiplier, operator: '×', result: table * multiplier };
    }
    // ************************


    function createCardElement(data, index) {
        // ... (Sin cambios)
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

    function initializeCards(resetAll = false) {
        // Se elimina la condición de inicio que requiere una tabla seleccionada para permitir el modo aleatorio.

        startButton.disabled = false;
        cardContainer.innerHTML = '';
        cardData = [];
        currentCardIndex = 0;

        if (resetAll) {
            hits = 0;
            totalShown = 0;
        }

        for (let i = 0; i < totalCards; i++) cardData.push(generateOperation());
        cardData.forEach((data, idx) => cardContainer.appendChild(createCardElement(data, idx)));
        document.querySelectorAll('.card').forEach(card => card.classList.remove('flipped', 'correct', 'wrong'));
        document.querySelectorAll('.result').forEach(el => el.style.visibility = 'hidden');
        updateScoreDisplay();

        if (isGameRunning) {
            pauseGame();
        }

        // Actualizar los botones para reflejar la primera tarjeta
        updateResultButtons();
    }

    function updateScoreDisplay() {
        // ... (Sin cambios)
        let percentage = 0;
        if (totalShown > 0) {
            percentage = ((hits / totalShown) * 100).toFixed(0);
        }
        const limitDisplay = roundLimit !== null ? ` ` : ''; //(Límite: ${roundLimit})
        playerScoreSpan.textContent = `${hits} / ${totalShown} (${percentage}%) ${limitDisplay}`;
    }

    function endGame() {
        // ... (Sin cambios)
        pauseGame();
        const totalOps = roundLimit !== null ? roundLimit : totalShown;
        alert(`¡Juego Terminado! Has completado ${totalOps} rondas.\nPuntuación Final: ${hits} aciertos de ${totalShown} operaciones.`);
        document.querySelectorAll('.score-buttons .button-row button').forEach(button => button.disabled = true);
    }

    function startGame() {
        if (isGameRunning) return;
        document.querySelectorAll('.score-buttons .button-row button').forEach(button => button.disabled = false);
        isGameRunning = true;
        startButton.disabled = true;
        pauseButton.disabled = false;
        showCurrentCard();
    }

    function pauseGame() {
        // ... (Sin cambios)
        isGameRunning = false;
        startButton.disabled = false;
        pauseButton.disabled = true;
        clearTimeout(autoFlipTimer);
    }

    function showCurrentCard() {
        if (!isGameRunning) return;

        document.querySelectorAll('.card').forEach(card => card.classList.remove('flipped', 'correct', 'wrong'));
        const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"]`);

        if (currentCard) currentCard.classList.add('flipped');

        if (currentCard) currentCard.querySelector('.result').style.visibility = 'hidden';
        updateScoreDisplay();
        updateResultButtons(); // ** LLAMADA A updateResultButtons AQUÍ **
        startAutoFlipTimer();
    }

    function startAutoFlipTimer() {
        // ... (Sin cambios)
        clearTimeout(autoFlipTimer);
        if (isGameRunning && flipDelay) {
            autoFlipTimer = setTimeout(() => {
                handleNoResponse();
            }, flipDelay);
        }
    }

    function flipNextCardAfterResponse() {
        // ... (Sin cambios)
        if (!isGameRunning) return;

        if (roundLimit !== null && totalShown >= roundLimit) {
            endGame();
            return;
        }

        currentCardIndex = (currentCardIndex + 1) % totalCards;

        if (currentCardIndex === 0) {
            document.querySelectorAll('.card').forEach(card => {
                card.classList.remove('flipped', 'correct', 'wrong');
            });

            setTimeout(() => {
                cardData = [];
                for (let i = 0; i < totalCards; i++) cardData.push(generateOperation());

                document.querySelectorAll('.card').forEach((card, idx) => {
                    const data = cardData[idx];

                    card.querySelector('.num1').textContent = data.topNum;
                    card.querySelector('.num2').textContent = data.bottomNum;
                    card.querySelector('.result').textContent = data.result;
                    card.querySelector('.sign').textContent = data.operator;

                    card.querySelector('.result').classList.remove('show-result', 'correct-answer', 'wrong-answer');
                });

                showCurrentCard();
            }, 650);

        } else {
            showCurrentCard();
        }
    }

    function handleNoResponse() {
        // ... (Sin cambios)
        if (!isGameRunning) return;
        isWaiting = true;
        clearTimeout(autoFlipTimer);
        const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"] .card-front`);
        const parentCard = currentCard.parentElement;
        const resultSpan = currentCard.querySelector('.result');

        resultSpan.style.visibility = 'visible';
        resultSpan.classList.add('wrong-answer');
        parentCard.classList.add('wrong');

        totalShown++;

        setTimeout(() => {
            parentCard.classList.remove('wrong');
            resultSpan.classList.remove('wrong-answer');
            resultSpan.style.visibility = 'hidden';
            isWaiting = false;
            flipNextCardAfterResponse();
        }, 1000);
    }

    function handleButtonClick(button) {
        // ... (Sin cambios)
        if (isWaiting || !isGameRunning) return;

        clearTimeout(autoFlipTimer);

        const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"] .card-front`);
        const parentCard = currentCard.parentElement;
        const result = parseInt(currentCard.querySelector('.result').textContent);
        const clickedNumber = parseInt(button.textContent);
        const resultSpan = currentCard.querySelector('.result');

        resultSpan.style.visibility = 'visible';
        resultSpan.classList.remove('correct-answer', 'wrong-answer');

        if (result === clickedNumber) {
            parentCard.classList.add('correct');
            hits++;
            resultSpan.classList.add('correct-answer');
        } else {
            parentCard.classList.add('wrong');
            resultSpan.classList.add('wrong-answer');
        }

        totalShown++;
        updateScoreDisplay();
        isWaiting = true;

        setTimeout(() => {
            parentCard.classList.remove('correct', 'wrong');
            resultSpan.classList.remove('correct-answer', 'wrong-answer');
            resultSpan.style.visibility = 'hidden';
            isWaiting = false;
            flipNextCardAfterResponse();
        }, 1000);
    }

    // --- Eventos ---
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', pauseGame);
    newOperationsButton.addEventListener('click', () => initializeCards(true));

    flipSpeedSelect.addEventListener('change', e => {
        flipDelay = e.target.value ? parseInt(e.target.value) : null;
        if (isGameRunning) {
            startAutoFlipTimer();
        }
    });

    numCardsSelect.addEventListener('change', e => {
        roundLimit = e.target.value ? parseInt(e.target.value) : null;
        initializeCards(true);
    });

    multiplicationTableSelect.addEventListener('change', e => {
        const tableValue = e.target.value;
        if (tableValue) {
            selectedTable = parseInt(tableValue);
            document.querySelector('header h1').textContent = `Tabla del ${selectedTable}`;
        } else {
            // Se selecciona el espacio en blanco (modo aleatorio)
            selectedTable = null;
            document.querySelector('header h1').textContent = `Tablas de Multiplicar`;
        }
        // updateResultButtons ya no se llama aquí, se llama en initializeCards y showCurrentCard.
        initializeCards(true);
    });

    randomizeAnswersCheckbox.addEventListener('change', () => {
        updateResultButtons();
    });

    // Inicialización
    populateFlipSpeed();
    populateNumCards();
    populateMultiplicationTable();
    roundLimit = numCardsSelect.value ? parseInt(numCardsSelect.value) : null;
    updateResultButtons();
    initializeCards(true);
});
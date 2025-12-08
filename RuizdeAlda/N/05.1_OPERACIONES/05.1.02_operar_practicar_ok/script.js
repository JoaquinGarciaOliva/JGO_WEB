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

   // --- FUNCIÓN CLAVE MODIFICADA: Generación de 4 operaciones ---
  
    // -------------------------------------------------------------------
// --- Generación de 4 operaciones ---
    function generateOperation() {
        const operations = ['+', '-', '×', '÷'];
        const operator = selectedTable !== null && selectedTable !== '' 
            ? '×' 
            : operations[Math.floor(Math.random() * operations.length)];

        let topNum;
        let bottomNum;
        let result;

        if (operator === '+') {
            topNum = Math.floor(Math.random() * 16); // 0 a 15
            bottomNum = Math.floor(Math.random() * 16); // 0 a 15
            result = topNum + bottomNum;
        } else if (operator === '-') {
            // Restas: 1 cifra (0 a 9), resultado natural (>= 0)
            let numA = Math.floor(Math.random() * 10);
            let numB = Math.floor(Math.random() * 10);
            // Aquí guardamos el mayor en topNum para el resultado, PERO la visualización se controla en createCardElement
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

            topNum = table; 
            bottomNum = multiplier; 
            result = topNum * bottomNum;
        } else if (operator === '÷') {
            const divisor = Math.floor(Math.random() * 10) + 1; // 1 a 10
            const cociente = Math.floor(Math.random() * 10) + 1; // 1 a 10 (el resultado)
            
            topNum = divisor * cociente; // Dividendo (el número grande)
            bottomNum = divisor;         // Divisor (el número del 1 al 10)
            result = cociente;
        }
        
        return {   topNum, bottomNum, operator, result };
    }
    // -------------------------------------------------------------------
    // --- FUNCIÓN CLAVE MODIFICADA: Adaptación dinámica de botones ---
  // --- FUNCIÓN CLAVE MODIFICADA: Adaptación dinámica de botones ---
    function updateResultButtons() {
        scoreButtonsContainer.innerHTML = '';
        const randomize = randomizeAnswersCheckbox.checked;

        let currentCardData = cardData[currentCardIndex];
        if (!currentCardData) {
            currentCardData = generateOperation(); 
        }

        const operator = currentCardData.operator;
        let possibleAnswers = [];
        const correctResult = currentCardData.result;
        let maxNumber = 20;

        // 1. Definir las opciones y el límite superior (hasta 20)
        
        // Suma: Permitimos resultados hasta el 20 por defecto. Si el resultado es mayor, forzamos un límite superior mayor.
        if (operator === '+') {
            if (correctResult > 20) {
                maxNumber = Math.ceil(correctResult / 5) * 5; // Redondea al múltiplo de 5 superior si es > 20
            }
        } 
        // Multiplicación: Determinamos las respuestas de la tabla y ajustamos maxNumber temporalmente para la lista.
        else if (operator === '×') {
            const tableNum = currentCardData.topNum;
            for (let i = 1; i <= 10; i++) {
                possibleAnswers.push(tableNum * i);
            }
            possibleAnswers = [...new Set(possibleAnswers)];
            // Los botones del 11 al 20 estarán desactivados, por lo que las opciones solo necesitan cubrir los resultados del 1 al 10 (o hasta el 100).
            maxNumber = 20; // Los botones se generan hasta el 20, pero solo del 1 al 10 mostrarán las respuestas de la tabla.
        } 
        // Resta y División: Solo necesitamos botones hasta 10 (pero generamos hasta 20 para la estructura)
        else {
            maxNumber = 20;
        }

        // 2. Generar el conjunto de números base (del 1 al 20)
        let baseNumbers = [];
        for (let i = 1; i <= maxNumber; i++) {
            baseNumbers.push(i);
        }

        // 3. Modificar la lista de números base según la operación

        if (operator === '×') {
            // Para la multiplicación, los primeros 10 botones deben ser los resultados de la tabla.
            
            // Si el modo es aleatorio, desordenamos SÓLO los resultados de la tabla (los primeros 10).
            if (randomize) {
                 possibleAnswers = shuffleArray(possibleAnswers);
            } else {
                 possibleAnswers.sort((a, b) => a - b);
            }
            
            // Rellenamos los primeros 10 valores con los resultados de la tabla
            baseNumbers = possibleAnswers.slice(0, 10);
            
            // Si hay más de 10 resultados (Ej: tabla del 10), tomamos los 10 primeros resultados.
            // Los números del 11 al 20 se dejan como números normales (pero se desactivarán después).
            for (let i = 11; i <= 20; i++) {
                if (i > baseNumbers.length) {
                    baseNumbers.push(i);
                }
            }

        } else if (operator === '-' || operator === '÷') {
             // Para resta/división, usamos los números base (1 a 20), pero solo los 1 a 10 son relevantes.
             // Desactivamos del 11 al 20. Se mantienen ordenados ya que `randomize` solo afecta a 'x'.
             baseNumbers = baseNumbers.slice(0, 20); // Usamos del 1 al 20
        } else if (operator === '+') {
            // Para suma, usamos los números base (1 hasta maxNumber, que puede ser > 20).
            // No se desordenan.
            baseNumbers = baseNumbers.slice(0, maxNumber);
        }


        // 4. Aseguramos que el 0 esté y lo añadimos al inicio de la lista de opciones
        let finalOptions = [0, ...baseNumbers];

        // 5. Renderizar los botones (adaptado para mostrar siempre hasta 20 si es posible)
        
        // Fila 0: Botón 0
        const row0 = document.createElement('div');
        row0.classList.add('button-row');

        let button0 = document.createElement('button');
        button0.textContent = '0';
        button0.classList.add('score-button');
        button0.id = 'scoreMarker';
        row0.appendChild(button0);
        scoreButtonsContainer.appendChild(row0);

        const optionsWithoutZero = finalOptions.slice(1); 

        let buttonValue = 1;
        
        // Iteramos para generar 4 filas con 5 botones (del 1 al 20)
        for (let r = 0; r < 4; r++) {
            const row = document.createElement('div');
            row.classList.add('button-row');
            
            for (let c = 0; c < 5; c++) {
                if (buttonValue <= 20) {
                    let button = document.createElement('button');
                    
                    // Asignación del valor: Usamos el número base generado, si existe.
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
                        // Aseguramos que si la respuesta correcta está en el 1-10, y el valor es el de la tabla, esté activo
                        button.disabled = false;
                        button.classList.remove('disabled-button');
                    } else if (operator === '-' || operator === '÷') {
                        // Para resta/división (resultados <= 10), todos están activos
                        button.disabled = false;
                        button.classList.remove('disabled-button');
                    }

                    row.appendChild(button);
                    buttonValue++;
                }
            }
            scoreButtonsContainer.appendChild(row);
        }

        // Reasignar listeners
        scoreButtonsContainer.querySelectorAll('button').forEach(button => {
            if (!button.disabled) {
                button.addEventListener('click', () => handleButtonClick(button));
            }
        });
    }
    // -------------------------------------------------------------------


    // ************************


    function createCardElement(data, index) {
        // ... (Sin cambios)
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
        const limitDisplay = roundLimit !== null ? ` (Límite: ${roundLimit})` : '';
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

                    card.querySelector('.num1').textContent = data.bottomNum; 
                    card.querySelector('.num2').textContent = data.topNum;
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
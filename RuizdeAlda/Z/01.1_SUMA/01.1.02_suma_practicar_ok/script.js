document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.querySelector('.card-container');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const newOperationsButton = document.getElementById('newOperationsButton');
    const flipSpeedSelect = document.getElementById('flipSpeed');
    const playerScoreSpan = document.getElementById('playerScore');
    const numCardsSelect = document.getElementById('numCardsSelect');
    
    // Selectores de los nuevos botones de respuesta
    const signButtons = document.querySelectorAll('.sign-button');
    const numberButtons = document.querySelectorAll('.number-button'); 

    const totalCards = 2; 
    let cardData = [];
    let currentCardIndex = 0;
    let isWaiting = false;
    let isGameRunning = false; 
    let flipDelay = null; 
    let autoFlipTimer = null;
    let hits = 0;
    let totalShown = 0;
    let roundLimit = 10;
    
    // Estado de respuesta del usuario
    let selectedSign = null; 

    // --- Funciones de Utilidad para Generación y Formato ---
    
    function getRandomNumber() {
        // Genera números entre -10 y 10 (sin incluir 0 para operaciones)
        let num = Math.floor(Math.random() * 10) + 1;
        return Math.random() < 0.5 ? -num : num;
    }
    
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

    function generateOperation() {
        // Generamos dos números firmados entre -10 y 10
        const num1 = getRandomNumber(); 
        const num2 = getRandomNumber(); 
        const resultValue = num1 + num2;

        // El resultado que se muestra en la tarjeta es el valor absoluto, 
        // ya que el signo lo elige el usuario con el botón.
        const resultDisplay = Math.abs(resultValue).toString();

        return { 
            topNum: num1, 
            bottomNum: num2, 
            operator: '+', // Mantenemos '+' como símbolo de operación
            resultValue: resultValue, // Valor real (e.g., -5)
            resultDisplay: resultDisplay // Valor absoluto (e.g., 5)
        };
    }
    
    function createCardElement(data, index) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;
        const imageClass = (index + 1) % 2 === 0 ? 'image-even' : 'image-odd';
        
        // Formato para mostrar los números en línea con sus signos de origen
        const operationHTML = `
            <div class="operation">
                <span class="num1">${data.topNum >= 0 ? '+' + data.topNum : data.topNum}</span>
                <span class="num2">${data.bottomNum >= 0 ? '+' + data.bottomNum : data.bottomNum}</span>
                <div class="num2-line"></div>
            </div>`;
            
        card.innerHTML = `
            <div class="card-face card-back ${imageClass}"></div>
            <div class="card-face card-front small-font">
                ${operationHTML}
                <span class="result">${data.resultDisplay}</span> 
            </div>`;
        return card;
    }
    
    // --- Lógica del Juego ---

    function resetSignSelection() {
        selectedSign = null;
        signButtons.forEach(btn => btn.classList.remove('selected'));
    }
    
    function initializeCards(resetAll = false) {
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
        
        // Deshabilita los botones de respuesta al inicio
        numberButtons.forEach(button => button.disabled = true);
        signButtons.forEach(button => button.disabled = true);
    }
    
    function updateScoreDisplay() {
        let percentage = 0;
        if (totalShown > 0) {
            percentage = ((hits / totalShown) * 100).toFixed(0);
        }
        const limitDisplay = roundLimit !== null ? ` (Límite: ${roundLimit})` : '';
        playerScoreSpan.textContent = `${hits} / ${totalShown} (${percentage}%) ${limitDisplay}`;
    }

    function endGame() {
        pauseGame();
        const totalOps = roundLimit !== null ? roundLimit : totalShown;
        alert(`¡Juego Terminado! Has completado ${totalOps} rondas.\nPuntuación Final: ${hits} aciertos de ${totalShown} operaciones.`);
        numberButtons.forEach(button => button.disabled = true);
        signButtons.forEach(button => button.disabled = true);
    }
    
    function startGame() {
        if (isGameRunning) return;
        numberButtons.forEach(button => button.disabled = false);
        signButtons.forEach(button => button.disabled = false);
        isGameRunning = true;
        startButton.disabled = true;
        pauseButton.disabled = false;
        showCurrentCard();
    }
    
    function pauseGame() {
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
        
        currentCard.querySelector('.result').style.visibility = 'hidden';
        updateScoreDisplay();
        resetSignSelection();
        startAutoFlipTimer();
    }

    function startAutoFlipTimer() {
        clearTimeout(autoFlipTimer);
        if (isGameRunning && flipDelay) {
            autoFlipTimer = setTimeout(() => {
                handleNoResponse();
            }, flipDelay);
        }
    }

    function flipNextCardAfterResponse() {
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
                // Generar nuevas operaciones
                cardData = [];
                for (let i = 0; i < totalCards; i++) cardData.push(generateOperation());
                
                // Actualizar el contenido de las tarjetas
                document.querySelectorAll('.card').forEach((card, idx) => {
                    const data = cardData[idx];
                    
                    card.querySelector('.num1').textContent = data.topNum >= 0 ? '+' + data.topNum : data.topNum;
                    card.querySelector('.num2').textContent = data.bottomNum >= 0 ? '+' + data.bottomNum : data.bottomNum;
                    card.querySelector('.result').textContent = data.resultDisplay;
                    
                    card.classList.remove('correct', 'wrong');
                });
                
                showCurrentCard();
            }, 650); 
            
        } else {
            showCurrentCard();
        }
    }

    function handleNoResponse() {
        if (!isGameRunning) return;
        isWaiting = true;
        clearTimeout(autoFlipTimer);
        const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"] .card-front`);
        const parentCard = currentCard.parentElement;
        const resultSpan = currentCard.querySelector('.result'); 

        // Mostrar resultado CORRECTO para feedback
        const correctResultValue = cardData[currentCardIndex].resultValue;
        const correctSign = correctResultValue >= 0 ? '+' : '-';
        const correctDisplay = correctResultValue === 0 ? '0' : correctSign + Math.abs(correctResultValue);
        resultSpan.textContent = correctDisplay;

        resultSpan.style.visibility = 'visible';
        resultSpan.classList.add('wrong-answer');
        parentCard.classList.add('wrong');
        
        totalShown++; 
        resetSignSelection();

        setTimeout(() => {
            parentCard.classList.remove('wrong');
            resultSpan.classList.remove('wrong-answer');
            resultSpan.style.visibility = 'hidden';
            isWaiting = false;
            flipNextCardAfterResponse();
        }, 1000);
    }
    
    // --- MANEJO DE RESPUESTA COMBINADA (Signo + Número) ---

    function handleSignClick(button) {
        if (isWaiting || !isGameRunning) return;

        signButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        selectedSign = button.dataset.sign;
    }

    function handleNumberClick(button) {
        if (isWaiting || !isGameRunning) return;
        
        const clickedNumber = parseInt(button.dataset.number); 

        // 1. Validar la selección de signo, excepto si el número es cero.
        if (clickedNumber !== 0 && selectedSign === null) {
            alert("Por favor, selecciona primero el signo (+ o -).");
            return;
        }

        clearTimeout(autoFlipTimer);
        
        const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"] .card-front`);
        const parentCard = currentCard.parentElement;
        const cardDataCurrent = cardData[currentCardIndex];
        
        const correctResultValue = cardDataCurrent.resultValue; 
        
        // 2. Reconstruir la respuesta del usuario (valor con signo)
        let userResultValue;
        if (clickedNumber === 0) {
            userResultValue = 0; 
        } else if (selectedSign === '+') {
            userResultValue = clickedNumber;
        } else if (selectedSign === '-') {
            userResultValue = -clickedNumber;
        } else {
            // No debería ocurrir si clickedNumber != 0.
            return; 
        }

        const resultSpan = currentCard.querySelector('.result');
        resultSpan.style.visibility = 'visible';
        
        // 3. Verificar: el valor numérico (con signo) debe coincidir
        const isCorrect = userResultValue === correctResultValue;

        if (isCorrect) {
            parentCard.classList.add('correct');
            hits++;
            resultSpan.classList.add('correct-answer');
        } else {
            parentCard.classList.add('wrong');
            resultSpan.classList.add('wrong-answer');
        }

        // 4. Mostrar el resultado CORRECTO en la tarjeta para feedback
        const correctSign = correctResultValue >= 0 ? '+' : '-';
        const correctDisplay = correctResultValue === 0 ? '0' : correctSign + Math.abs(correctResultValue);
        resultSpan.textContent = correctDisplay;
        
        totalShown++;
        updateScoreDisplay();
        isWaiting = true;
        resetSignSelection();

        setTimeout(() => {
            // Restablecer el estado de la tarjeta y avanzar
            parentCard.classList.remove('correct', 'wrong');
            resultSpan.classList.remove('correct-answer', 'wrong-answer');
            isWaiting = false;
            flipNextCardAfterResponse();
        }, 1000);
    }

    // --- Asignación de Eventos ---
    
    // Eventos de botones de signo
    signButtons.forEach(button => {
        button.addEventListener('click', () => handleSignClick(button));
    });

    // Eventos de botones numéricos
    numberButtons.forEach(button => {
        button.addEventListener('click', () => handleNumberClick(button));
    });

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
    
    // Inicialización
    populateFlipSpeed();
    populateNumCards();
    roundLimit = numCardsSelect.value ? parseInt(numCardsSelect.value) : null;
    initializeCards(true);
});
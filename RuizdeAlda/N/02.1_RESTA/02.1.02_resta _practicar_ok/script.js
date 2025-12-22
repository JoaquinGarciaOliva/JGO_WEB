document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.querySelector('.card-container');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const newOperationsButton = document.getElementById('newOperationsButton');
    const flipSpeedSelect = document.getElementById('flipSpeed');
    const playerScoreSpan = document.getElementById('playerScore');
    const numCardsSelect = document.getElementById('numCardsSelect'); 

    const totalCards = 2; 
    let cardData = [];
    let currentCardIndex = 0;
    let isWaiting = false;
    let isGameRunning = false; 
    let flipDelay = null; 
    let autoFlipTimer = null;

    let hits = 0;
    let totalShown = 0;
    
    // 🆕 Límite de rondas/operaciones a mostrar (por defecto 10, o null para indefinido)
    let roundLimit = 10; 

    // --- Funciones ---
    
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
        // Valor en blanco (tiempo ilimitado / rondas indefinidas)
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
    // ✨ MODIFICACIÓN PRINCIPAL: Generar restas positivas (0 a 10)
        // 1. Generar dos números de 0 a 10.
        let numA = Math.floor(Math.random() * 11); // 0 a 10
        let numB = Math.floor(Math.random() * 11); // 0 a 10
        
        // 2. Asegurarse de que el número superior (topNum) sea siempre mayor o igual que el inferior (bottomNum).
        const topNum = Math.max(numA, numB);
        const bottomNum = Math.min(numA, numB);
        
        const operator = '-'; // Cambiado a resta
        const result = topNum - bottomNum; // Resultado siempre >= 0
        
        return { topNum, bottomNum, operator, result };
    }

    function createCardElement(data, index) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;
        const imageClass = (index + 1) % 2 === 0 ? 'image-even' : 'image-odd';
        const operationHTML = `
            <div class="operation">
                <span class="num1">${data.topNum}</span>
                <span class="num2-with-sign">
                    <span class="sign">${data.operator}</span>
                    <span class="num2">${data.bottomNum}</span>
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
    }

    function updateScoreDisplay() {
        let percentage = 0;
        if (totalShown > 0) {
            percentage = ((hits / totalShown) * 100).toFixed(0);
        }
        // Incluye el límite de rondas si está definido
        const limitDisplay = roundLimit !== null ?  `` : ''; //(Límite: ${roundLimit})
        playerScoreSpan.textContent = `${hits} / ${totalShown} (${percentage}%) ${limitDisplay}`;
    }

    function endGame() {
        pauseGame(); // Detiene el juego
        // Mostrar un mensaje de finalización
        const totalOps = roundLimit !== null ? roundLimit : totalShown;
        alert(`¡Juego Terminado! Has completado ${totalOps} rondas.\nPuntuación Final: ${hits} aciertos de ${totalShown} operaciones.`);
        // Opcional: Deshabilitar temporalmente los botones de respuesta
        document.querySelectorAll('.score-buttons button').forEach(button => button.disabled = true);
    }
    
    function startGame() {
        if (isGameRunning) return;
        // Habilitar botones de respuesta al iniciar
        document.querySelectorAll('.score-buttons button').forEach(button => button.disabled = false); 
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
        // Deshabilitar todos los botones de respuesta
        document.querySelectorAll('.score-buttons button').forEach(button => button.disabled = true); 
    }
    
    function showCurrentCard() {
        if (!isGameRunning) return; 

        document.querySelectorAll('.card').forEach(card => card.classList.remove('flipped', 'correct', 'wrong'));
        const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"]`);
        
        if (currentCard) currentCard.classList.add('flipped');
        
        currentCard.querySelector('.result').style.visibility = 'hidden';
        updateScoreDisplay();
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
        
        // Comprobación del límite de rondas DESPUÉS de responder
        if (roundLimit !== null && totalShown >= roundLimit) {
            endGame();
            return; // Detiene la secuencia
        }

        currentCardIndex = (currentCardIndex + 1) % totalCards;

        if (currentCardIndex === 0) {
            // Ciclo completo (las dos cartas mostradas)
            
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
                    card.querySelector('.sign').textContent = data.operator; // Importante para la resta
                    
                    card.querySelector('.result').classList.remove('show-result', 'correct-answer', 'wrong-answer');
                });
                
                showCurrentCard();
            }, 650); 
            
        } else {
            // Si no es el final del ciclo, mostramos la siguiente carta inmediatamente.
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

        resultSpan.style.visibility = 'visible';
        resultSpan.classList.add('wrong-answer');
        parentCard.classList.add('wrong');
        
        // Contamos la operación como mostrada/respondida (aunque sea incorrectamente)
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
        // ✨ MODIFICACIÓN: Eliminamos la exclusión del botón 'scoreMarker'.
        // if (button.id === 'scoreMarker' || isWaiting || !isGameRunning) return; 
        if (isWaiting || !isGameRunning) return;
        
        clearTimeout(autoFlipTimer); 
        
        const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"] .card-front`);
        const parentCard = currentCard.parentElement;
        const result = parseInt(currentCard.querySelector('.result').textContent);
        const clickedNumber = parseInt(button.textContent); // Esto lee el valor del botón (incluyendo el 0)
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
        
        // Contamos la operación como respondida
        totalShown++;

        updateScoreDisplay();
        isWaiting = true;
        
        setTimeout(() => {
            parentCard.classList.remove('correct', 'wrong');
            resultSpan.classList.remove('correct-answer', 'wrong-answer'); 
            resultSpan.style.visibility = 'hidden';
            isWaiting = false;
            flipNextCardAfterResponse(); // Esto llama a la función que ahora verifica el fin de juego
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
    
    // ⚠️ Evento para el cambio de Límite de Rondas
    numCardsSelect.addEventListener('change', e => {
        // Si el valor está en blanco, roundLimit es null (indefinido)
        roundLimit = e.target.value ? parseInt(e.target.value) : null; 
        initializeCards(true); // Reiniciar el juego con el nuevo límite
    });
    
    // ✨ MODIFICACIÓN: El listener se adjunta a *TODOS* los botones, incluyendo 'scoreMarker'.
    document.querySelectorAll('.score-buttons .button-row button').forEach(button => {
        button.addEventListener('click', () => handleButtonClick(button));
    });

    populateFlipSpeed();
    populateNumCards();
    
    // ⚠️ Inicialización del roundLimit
    roundLimit = numCardsSelect.value ? parseInt(numCardsSelect.value) : null;
    
    initializeCards(true); 
});
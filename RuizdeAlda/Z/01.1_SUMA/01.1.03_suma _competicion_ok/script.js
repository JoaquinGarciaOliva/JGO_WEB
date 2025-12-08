document.addEventListener('DOMContentLoaded', () => {

    const cardContainer = document.querySelector('.card-container');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const newOperationsButton = document.getElementById('newOperationsButton');
    const flipSpeedSelect = document.getElementById('flipSpeed');
    const numCardsSelect = document.getElementById('numCardsSelect');
    const timeLimitSelect = document.getElementById('timeLimitSelect'); 

    // Selectores para los botones de respuesta de ambos jugadores
    const allSignButtons = document.querySelectorAll('.sign-button');
    const allNumberButtons = document.querySelectorAll('.number-button'); 

    const totalCards = 2;

    let cardData = [];
    let currentCardIndex = 0;
    // isWaiting ya no se usa para la espera entre jugadores, solo para el feedback visual
    let isWaiting = false; 
    let isGameRunning = false;

    let flipDelay = null;
    let autoFlipTimer = null;

    // ⏱ TEMPORIZADOR
    let timeRemaining = null;
    let countdownInterval = null;

    // 🔢 PUNTUACIONES y ESTADO DE RESPUESTA POR JUGADOR
    let player1Score = 0;
    let player2Score = 0;
    let selectedSign1 = null; 
    let selectedSign2 = null; 
    
    // Se eliminan player1Answered y player2Answered, ya que la carta avanza inmediatamente.

    let totalShown = 0;
    let roundLimit = null;


    /* ────────────────────────────────
        UTILIDADES DE GENERACIÓN
    ───────────────────────────────── */

    function getRandomNumber() {
        // Genera números entre -10 y 10 (sin incluir 0 para operaciones)
        let num = Math.floor(Math.random() * 10) + 1;
        return Math.random() < 0.5 ? -num : num;
    }
    
    function generateOperation() {
        const num1 = getRandomNumber(); 
        const num2 = getRandomNumber(); 
        const resultValue = num1 + num2;

        const resultDisplay = Math.abs(resultValue).toString();

        return { 
            topNum: num1, 
            bottomNum: num2, 
            operator: '+', 
            resultValue: resultValue, 
            resultDisplay: resultDisplay 
        };
    }
    
    function createCardElement(data, index) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;
        const imageClass = (index + 1) % 2 === 0 ? 'image-even' : 'image-odd';
        
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

    // --- Selectores de Desplegables (Mantenido) ---
    function populateFlipSpeed() {
        flipSpeedSelect.innerHTML = "";
        const blankOption = document.createElement("option");
        blankOption.value = ""; blankOption.textContent = ""; blankOption.selected = true;
        flipSpeedSelect.appendChild(blankOption);
        for (let i = 1; i <= 20; i++) {
            const option = document.createElement("option");
            option.value = i * 1000; option.textContent = i;
            flipSpeedSelect.appendChild(option);
        }
    }
    function populateNumCards() {
        numCardsSelect.innerHTML = "";
        const blankOption = document.createElement("option");
        blankOption.value = ""; blankOption.textContent = ""; blankOption.selected = true;
        numCardsSelect.appendChild(blankOption);
        for (let i = 10; i <= 200; i += 10) {
            const option = document.createElement("option");
            option.value = i; option.textContent = i;
            numCardsSelect.appendChild(option);
        }
    }
    function populateTimeLimit() {
        timeLimitSelect.innerHTML = "";
        const blankOption = document.createElement("option");
        blankOption.value = ""; blankOption.textContent = ""; blankOption.selected = true;
        timeLimitSelect.appendChild(blankOption);
        for (let i = 1; i <= 30; i++) {
            const option = document.createElement("option");
            option.value = i; option.textContent = i;
            timeLimitSelect.appendChild(option);
        }
    }


    /* ────────────────────────────────
        TEMPORIZADOR (Mantenido)
    ───────────────────────────────── */
    function updateCountdownDisplay() {
        const display = document.getElementById('countdownDisplay');
        if (timeRemaining === null) { display.textContent = ""; return; }
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
        INICIALIZACIÓN / JUEGO
    ───────────────────────────────── */

    function resetPlayerSigns() {
        selectedSign1 = null;
        selectedSign2 = null;
        allSignButtons.forEach(btn => btn.classList.remove('selected'));
    }

    function disableAllButtons() {
        allSignButtons.forEach(btn => btn.disabled = true);
        allNumberButtons.forEach(btn => btn.disabled = true);
    }

    function enableAllButtons() {
        allSignButtons.forEach(btn => btn.disabled = false);
        allNumberButtons.forEach(btn => btn.disabled = false);
    }
    
    function initializeCards(resetAll = false) {
        cardContainer.innerHTML = "";
        cardData = [];
        currentCardIndex = 0;

        if (resetAll) {
            totalShown = 0;
            player1Score = 0;
            player2Score = 0;
        }

        clearInterval(countdownInterval);
        timeRemaining = timeLimitSelect.value === "" ? null : parseInt(timeLimitSelect.value) * 60;
        updateCountdownDisplay();

        for (let i = 0; i < totalCards; i++) cardData.push(generateOperation());
        cardData.forEach((data, idx) => cardContainer.appendChild(createCardElement(data, idx)));

        document.querySelectorAll('.card').forEach(card => card.classList.remove('flipped', 'correct', 'wrong'));
        document.querySelectorAll('.result').forEach(el => el.style.visibility = "hidden");

        updateScoreDisplay(); 

        if (isGameRunning) pauseGame();
        else disableAllButtons();

    }


    function startGame() {
        if (isGameRunning) return;

        isGameRunning = true;
        startButton.disabled = true;
        pauseButton.disabled = false;

        enableAllButtons();

        if (timeRemaining !== null) startCountdown();

        showCurrentCard();
    }

    function pauseGame() {
        isGameRunning = false;
        startButton.disabled = false;
        pauseButton.disabled = true;

        clearTimeout(autoFlipTimer);
        clearInterval(countdownInterval);

        disableAllButtons();
    }

    function showCurrentCard() {
        if (!isGameRunning) return;
        
        // Antes de mostrar la nueva carta, si estamos en un estado de espera (isWaiting),
        // debemos asegurarnos de que se restablezca completamente.
        if (isWaiting) {
            isWaiting = false;
            enableAllButtons();
        }

        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.classList.remove('flipped', 'correct', 'wrong'));

        const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"]`);
        currentCard.classList.add('flipped');

        currentCard.querySelector('.result').style.visibility = "hidden";
        
        resetPlayerSigns();

        startAutoFlipTimer();
    }

    function flipNextCardAfterResponse() {
        if (!isGameRunning) return;

        totalShown++; 
        
        // Desactivamos el feedback visual de la tarjeta
        document.querySelectorAll('.card').forEach(card => 
            card.classList.remove('correct', 'wrong')
        );

        if (roundLimit !== null && totalShown >= roundLimit) {
            endGame();
            return; 
        }

        currentCardIndex = (currentCardIndex + 1) % totalCards;

        if (currentCardIndex === 0) {
            // Reinicio de ciclo de cartas (generar nuevas operaciones)
            setTimeout(() => {
                cardData = [];
                for (let i = 0; i < totalCards; i++) cardData.push(generateOperation());
                
                document.querySelectorAll('.card').forEach((card, idx) => {
                    const data = cardData[idx];
                    card.querySelector('.num1').textContent = data.topNum >= 0 ? '+' + data.topNum : data.topNum;
                    card.querySelector('.num2').textContent = data.bottomNum >= 0 ? '+' + data.bottomNum : data.bottomNum;
                    card.querySelector('.result').textContent = data.resultDisplay; 
                });
                
                showCurrentCard();
            }, 50); // Tiempo mínimo para el flip visual
            
        } else {
            showCurrentCard();
        }
    }
    
    function handleNoResponse() {
        if (!isGameRunning) return;
        isWaiting = true;
        clearTimeout(autoFlipTimer);

        // Nadie respondió (0 puntos), solo mostrar feedback y avanzar.
        
        const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"] .card-front`);
        const parentCard = currentCard.parentElement;
        const resultSpan = currentCard.querySelector('.result'); 

        // Mostrar resultado CORRECTO para feedback
        const correctResultValue = cardData[currentCardIndex].resultValue;
        const correctSign = correctResultValue >= 0 ? '+' : '-';
        const correctDisplay = correctResultValue === 0 ? '0' : correctSign + Math.abs(correctResultValue);
        resultSpan.textContent = correctDisplay;

        resultSpan.style.visibility = 'visible';
        // Añadimos una clase visual si no hubo respuesta
        parentCard.classList.add('wrong');
        
        disableAllButtons();

        setTimeout(() => {
            parentCard.classList.remove('wrong');
            resultSpan.style.visibility = 'hidden';
            isWaiting = false;
            enableAllButtons(); // Se habilitarán en showCurrentCard de todas formas, pero aquí es bueno
            flipNextCardAfterResponse();
        }, 1000);
    }
    
    /* ────────────────────────────────
        MANEJO DE RESPUESTA MODIFICADO
    ───────────────────────────────── */
    
    function handleSignClick(button, player) {
        if (isWaiting || !isGameRunning) return;

        const playerSignButtons = document.querySelectorAll(`.sign-button[data-player="${player}"]`);
        
        playerSignButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        
        if (player === 1) {
            selectedSign1 = button.dataset.sign;
        } else {
            selectedSign2 = button.dataset.sign;
        }
    }

    function handleNumberClick(button, player) {
        if (isWaiting || !isGameRunning) return;
        
        const clickedNumber = parseInt(button.dataset.number); 
        const selectedSign = player === 1 ? selectedSign1 : selectedSign2;
        
        // 1. Validar la selección de signo, excepto si el número es cero.
        if (clickedNumber !== 0 && selectedSign === null) {
            alert(`Jugador ${player}: Por favor, selecciona primero el signo (+ o -).`);
            return;
        }

        clearTimeout(autoFlipTimer);
        isWaiting = true; // Bloquear interacción
        disableAllButtons();
        
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
            // Esto solo ocurre si clickedNumber != 0 y selectedSign es null (ya validado)
            return; 
        }

        // 3. Verificar: el valor numérico (con signo) debe coincidir
        const isCorrect = userResultValue === correctResultValue;
        
        // 4. Actualizar puntuación y FEEDBACK INMEDIATO
        
        if (isCorrect) {
            if (player === 1) player1Score++;
            else player2Score++;
        } else {
            // MODIFICACIÓN CRUCIAL: Si falla, resta 1 punto.
            if (player === 1) player1Score--;
            else player2Score--;
        }
        
        updateScoreDisplay();
        
        // Reiniciamos la selección de signo para la siguiente carta
        resetPlayerSigns(); 
        
        // 5. Gestión del feedback visual (Mostrar el resultado CORRECTO y el estado)
        const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"] .card-front`);
        const parentCard = currentCard.parentElement;
        const resultSpan = currentCard.querySelector('.result');
        
        const correctSign = correctResultValue >= 0 ? '+' : '-';
        const correctDisplay = correctResultValue === 0 ? '0' : correctSign + Math.abs(correctResultValue);
        
        resultSpan.textContent = correctDisplay;
        resultSpan.style.visibility = 'visible';
        
        if (isCorrect) {
            parentCard.classList.add('correct');
        } else {
            parentCard.classList.add('wrong');
        }
        
        // 6. Avanzar a la siguiente carta después del feedback
        setTimeout(() => {
            // Limpiamos las clases de feedback
            parentCard.classList.remove('correct', 'wrong');
            resultSpan.style.visibility = 'hidden';
            
            isWaiting = false;
            enableAllButtons();
            
            // Avanzamos inmediatamente a la siguiente carta
            flipNextCardAfterResponse();
        }, 1000); 
    }


    /* ────────────────────────────────
        PUNTUACIÓN / FIN DEL JUEGO (Mantenido)
    ───────────────────────────────── */

    function updateScoreDisplay() {
        document.getElementById('player1ScoreDisplay').textContent = player1Score;
        document.getElementById('player2ScoreDisplay').textContent = player2Score;
    }

    function endGame() {
        pauseGame();

        disableAllButtons();

        let msg = "";

        if (player1Score > player2Score)
            msg = `¡Jugador 1 GANA! (${player1Score} a ${player2Score})`;
        else if (player2Score > player1Score)
            msg = `¡Jugador 2 GANA! (${player2Score} a ${player1Score})`;
        else
            msg = `¡EMPATE! Ambos jugadores tienen ${player1Score} puntos.`;

        alert(`¡Juego Terminado!\n${msg}`);
    }

    /* ────────────────────────────────
        ASIGNACIÓN DE EVENTOS (Mantenido)
    ───────────────────────────────── */
    
    // Asignar eventos a los botones de signo
    allSignButtons.forEach(button => {
        const player = parseInt(button.dataset.player);
        button.addEventListener('click', () => handleSignClick(button, player));
    });

    // Asignar eventos a los botones numéricos
    allNumberButtons.forEach(button => {
        const player = parseInt(button.dataset.player);
        button.addEventListener('click', () => handleNumberClick(button, player));
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

    timeLimitSelect.addEventListener('change', e => {
        if (e.target.value) {
            timeRemaining = parseInt(e.target.value) * 60;
            if (isGameRunning) startCountdown();
        } else {
            timeRemaining = null;
            clearInterval(countdownInterval);
        }
        updateCountdownDisplay();
    });

    
    // Inicialización
    populateFlipSpeed();
    populateNumCards();
    populateTimeLimit();
    roundLimit = numCardsSelect.value ? parseInt(numCardsSelect.value) : null;
    initializeCards(true);
});
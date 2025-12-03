document.addEventListener('DOMContentLoaded', () => {

    const cardContainer = document.querySelector('.card-container');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const newOperationsButton = document.getElementById('newOperationsButton');
    const flipSpeedSelect = document.getElementById('flipSpeed');
    const numCardsSelect = document.getElementById('numCardsSelect');
    const timeLimitSelect = document.getElementById('timeLimitSelect'); // ⏱ NUEVO

    const totalCards = 2;

    let cardData = [];
    let currentCardIndex = 0;
    let isWaiting = false;
    let isGameRunning = false;

    let flipDelay = null;
    let autoFlipTimer = null;

    // ⏱ TEMPORIZADOR
    let timeRemaining = null;
    let countdownInterval = null;

    // 🔢 PUNTUACIONES
    let player1Score = 0;
    let player2Score = 0;

    let hits = 0;
    let totalShown = 0;
    let roundLimit = null;

    /* ────────────────────────────────
        SELECTORES DESPLEGABLES
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

    // ⏱ NUEVO — Selector de minutos
    function populateTimeLimit() {
        timeLimitSelect.innerHTML = "";

        const blankOption = document.createElement("option");
        blankOption.value = "";
        blankOption.textContent = "";
        blankOption.selected = true;
        timeLimitSelect.appendChild(blankOption);

        for (let i = 1; i <= 30; i++) {
            const option = document.createElement("option");
            const minutes = i === 1 ? 'minuto' : 'minutos';
            option.value = i;
            option.textContent = i;
            timeLimitSelect.appendChild(option);
        }
    }

    /* ────────────────────────────────
        TEMPORIZADOR
    ───────────────────────────────── */

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
        GENERACIÓN Y GESTIÓN DE CARTAS
    ───────────────────────────────── */

    function generateOperation() {
        // ✨ MODIFICACIÓN CLAVE: Generar restas positivas (0 a 10)
        // Genera dos números aleatorios de 0 a 10
        let numA = Math.floor(Math.random() * 11); 
        let numB = Math.floor(Math.random() * 11); 
        
        // Asegura que el número superior (topNum) sea siempre el mayor o igual para que el resultado sea positivo o cero.
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
        cardContainer.innerHTML = "";
        cardData = [];
        currentCardIndex = 0;

        if (resetAll) {
            hits = 0;
            totalShown = 0;
            player1Score = 0;
            player2Score = 0;
        }

        // ⏱ reset del temporizador
        clearInterval(countdownInterval);
        timeRemaining = timeLimitSelect.value === "" ? null : parseInt(timeLimitSelect.value) * 60;
        updateCountdownDisplay();

        for (let i = 0; i < totalCards; i++)
            cardData.push(generateOperation());

        cardData.forEach((data, idx) =>
            cardContainer.appendChild(createCardElement(data, idx))
        );

        document.querySelectorAll('.card').forEach(card =>
            card.classList.remove('flipped', 'correct', 'wrong')
        );

        document.querySelectorAll('.result').forEach(el => el.style.visibility = "hidden");

        updateScoreDisplay(); // Se llama aquí para inicializar el display

        if (isGameRunning) pauseGame();
        else document.querySelectorAll('.score-buttons button').forEach(btn => btn.disabled = true);

    }

    /* ────────────────────────────────
        PUNTUACIÓN / FIN DEL JUEGO
    ───────────────────────────────── */

    function updateScoreDisplay() {
        document.getElementById('player1ScoreDisplay').textContent = player1Score;
        document.getElementById('player2ScoreDisplay').textContent = player2Score;
    }

    function endGame() {
        pauseGame();

        document.querySelectorAll('.score-buttons button')
            .forEach(button => button.disabled = true);

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
        CONTROL DE PARTIDA
    ───────────────────────────────── */

    function startGame() {
        if (isGameRunning) return;

        isGameRunning = true;
        startButton.disabled = true;
        pauseButton.disabled = false;

        document.querySelectorAll('.score-buttons button')
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

        document.querySelectorAll('.score-buttons button')
            .forEach(btn => btn.disabled = true);
    }

    function showCurrentCard() {
        if (!isGameRunning) return;

        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.classList.remove('flipped', 'correct', 'wrong'));

        const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"]`);
        currentCard.classList.add('flipped');

        currentCard.querySelector('.result').style.visibility = "hidden";
        
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

        // Aumentamos el contador de rondas solo *después* de la respuesta.
        totalShown++; 

        // Chequear si el juego debe terminar justo después de esta respuesta
        if (roundLimit !== null && totalShown >= roundLimit) {
            endGame();
            return; // Detenemos la función para no mostrar la siguiente carta
        }

        currentCardIndex = (currentCardIndex + 1) % totalCards;

        if (currentCardIndex === 0) {
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
                    card.querySelector('.sign').textContent = data.operator; // Importante para la resta
                    card.querySelector('.result').textContent = data.result;
                });

                showCurrentCard();
            }, 650);

        } else showCurrentCard();
    }

    function handleNoResponse() {
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
        // Lee el valor del botón, incluyendo el "0" grande
        const clicked = parseInt(button.textContent); 
        const resultSpan = currentCard.querySelector('.result');

        resultSpan.style.visibility = "visible";
        resultSpan.classList.remove('correct-answer', 'wrong-answer');

        const correct = clicked === result;

        if (correct) {
            parentCard.classList.add('correct');
            resultSpan.classList.add('correct-answer');
        } else {
            parentCard.classList.add('wrong');
            resultSpan.classList.add('wrong-answer');
        }

        // El score se actualiza antes de llamar a flipNextCardAfterResponse
        if (playerId === "player1")
            player1Score += correct ? 1 : -1;
        else
            player2Score += correct ? 1 : -1;

        updateScoreDisplay();

        isWaiting = true;

        setTimeout(() => {
            parentCard.classList.remove('correct', 'wrong');
            resultSpan.classList.remove('correct-answer', 'wrong-answer');
            resultSpan.style.visibility = "hidden";
            isWaiting = false;
            // Llamamos a la función que ahora también verifica si el juego debe terminar
            flipNextCardAfterResponse(); 
        }, 1000);
    }

    function attachButtonListeners(containerId, playerId) {
        // ✨ MODIFICACIÓN: Selecciona *todos* los botones dentro del contenedor, sin excluir IDs
        document.querySelectorAll(`#${containerId} .button-row button`)
            .forEach(btn => btn.addEventListener('click', () => handleButtonClick(btn, playerId)));
    }

    /* ────────────────────────────────
        EVENTOS
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

    // ⏱ tiempo límite
    timeLimitSelect.addEventListener('change', () => {
        if (timeLimitSelect.value === "") {
            timeRemaining = null;
        } else {
            timeRemaining = parseInt(timeLimitSelect.value) * 60;
        }
        updateCountdownDisplay();
    });

    // Asignación de listeners a los botones de respuesta (ahora incluyendo el botón 0)
    attachButtonListeners('player1Buttons', 'player1');
    attachButtonListeners('player2Buttons', 'player2');

    /* ────────────────────────────────
        INICIALIZACIÓN
    ───────────────────────────────── */

    populateFlipSpeed();
    populateNumCards();
    populateTimeLimit();

    roundLimit = numCardsSelect.value ? parseInt(numCardsSelect.value) : null;

    initializeCards(true);

});
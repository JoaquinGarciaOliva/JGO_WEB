document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.querySelector('.card-container');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const resetButton = document.getElementById('resetButton');
    const showResultsButton = document.getElementById('showResultsButton');
    const newOperationsButton = document.getElementById('newOperationsButton'); 
    const delaySelect = document.getElementById('delay-select'); // NUEVO: Desplegable

    const totalCards = 10;
    let cardData = []; 
    let currentCardIndex = 0;
    let intervalId = null;
    
    // El retardo se obtendrá dinámicamente
    let flipDelay = parseInt(delaySelect.value); 

    // Escuchar cambios en el desplegable
    delaySelect.addEventListener('change', () => {
        flipDelay = parseInt(delaySelect.value);
        // Si la secuencia está activa, pausarla y alertar al usuario que debe reiniciar para aplicar el cambio.
        if (intervalId !== null) {
            pauseSequence();
            alert(`El retardo se ha cambiado a ${flipDelay / 1000} segundos. Presiona "Iniciar" para reanudar con el nuevo tiempo.`);
        }
    });

    // --- (Funciones generateOperation y createCardElement - SIN CAMBIOS) ---

    // Función para generar una operación simple
    function generateOperation() {
        const num1 = Math.floor(Math.random() * 9) + 1; // 1 a 9
        const num2 = Math.floor(Math.random() * 9) + 1; // 1 a 9
        const operators = ['+', '-'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        let result, topNum, bottomNum;

        if (operator === '+') {
            topNum = num1;
            bottomNum = num2;
            result = num1 + num2;
        } else {
            const larger = Math.max(num1, num2);
            const smaller = Math.min(num1, num2);
            topNum = larger;
            bottomNum = smaller;
            result = topNum - bottomNum;
        }
        return { topNum, bottomNum, operator, result };
    }

    // Función para crear el elemento HTML de una carta (Mismo código de la versión anterior)
    function createCardElement(data, index) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;

        const operationHTML = `
            <div class="operation">
                <span class="num1">${data.topNum}</span>
                <span class="num2-with-sign">
                    <span class="sign">${data.operator}</span>
                    <span class="num2">${data.bottomNum}</span>
                </span>
                <div class="num2-line"></div>
            </div>
        `;
        
        card.innerHTML = `
            <div class="card-face card-back"></div>
            <div class="card-face card-front">
                ${operationHTML}
                <span class="result">${data.result}</span>
            </div>
        `;
        return card;
    }
    
    // Función principal para inicializar el tablero de cartas (SIN CAMBIOS)
    function initializeCards() {
        // Detener y limpiar el intervalo si está corriendo
        clearInterval(intervalId);
        intervalId = null; 
        
        cardContainer.innerHTML = '';
        cardData = [];
        currentCardIndex = 0;

        // Crear nuevas operaciones
        for (let i = 0; i < totalCards; i++) {
            cardData.push(generateOperation());
        }

        // Crear y añadir los elementos de las cartas al DOM
        cardData.forEach((data, index) => {
            cardContainer.appendChild(createCardElement(data, index));
        });

        document.querySelectorAll('.card').forEach(card => card.classList.remove('flipped'));
        document.querySelectorAll('.result').forEach(el => el.style.visibility = 'hidden');
        
        startButton.disabled = false;
        pauseButton.disabled = true;
        showResultsButton.textContent = '👁️ Mostrar Resultados';
    }

    // Función para girar la siguiente carta (Mismo código, usa la variable 'flipDelay' actualizada)
    function flipNextCard() {
        // Voltear la carta anterior si existe
        if (currentCardIndex > 0) {
            const prevCard = document.querySelector(`.card[data-index="${currentCardIndex - 1}"]`);
            if (prevCard) {
                prevCard.classList.remove('flipped');
            }
        }

        // Voltear la carta actual
        if (currentCardIndex < totalCards) {
            const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"]`);
            if (currentCard) {
                currentCard.classList.add('flipped');
            }
            currentCardIndex++;
        } else {
            // Secuencia terminada
            clearInterval(intervalId);
            intervalId = null;
            startButton.disabled = true;
            pauseButton.disabled = true;
            
             // Voltear la última carta mostrada a boca abajo
             setTimeout(() => {
                const lastCard = document.querySelector(`.card[data-index="${totalCards - 1}"]`);
                if (lastCard) {
                    lastCard.classList.remove('flipped');
                }
            }, flipDelay);
        }
    }

    // --- Control de Botones ---

    function startSequence() {
        if (intervalId !== null) return; 

        if (currentCardIndex >= totalCards) {
            currentCardIndex = 0;
            document.querySelectorAll('.card').forEach(card => card.classList.remove('flipped'));
        }
        
        // Ahora se usa la variable 'flipDelay' dinámica
        flipNextCard(); 
        intervalId = setInterval(flipNextCard, flipDelay); 
        startButton.disabled = true;
        pauseButton.disabled = false;
    }
    
    // --- (Funciones pauseSequence, toggleResults - SIN CAMBIOS) ---

    function pauseSequence() {
        clearInterval(intervalId);
        intervalId = null;
        startButton.disabled = false;
        pauseButton.disabled = true;
    }

    function toggleResults() {
        const cards = document.querySelectorAll('.card');
        const results = document.querySelectorAll('.result');
        let isVisible = results[0].style.visibility === 'visible';

        if (intervalId !== null) {
            pauseSequence();
        }

        cards.forEach(card => {
            if (!isVisible) {
                card.classList.add('flipped');
            } else {
                card.classList.remove('flipped');
            }
        });

        results.forEach(el => {
            el.style.visibility = isVisible ? 'hidden' : 'visible';
        });

        showResultsButton.textContent = isVisible ? '👁️ Mostrar Resultados' : '🙈 Ocultar Resultados';
    }

    // Asignación de eventos
    startButton.addEventListener('click', startSequence);
    pauseButton.addEventListener('click', pauseSequence);
    resetButton.addEventListener('click', initializeCards);
    showResultsButton.addEventListener('click', toggleResults);
    newOperationsButton.addEventListener('click', initializeCards); 

    // Inicializar al cargar la página
    initializeCards();
});
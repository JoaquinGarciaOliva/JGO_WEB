document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.querySelector('.card-container');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const resetButton = document.getElementById('resetButton');
    const showResultsButton = document.getElementById('showResultsButton');

    const totalCards = 10;
    let cardData = []; // Almacenará las operaciones y resultados
    let currentCardIndex = 0;
    let intervalId = null;
    const flipDelay = 5000; // 5 segundos

    // Función para generar una operación simple
    function generateOperation() {
        const num1 = Math.floor(Math.random() * 9) + 1; // 1 a 9
        const num2 = Math.floor(Math.random() * 9) + 1; // 1 a 9
        const operators = ['+', '-'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        let operation, result;

        if (operator === '+') {
            operation = `${num1} + ${num2}`;
            result = num1 + num2;
        } else {
            // Asegurar que la resta no dé un número negativo
            const larger = Math.max(num1, num2);
            const smaller = Math.min(num1, num2);
            operation = `${larger} - ${smaller}`;
            result = larger - smaller;
        }
        return { operation, result };
    }

    // Función para crear el elemento HTML de una carta
    function createCardElement(data, index) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;

        card.innerHTML = `
            <div class="card-face card-back"></div>
            <div class="card-face card-front">
                <span class="operation">${data.operation}</span>
                <span class="result">${data.result}</span>
            </div>
        `;
        return card;
    }

    // Función principal para inicializar el tablero de cartas
    function initializeCards() {
        cardContainer.innerHTML = '';
        cardData = [];
        currentCardIndex = 0;
        clearInterval(intervalId);
        intervalId = null;

        // Generar las 10 operaciones
        for (let i = 0; i < totalCards; i++) {
            cardData.push(generateOperation());
        }

        // Crear y añadir los elementos de las cartas al DOM
        cardData.forEach((data, index) => {
            cardContainer.appendChild(createCardElement(data, index));
        });

        // Ocultar resultados y habilitar/deshabilitar botones
        document.querySelectorAll('.result').forEach(el => el.style.visibility = 'hidden');
        startButton.disabled = false;
        pauseButton.disabled = true;
        showResultsButton.disabled = false;
        showResultsButton.textContent = '👁️ Mostrar Resultados';
    }

    // Función para girar la siguiente carta
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
            // Todas las cartas han sido mostradas
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

            alert('Secuencia de cartas terminada. ¡Puedes reiniciar!');
        }
    }

    // --- Control de Botones ---

    function startSequence() {
        if (intervalId !== null) return; // Ya está corriendo

        // Asegurarse de que el índice esté en un punto válido
        if (currentCardIndex >= totalCards) {
             // Si terminó la secuencia, reiniciar el índice
            currentCardIndex = 0;
        }
        
        // La primera carta se voltea inmediatamente, el intervalo empieza para las siguientes
        flipNextCard(); 
        
        intervalId = setInterval(flipNextCard, flipDelay);
        startButton.disabled = true;
        pauseButton.disabled = false;
    }

    function pauseSequence() {
        clearInterval(intervalId);
        intervalId = null;
        startButton.disabled = false;
        pauseButton.disabled = true;
    }

    function toggleResults() {
        const results = document.querySelectorAll('.result');
        const isVisible = results[0].style.visibility === 'visible';

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

    // Inicializar al cargar la página
    initializeCards();
});
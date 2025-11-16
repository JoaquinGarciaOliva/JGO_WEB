document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.querySelector('.card-container');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const resetButton = document.getElementById('resetButton');
    const showResultsButton = document.getElementById('showResultsButton');
    const newOperationsButton = document.getElementById('newOperationsButton'); 
    const delaySelect = document.getElementById('delay-select'); 

    const totalCards = 10;
    let cardData = []; 
    let currentCardIndex = 0;
    let intervalId = null;
    let flipDelay = parseInt(delaySelect.value); 

    // Escuchar cambios en el desplegable
    delaySelect.addEventListener('change', () => {
        flipDelay = parseInt(delaySelect.value);
        if (intervalId !== null) {
            pauseSequence();
            alert(`El retardo se ha cambiado a ${flipDelay / 1000} segundos. Presiona "Iniciar" para reanudar con el nuevo tiempo.`);
        }
    });

    /**
     * Función para generar una operación simple (Suma, Resta, Multiplicación o División exacta)
     */
    function generateOperation() {
        const operators = ['+', '-', '×', '÷'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        let result, topNum, bottomNum;

        // Números de una cifra (1 a 9) para Suma, Resta y Multiplicación
        const num1Single = Math.floor(Math.random() * 9) + 1; 
        const num2Single = Math.floor(Math.random() * 9) + 1;

        switch (operator) {
            case '+':
                topNum = num1Single;
                bottomNum = num2Single;
                result = topNum + bottomNum;
                break;
            
            case '-':
                // Asegurar que la resta no dé un número negativo
                topNum = Math.max(num1Single, num2Single);
                bottomNum = Math.min(num1Single, num2Single);
                result = topNum - bottomNum;
                break;
            
            case '×':
                topNum = num1Single;
                // Limitar el segundo número a 6 para mantener el resultado bajo (máx 9*6=54)
                bottomNum = Math.floor(Math.random() * 6) + 1; 
                result = topNum * bottomNum;
                break;
            
            case '÷':
                // Generar la división exacta (Dividendo de dos dígitos como máximo)
                
                // 1. Generar Cociente (1 a 9)
                const quotient = Math.floor(Math.random() * 9) + 1; 
                
                // 2. Generar Divisor (2 a 9)
                const divisor = Math.floor(Math.random() * 8) + 2; 

                // 3. Calcular Dividendo
                const dividend = quotient * divisor; // Siempre exacto

                // Aseguramos que el dividendo sea como máximo de dos dígitos (dividend <= 99)
                // Si la multiplicación de 9 * 9 = 81, el dividendo cumple con la condición.
                
                topNum = dividend;
                bottomNum = divisor;
                result = quotient; // El resultado es el cociente
                break;

            default:
                // Esto no debería pasar
                topNum = 0;
                bottomNum = 0;
                result = 0;
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
    
    // --- (Funciones initializeCards, flipNextCard, startSequence, pauseSequence, toggleResults - SIN CAMBIOS) ---
    
    // Función principal para inicializar el tablero de cartas
    function initializeCards() {
        clearInterval(intervalId);
        intervalId = null; 
        
        cardContainer.innerHTML = '';
        cardData = [];
        currentCardIndex = 0;

        // Crear nuevas operaciones
        for (let i = 0; i < totalCards; i++) {
            cardData.push(generateOperation());
        }

        cardData.forEach((data, index) => {
            cardContainer.appendChild(createCardElement(data, index));
        });

        document.querySelectorAll('.card').forEach(card => card.classList.remove('flipped'));
        document.querySelectorAll('.result').forEach(el => el.style.visibility = 'hidden');
        
        startButton.disabled = false;
        pauseButton.disabled = true;
        showResultsButton.textContent = '👁️ Mostrar Resultados';
    }

    // Función para girar la siguiente carta
    function flipNextCard() {
        if (currentCardIndex > 0) {
            const prevCard = document.querySelector(`.card[data-index="${currentCardIndex - 1}"]`);
            if (prevCard) {
                prevCard.classList.remove('flipped');
            }
        }

        if (currentCardIndex < totalCards) {
            const currentCard = document.querySelector(`.card[data-index="${currentCardIndex}"]`);
            if (currentCard) {
                currentCard.classList.add('flipped');
            }
            currentCardIndex++;
        } else {
            clearInterval(intervalId);
            intervalId = null;
            startButton.disabled = true;
            pauseButton.disabled = true;
            
             setTimeout(() => {
                const lastCard = document.querySelector(`.card[data-index="${totalCards - 1}"]`);
                if (lastCard) {
                    lastCard.classList.remove('flipped');
                }
            }, flipDelay);
        }
    }

    // Control de Botones
    function startSequence() {
        if (intervalId !== null) return; 

        if (currentCardIndex >= totalCards) {
            currentCardIndex = 0;
            document.querySelectorAll('.card').forEach(card => card.classList.remove('flipped'));
        }
        
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
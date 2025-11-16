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
     * Genera un número entero de un dígito (entre -9 y 9, excluyendo 0).
     */
    function generateSingleDigitInteger() {
        let num;
        do {
            num = Math.floor(Math.random() * 9) + 1; 
            if (Math.random() < 0.5) { 
                num = -num;
            }
        } while (num === 0);
        return num;
    }

    /**
     * Función CLAVE: Genera la operación de multiplicación.
     */
    function generateOperation() {
        const factor1 = generateSingleDigitInteger();
        const factor2 = generateSingleDigitInteger();
        
        const result = factor1 * factor2; 
        
        return { factor1, factor2, result };
    }

    /**
     * Formatea la operación en línea con punto y paréntesis.
     * Ejemplo: (-5) · 3
     */
    function formatOperation(f1, f2) {
        let str = '';

        // Factor 1: Añadir paréntesis si es negativo.
        if (f1 < 0) {
            str += `(${f1})`;
        } else {
            str += `${f1}`;
        }

        // Símbolo de multiplicación (punto) con espacio
        str += ' · ';

        // Factor 2: Añadir paréntesis si es negativo.
        if (f2 < 0) {
            str += `(${f2})`;
        } else {
            str += `${f2}`;
        }
        
        return str;
    }

    /**
     * Formatea el resultado (muestra el signo + si es positivo, aunque solo es necesario si es 0, lo cual no ocurre aquí).
     */
    function formatResult(num) {
        return num; // Dejamos que JS muestre el signo negativo. Para la multiplicación no es necesario el + explícito.
    }


    /**
     * Función para crear el elemento HTML de una carta (Simplificada para línea).
     */
    function createCardElement(data, index) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;

        // Estructura simplificada para la operación en línea
        const operationHTML = formatOperation(data.factor1, data.factor2);
        
        card.innerHTML = `
            <div class="card-face card-back"></div>
            <div class="card-face card-front">
                <span class="operation-line">${operationHTML}</span>
                <div class="result-line"></div>
                <span class="result-display">${formatResult(data.result)}</span>
            </div>
        `;
        return card;
    }
    
    // --- (initializeCards, flipNextCard, startSequence, pauseSequence, toggleResults - SIN CAMBIOS en lógica) ---
    
    function initializeCards() {
        clearInterval(intervalId);
        intervalId = null; 
        cardContainer.innerHTML = '';
        cardData = [];
        currentCardIndex = 0;

        for (let i = 0; i < totalCards; i++) {
            cardData.push(generateOperation());
        }

        cardData.forEach((data, index) => {
            cardContainer.appendChild(createCardElement(data, index));
        });

        document.querySelectorAll('.card').forEach(card => card.classList.remove('flipped'));
        document.querySelectorAll('.result-display').forEach(el => el.style.visibility = 'hidden');
        
        startButton.disabled = false;
        pauseButton.disabled = true;
        showResultsButton.textContent = '👁️ Mostrar Resultados';
    }

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
        const results = document.querySelectorAll('.result-display'); // Selector actualizado
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
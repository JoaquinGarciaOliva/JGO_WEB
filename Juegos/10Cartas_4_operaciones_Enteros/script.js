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

    // Función para generar un número entero de un dígito (entre -9 y 9, excluyendo 0).
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

    // Función para generar la operación de suma de dos números enteros.
    function generateOperation() {
        const topNum = generateSingleDigitInteger();
        const bottomNum = generateSingleDigitInteger();
        
        const result = topNum + bottomNum; 
        
        return { topNum, bottomNum, result };
    }

    /**
     * FUNCIÓN MODIFICADA CLAVE: Asegura que los números positivos tengan el signo '+' visible.
     */
    function formatNumber(num) {
        if (num >= 0) {
            return `+${num}`;
        }
        return num; // Los números negativos ya incluyen el signo '-'
    }

    /**
     * Función para crear el elemento HTML de una carta (Usa la nueva formatNumber).
     */
    function createCardElement(data, index) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;

        const operationHTML = `
            <div class="operation">
                <span class="num1">${formatNumber(data.topNum)}</span>
                <span class="num2">${formatNumber(data.bottomNum)}</span>
                <div class="num2-line"></div>
            </div>
        `;
        
        card.innerHTML = `
            <div class="card-face card-back"></div>
            <div class="card-face card-front">
                ${operationHTML}
                <span class="result">${formatNumber(data.result)}</span>
            </div>
        `;
        return card;
    }
    
    // NOTA: La función initializeCards y toggleResults también deben actualizar el resultado
    // para usar formatNumber y mostrar el signo + si es positivo.

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
        document.querySelectorAll('.result').forEach(el => el.style.visibility = 'hidden');
        
        startButton.disabled = false;
        pauseButton.disabled = true;
        showResultsButton.textContent = '👁️ Mostrar Resultados';
    }
    
    // ... (El resto de las funciones flipNextCard, startSequence, pauseSequence, toggleResults) ...
    // Se mantiene igual, pero he actualizado el createCardElement para usar formatNumber en el resultado.

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
document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.querySelector('.card-container');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton'); 
    const showResultsButton = document.getElementById('showResultsButton');
    const newOperationsButton = document.getElementById('newOperationsButton'); 
    const flipSpeedSelect = document.getElementById('flipSpeed'); 
    const multiplicationTableSelect = document.getElementById('multiplicationTableSelect'); 

    const totalCards = 10;
    let cardData = []; 
    let currentCardIndex = 0;
    let intervalId = null;
    let flipDelay = parseInt(flipSpeedSelect.value); 
    let selectedTable = 0; 

    // --- FUNCIÓN PARA LLENAR EL DESPLEGABLE DE TIEMPO ---
    function populateFlipSpeed() {
        flipSpeedSelect.innerHTML = '';
        
        for (let i = 1; i <= 20; i++) {
            const option = document.createElement('option');
            option.value = i * 1000;
            option.textContent = i;
            
            if (i === 5) {
                option.selected = true;
            }
            flipSpeedSelect.appendChild(option);
        }
    }

    // --- FUNCIÓN PARA LLENAR EL DESPLEGABLE DE TABLAS (SIN CAMBIOS) ---
    function populateMultiplicationTableSelect() {
        multiplicationTableSelect.innerHTML = '';
        
        // Opción Aleatoria ("Blanco") - Texto vacío
        const blankOption = document.createElement('option');
        blankOption.value = '0'; // Valor 0 indica aleatorio
        blankOption.textContent = ''; 
        blankOption.selected = true;
        multiplicationTableSelect.appendChild(blankOption);

        // Opciones del 1 al 10 - Solo el número
        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = i; 
            multiplicationTableSelect.appendChild(option);
        }

        selectedTable = parseInt(multiplicationTableSelect.value);
    }

    // --- ✨ FUNCIÓN MODIFICADA: Generar Multiplicaciones con la tabla abajo ---
    function generateOperation() {
        const operator = 'x'; 
        let num1; // Multiplicando (arriba)
        let num2; // Multiplicador (abajo)
        let factorAleatorio = Math.floor(Math.random() * 10) + 1; // 1 a 10

        if (selectedTable === 0) {
            // Modo "Blanco" (Aleatorio): Ambos números aleatorios
            let random1 = Math.floor(Math.random() * 10) + 1; 
            let random2 = Math.floor(Math.random() * 10) + 1;

            // Por estética, ponemos el número más grande arriba (opcional)
            if (random1 > random2) {
                num1 = random1;
                num2 = random2;
            } else {
                num1 = random2;
                num2 = random1;
            }
        } else {
            // Tabla Específica: La tabla elegida va abajo (num2)
            num1 = factorAleatorio; // Factor aleatorio va arriba
            num2 = selectedTable;   // ✨ CAMBIO: Tabla elegida va abajo
        }
        
        const result = num1 * num2;
        
        return { topNum: num1, bottomNum: num2, operator, result };
    }
    // --- FIN FUNCIÓN MODIFICADA ---

    // Función para crear el elemento HTML de una carta (sin cambios)
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
            </div>
        `;
        
        card.innerHTML = `
            <div class="card-face card-back ${imageClass}"></div> 
            <div class="card-face card-front">
                ${operationHTML}
                <span class="result">${data.result}</span>
            </div>
        `;
        return card;
    }

    // Función principal para inicializar el tablero de cartas (sin cambios funcionales importantes)
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
        
        const showResultsIcon = showResultsButton.querySelector('img');
        showResultsIcon.src = 'versolucion.png'; 
        showResultsIcon.alt = 'Mostrar Resultados';
    }

    // Función para girar la siguiente carta (sin cambios)
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
            // Secuencia terminada
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

    // --- Control de Botones y Secuencia (sin cambios) ---

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
        const showResultsIcon = showResultsButton.querySelector('img');

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

        if (isVisible) {
            showResultsIcon.src = 'versolucion.png';
            showResultsIcon.alt = 'Resultados';
        } else {
            showResultsIcon.src = 'ocultarsolucion.png'; 
            showResultsIcon.alt = 'Ocultar Resultados';
        }
    }

    // --- Asignación de Eventos ---
    startButton.addEventListener('click', startSequence);
    pauseButton.addEventListener('click', pauseSequence);    
    showResultsButton.addEventListener('click', toggleResults);
    newOperationsButton.addEventListener('click', initializeCards);

    // Evento: Actualizar flipDelay
    flipSpeedSelect.addEventListener('change', (e) => {
        flipDelay = parseInt(e.target.value);
        if (intervalId !== null) {
            pauseSequence();
            startSequence(); 
        }
    });

    // Evento: Actualizar tabla seleccionada y regenerar cartas
    multiplicationTableSelect.addEventListener('change', (e) => {
        selectedTable = parseInt(e.target.value);
        initializeCards(); // Regenerar y reiniciar con las nuevas operaciones
    });

    // Inicializar al cargar la página
    populateFlipSpeed();
    populateMultiplicationTableSelect();
    initializeCards();
});
document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.querySelector('.card-container');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton'); 
    const showResultsButton = document.getElementById('showResultsButton');
    const newOperationsButton = document.getElementById('newOperationsButton'); 
    // NUEVO: Selector de velocidad
    const flipSpeedSelect = document.getElementById('flipSpeed'); 

    const totalCards = 10;
    let cardData = []; 
    let currentCardIndex = 0;
    let intervalId = null;
    // INICIALIZACIÓN: Usar el valor por defecto (5000ms = 5s)
    let flipDelay = parseInt(flipSpeedSelect.value); 

    // --- FUNCIÓN NUEVA: Llenar el desplegable ---
    function populateFlipSpeed() {
        // Limpiar el contenido existente
        flipSpeedSelect.innerHTML = '';
        
        for (let i = 1; i <= 20; i++) {
            const option = document.createElement('option');
            // Almacenar el valor en milisegundos (1000ms * i)
            option.value = i * 1000;
            // Mostrar el valor en segundos
            option.textContent = i;
            
            // Seleccionar 5 segundos (5000ms) como valor inicial
            if (i === 5) {
                option.selected = true;
            }
            flipSpeedSelect.appendChild(option);
        }
    }

    // Función para generar una operación simple (SOLO RESTAS POSITIVAS)
    function generateOperation() {
        // ✨ MODIFICACIÓN: Generar restas con el primer número entre 0-20 y el segundo entre 0-10,
        // asegurando que el resultado sea POSITIVO (>= 0).
        
        // 1. Generar el segundo número (sustraendo) de 0 a 10.
        let num2 = Math.floor(Math.random() * 11); // 0 a 10
        
        // 2. Generar el primer número (minuendo) de 0 a 20.
        let num1 = Math.floor(Math.random() * 21); // 0 a 20
        
        // 3. Asegurar que num1 >= num2 para garantizar resultado >= 0.
        // Si num1 es menor que num2, generamos un nuevo num1 que sea al menos num2,
        // y que no exceda 20.
        while (num1 < num2) {
            // Regenerar num1, forzándolo a ser >= num2 y <= 20.
            // Para asegurar la distribución, regeneramos hasta que se cumpla la condición.
            // Opcional: Podrías simplemente asignar num1 = num2 para el caso más sencillo.
            num1 = Math.floor(Math.random() * 21); // Intentamos de nuevo de 0 a 20
        }
        
        const topNum = num1;
        const bottomNum = num2; 
        const operator = '-';
        const result = topNum - bottomNum; // Resultado siempre >= 0
        
        return { topNum, bottomNum, operator, result };
    }

    // Función para crear el elemento HTML de una carta
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

    // Función principal para inicializar el tablero de cartas
    function initializeCards() {
        // Detener y limpiar el intervalo si está corriendo
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
            // Secuencia terminada
            clearInterval(intervalId);
            intervalId = null;
            startButton.disabled = true;
            pauseButton.disabled = true;
            
             // Usar el valor actual de flipDelay para el último timeout
             setTimeout(() => {
                 const lastCard = document.querySelector(`.card[data-index="${totalCards - 1}"]`);
                 if (lastCard) {
                     lastCard.classList.remove('flipped');
                 }
             }, flipDelay);
        }
    }

    // --- Control de Botones y Secuencia ---

    function startSequence() {
        if (intervalId !== null) return; 

        if (currentCardIndex >= totalCards) {
            currentCardIndex = 0;
            document.querySelectorAll('.card').forEach(card => card.classList.remove('flipped'));
        }
        
        // REINICIAR el intervalo con el nuevo flipDelay
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
        // ... (resto de la función toggleResults sin cambios)
        const cards = document.querySelectorAll('.card');
        const results = document.querySelectorAll('.result');
        let isVisible = results[0].style.visibility === 'visible';
        const showResultsIcon = showResultsButton.querySelector('img'); // Icono

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

    // NUEVO EVENTO: Actualizar flipDelay cuando se cambia el desplegable
    flipSpeedSelect.addEventListener('change', (e) => {
        // Asegurarse de que el valor sea numérico y en milisegundos
        flipDelay = parseInt(e.target.value);
        
        // Si la secuencia está activa, detenerla y reiniciarla con el nuevo tiempo
        if (intervalId !== null) {
            pauseSequence();
            startSequence(); 
        }
    });

    // Inicializar al cargar la página
    populateFlipSpeed(); // Llenar el desplegable al inicio
    initializeCards();
});
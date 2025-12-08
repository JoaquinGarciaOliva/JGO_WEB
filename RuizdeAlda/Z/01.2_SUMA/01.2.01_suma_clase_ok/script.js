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


  function formatResult(num) {
        if (num > 0) {
            return `+${num}`;
        }
        // Para números negativos, el signo '-' se incluye automáticamente. 
        // Para el 0, se mantiene sin signo.
        return num.toString();
    }

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

    // Función para generar una operación simple (SOLO SUMAS)
  // ✨ MODIFICACIÓN: Función para generar una "operación" de números firmados
function getRandomNumber() {
    let num = Math.floor(Math.random() * 10) + 1; // 1 a 10
    return Math.random() < 0.5 ? -num : num; // 50% de probabilidad de ser negativo
}
function formatTopNumber(num) {
    if (num < 0) {
        return num.toString(); // Negativo: siempre lleva '-'
    }
    // Positivo: 50% de probabilidad de llevar el signo '+'
    const includeSign = Math.random() < 0.5;
    return includeSign ? `+${num}` : num.toString();
}
function formatBottomNumber(num) {
    if (num < 0) {
        return num.toString(); // Negativo: siempre lleva '-'
    }
    // Positivo: OBLIGATORIO llevar el signo '+'
    return `+${num}`;
}

    function generateOperation() {
        const num1 = getRandomNumber();
        const num2 = getRandomNumber();
        
        // Formateamos los números según las reglas del signo
        const topNumFormatted = formatTopNumber(num1);
        const bottomNumFormatted = formatBottomNumber(num2); // Siempre con '+' si es positivo
        
        // Calculamos el resultado real de la operación
        const result = num1 + num2;
        const resultFormatted = formatResult(result);

        // NOTA: El operador se usa en el HTML como el signo principal. 
        // Lo he cambiado a un espacio vacío ya que los signos van en los números.
        const operator = ''; 
        
        return { 
            num1: topNumFormatted, // Número superior ya formateado (signo aleatorio para '+')
            num2: bottomNumFormatted, // Número inferior ya formateado (signo obligatorio para '+')
            result: resultFormatted // ⬅️ USAMOS EL RESULTADO CON EL SIGNO 
        };
    }

    // Función para crear el elemento HTML de una carta
// Función para crear el elemento HTML de una carta

function createCardElement(data, index) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;

        const imageClass = (index + 1) % 2 === 0 ? 'image-even' : 'image-odd'; 
        
        const operationHTML = `
            <div class="operation in-line"> 
                 <span class="num1">${data.num1}</span>
                 <span class="num2">${data.num2}</span>                 
            </div>
            <div class="num2-line"></div>
        `;
        
        card.innerHTML = `
            <div class="card-face card-back ${imageClass}"></div> 
            <div class="card-face card-front small-font"> ${operationHTML}
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
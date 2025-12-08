document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.querySelector('.card-container');
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton'); 
    const showResultsButton = document.getElementById('showResultsButton');
    const newOperationsButton = document.getElementById('newOperationsButton'); 
    const flipSpeedSelect = document.getElementById('flipSpeed'); 

   // NUEVOS ELEMENTOS DEL DOM PARA EL CONTADOR
    const countdownMinutesSelect = document.getElementById('countdownMinutes');
    const countdownDisplay = document.getElementById('countdownDisplay');
  
 // --- Variables de Estado ---
    const totalCards = 7; 
    let cardData = []; 
    let currentCardIndex = 0;
    let intervalId = null;
    let flipDelay = parseInt(flipSpeedSelect.value); 
    
    let countdownIntervalId = null; // Intervalo para el contador
    let remainingTime = 0; // Tiempo restante en segundos
    
// --- FUNCIÓN populateFlipSpeed (SIN CAMBIOS) ---
// Llenar el desplegable de Velocidad
    function populateFlipSpeed() {
        flipSpeedSelect.innerHTML = '';
        
        for (let i = 1; i <= 20; i++) {
            const option = document.createElement('option');
            option.value = i * 1000;
            option.textContent = i;
            
            if (i === 3) {
                option.selected = true;
            }
            flipSpeedSelect.appendChild(option);
        }
    }

  
// Llenar el desplegable de Minutos
    function populateCountdownMinutes() {
        countdownMinutesSelect.innerHTML = '';
        // Opciones de 1 a 10 minutos
        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === 1) {
                option.selected = true;
            }
            countdownMinutesSelect.appendChild(option);
        }
    }

  
// --- Control del Contador ---

    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function updateCountdownDisplay() {
        if (remainingTime <= 0) {
            stopCountdown();
            countdownDisplay.textContent = '¡TIEMPO!';
            countdownDisplay.classList.add('time-up');
            return;
        }
        countdownDisplay.textContent = formatTime(remainingTime);
        remainingTime--;
    }
    
    function startCountdown() {
        if (countdownIntervalId !== null) return; 

        const minutes = parseInt(countdownMinutesSelect.value);
        // Solo iniciar si el tiempo restante no es 0
        if (remainingTime === 0) {
            remainingTime = minutes * 60;
        }

        countdownDisplay.classList.remove('time-up');
        
        // Ejecutar la primera actualización inmediatamente para mostrar el tiempo inicial
        updateCountdownDisplay();
        
        countdownIntervalId = setInterval(updateCountdownDisplay, 1000);
    }
    
    function stopCountdown() {
        clearInterval(countdownIntervalId);
        countdownIntervalId = null;
    }


  // --- FUNCIÓN generateNumber (SIN CAMBIOS) ---
    function generateNumber(index) {
        let max;
        if (index < 4) {
            max = 10; 
        } else if (index < 6) {
            max = 100;
        } else {
            max = 1000;
        }
        
        const number = Math.floor(Math.random() * max) + 1;         
        return { result: number }; 
    }

    // --- FUNCIÓN createCardElement (SIN CAMBIOS) ---
    function createCardElement(data, index) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;
        
        const resultClass = index === totalCards - 1 ? 'result red-result' : 'result';
        const imageClass = (index + 1) % 2 === 0 ? 'image-even' : 'image-odd'; 
        
        card.innerHTML = `
            <div class="card-face card-back ${imageClass}"></div> 
            <div class="card-face card-front">
                <span class="${resultClass}">${data.result}</span>
            </div>
        `;
        return card;
    }


    // --- FUNCIÓN initializeCards (SIN CAMBIOS) ---
    function initializeCards() {
        clearInterval(intervalId);
        intervalId = null; 
        stopCountdown(); // Detener el contador

        cardContainer.innerHTML = '';
        cardData = [];
        currentCardIndex = 0;

        for (let i = 0; i < totalCards; i++) {
            cardData.push(generateNumber(i));
        }

        cardData.forEach((data, index) => {
            cardContainer.appendChild(createCardElement(data, index));
        });

        document.querySelectorAll('.card').forEach(card => card.classList.remove('flipped'));
         
     // Reiniciar el display del contador al valor seleccionado
        const initialMinutes = parseInt(countdownMinutesSelect.value);
        remainingTime = initialMinutes * 60;
        countdownDisplay.textContent = formatTime(remainingTime);
        countdownDisplay.classList.remove('time-up');

        startButton.disabled = false;
        pauseButton.disabled = true;
 
          
        const showResultsIcon = showResultsButton.querySelector('img');
        showResultsIcon.src = 'versolucion.png'; 
        showResultsIcon.alt = 'Mostrar Resultados';
    }

    // MODIFICACIÓN PRINCIPAL: Se elimina el código que revierte la carta anterior
    function flipNextCard() {
        // *** SE ELIMINA LA LÓGICA PARA GIRAR LA CARTA ANTERIOR BOCA ABAJO ***

        // Voltear la carta actual (se mantiene boca arriba)
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
            
             // INICIA EL CONTADOR
                startCountdown();
        }
    }

    // --- Control de Botones y Secuencia (SIN CAMBIOS FUNCIONALES) ---

    function startSequence() {
        if (intervalId !== null) return; 

        // Si se reinicia, primero se asegura de que todas estén boca abajo (esto lo hace initializeCards o el flujo normal si no ha terminado)
        if (currentCardIndex >= totalCards) {
            currentCardIndex = 0;
            document.querySelectorAll('.card').forEach(card => card.classList.remove('flipped'));
            stopCountdown(); // Asegurarse de que el contador anterior esté parado
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

    // Se modifica toggleResults para asegurar que el modo "Mostrar Solución" se puede activar
    function toggleResults() {
        const cards = document.querySelectorAll('.card');
        const results = document.querySelectorAll('.result');
        // El estado de visibilidad se determina por la clase 'flipped' en la primera carta
        let isVisible = cards[0].classList.contains('flipped') && results[0].style.visibility === 'visible';
        const showResultsIcon = showResultsButton.querySelector('img'); 

        if (intervalId !== null) {
            pauseSequence();
        }

       // Si pausamos o mostramos/ocultamos manualmente, el contador debe detenerse
        stopCountdown();

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

    // --- Asignación de Eventos (SIN CAMBIOS) ---
    startButton.addEventListener('click', startSequence);
    pauseButton.addEventListener('click', pauseSequence);    
    showResultsButton.addEventListener('click', toggleResults);
    newOperationsButton.addEventListener('click', initializeCards);

    flipSpeedSelect.addEventListener('change', (e) => {
        flipDelay = parseInt(e.target.value);
        
        if (intervalId !== null) {
            pauseSequence();
            startSequence(); 
        }
    });

     
    // Inicializar al cargar la página
    populateFlipSpeed(); 
    populateCountdownMinutes();
    initializeCards();
});
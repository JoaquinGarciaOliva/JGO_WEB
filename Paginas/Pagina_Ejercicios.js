document.addEventListener('DOMContentLoaded', () => {
    // Seleccionamos los contenedores que dispararán la solución al hacer clic
    const solutionTriggerContainers = document.querySelectorAll('.solution-trigger-container');
    const solutionModal = document.getElementById('solutionModal');
    const closeButton = document.querySelector('.modal-content .close-button');
    const solutionText = document.getElementById('solutionText');

    // Manejar clics en los contenedores de la imagen/tooltip
    solutionTriggerContainers.forEach(container => {
        container.addEventListener('click', () => {
            const solutionId = container.dataset.solutionId; // Obtiene el ID de la solución
            const solutionContent = document.getElementById(solutionId); // Encuentra el div oculto con la solución

            if (solutionContent) {
                solutionText.innerHTML = solutionContent.innerHTML; // Copia el contenido HTML de la solución
                solutionModal.style.display = 'flex'; // Muestra la modal
                document.body.style.overflow = 'hidden'; // Evita el scroll en el body
            }
        });
    });

    // Manejar clic en el botón de cerrar la modal
    closeButton.addEventListener('click', () => {
        solutionModal.style.display = 'none'; // Oculta la modal
        solutionText.innerHTML = ''; // Limpia el contenido de la solución
        document.body.style.overflow = ''; // Restaura el scroll del body
    });

    // Manejar clic fuera del contenido de la modal para cerrarla
    window.addEventListener('click', (event) => {
        if (event.target === solutionModal) {
            solutionModal.style.display = 'none'; // Oculta la modal
            solutionText.innerHTML = ''; // Limpia el contenido de la solución
            document.body.style.overflow = ''; // Restaura el scroll del body
        }
    });

    // Opcional: Cerrar la modal con la tecla Escape
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && solutionModal.style.display === 'flex') {
            solutionModal.style.display = 'none';
            solutionText.innerHTML = '';
            document.body.style.overflow = '';
        }
    });
});




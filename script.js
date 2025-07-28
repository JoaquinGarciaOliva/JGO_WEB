// *****************  SPLITTER ***************

document.addEventListener('DOMContentLoaded', () => {
    const divider = document.querySelector('.dividir');
    const leftPanel = document.querySelector('.left-panel');
    const rightPanel = document.querySelector('.right-panel');
    const container = document.querySelector('.container');

    let isDragging = false; // Bandera para saber si se está arrastrando

    // 1. Cuando el ratón presiona el divisor
    divider.addEventListener('mousedown', (e) => {
        isDragging = true;
        // Agrega una clase para cambiar el cursor de todo el body mientras se arrastra
        document.body.style.cursor = 'ew-resize';
        // Deshabilita la selección de texto para evitar comportamientos extraños durante el arrastre
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
    });

    // 2. Cuando el ratón se mueve (solo si isDragging es true)
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return; // Si no estamos arrastrando, salimos

        // Calcula la nueva posición del divisor
        // e.clientX es la posición horizontal actual del cursor
        const containerRect = container.getBoundingClientRect(); // Obtiene el tamaño y posición del contenedor
        let newLeftWidth = e.clientX - containerRect.left; // Ancho del panel izquierdo

        // Limita el ancho mínimo de los paneles (opcional)
        const minWidth = 100; // Por ejemplo, un mínimo de 100px para cada panel
        const maxLeftWidth = containerRect.width - divider.offsetWidth - minWidth;

        if (newLeftWidth < minWidth) {
            newLeftWidth = minWidth;
        } else if (newLeftWidth > maxLeftWidth) {
            newLeftWidth = maxLeftWidth;
        }

        // Aplica el nuevo ancho al panel izquierdo
        leftPanel.style.width = `${newLeftWidth}px`;
        // El panel derecho se ajustará automáticamente gracias a flex-grow: 1
    });

    // 3. Cuando el botón del ratón se suelta (finaliza el arrastre)
    document.addEventListener('mouseup', () => {
        isDragging = false;
        // Restaura el cursor y la selección de texto
        document.body.style.cursor = 'default';
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
    });
});

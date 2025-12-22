/**
 * Inserta el HTML del footer fijo justo antes del cierre de la etiqueta </body>.
 */
function insertarFooter() {
    // El código HTML que quieres insertar, guardado como una cadena de texto.
    const footerHTML = `
        <footer class="footer-fijo"> 
             <p>
                <img src="../../../Principal/licencia.png" alt="CC BY-NC-ND 4.0" style="max-width: 10em; max-height: 7em; margin-bottom: 2.5em;">
                 2025 Website developed by Joaquin Garcia Oliva and licensed under 
                <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/">CC BY-NC-ND 4.0</a>
                <img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style="max-width: 1em; max-height: 1em; margin-left: .2em;">
                <img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style="max-width: 1em; max-height: 1em; margin-left: .2em;">
                <img src="https://mirrors.creativecommons.org/presskit/icons/nc.svg" alt="" style="max-width: 1em; max-height: 1em; margin-left: .2em;">
                <img src="https://mirrors.creativecommons.org/presskit/icons/nd.svg" alt="" style="max-width: 1em; max-height: 1em; margin-left: .2em;">
            </p>
        
      </footer>
    `;

    // Selecciona el body del documento
    const body = document.body;

    // Verifica que el body exista antes de intentar insertar el contenido
    if (body) {
        // 'beforeend' inserta el HTML justo antes del cierre de la etiqueta body.
        body.insertAdjacentHTML('beforeend', footerHTML);
    } else {
        console.error("No se encontró la etiqueta <body> para insertar el footer.");
    }
}

// Llama a la función una vez que el script se ha cargado.
// Es mejor llamarla después de que el DOM esté completamente cargado.
if (document.readyState === 'loading') {
    // Si el DOM aún se está cargando, espera al evento 'DOMContentLoaded'
    document.addEventListener('DOMContentLoaded', insertarFooter);
} else {
    // Si el DOM ya está cargado (o el script se carga al final del <body>), ejecútala inmediatamente
    insertarFooter();
}
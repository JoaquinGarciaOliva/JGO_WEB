
//************  VENTANA MODAL *********************

// Obtener los elementos del DOM
const myImage = document.getElementById('ayuda');
const myModal = document.getElementById('myModal');
const closeButton = document.querySelector('.close-button');
const modalIframe = document.getElementById('modalIframe');

// Define la URL que quieres cargar
const targetUrl = 'https://www.google.com'; // ¡Cambia esto por la URL que desees!

// Cuando el usuario hace clic en la imagen, abre la modal
//myImage.onclick = function() {
  //  myModal.style.display = 'flex'; // Cambia a 'flex' para mostrar y centrar
  // modalIframe.src = targetUrl; // Establece la URL del iframe
  // document.body.style.overflow = 'hidden'; // Evita el scroll en el body cuando la modal está abierta
//}

function ventanamodal(rutaweb) { 
      myModal.style.display = 'flex'; // Cambia a 'flex' para mostrar y centrar
      modalIframe.src = rutaweb; // Establece la URL del iframe
      document.body.style.overflow = 'hidden'; // Evita el scroll en el body cuando la modal está abierta  
    }


// Cuando el usuario hace clic en el botón de cerrar (x), cierra la modal
closeButton.onclick = function() {
    myModal.style.display = 'none'; // Oculta la modal
    modalIframe.src = ''; // Limpia la URL del iframe para detener cualquier reproducción o carga
    document.body.style.overflow = ''; // Restaura el scroll del body 
}

// Cuando el usuario hace clic fuera del contenido de la modal, cierra la modal
window.onclick = function(event) {
    if (event.target == myModal) {
        myModal.style.display = 'none'; // Oculta la modal
        modalIframe.src = ''; // Limpia la URL del iframe
        document.body.style.overflow = ''; // Restaura el scroll del body
    }
}

// Opcional: Cerrar la modal con la tecla Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && myModal.style.display === 'flex') {
        myModal.style.display = 'none';
        modalIframe.src = '';
        document.body.style.overflow = '';
    }
});


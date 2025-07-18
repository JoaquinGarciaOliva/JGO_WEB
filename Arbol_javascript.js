       

 //  *********************
  // Función para cambiar el contenido del segundo iframe basado en la selección
        function actualizarIframe2(contenido) {            
            let iframe2 = document.getElementById("webviewer");  // Obtener el iframe2 (el del tercer div)            
            iframe2.src = contenido;                             // Cambiar la URL del iframe2 para mostrar una página diferente
        }


  function Mostrar_Web(Tiposel) {       
       const Datossel= document.getElementById('DivHeader'); 
       const valor1 = Datossel.getAttribute('Youtube');       
       const valor2 = Datossel.getAttribute('teoria');       
       const valor3 = Datossel.getAttribute('ejemplos');        
       const valor4 = Datossel.getAttribute('ejercicios'); 
                  


       if (Tiposel == 1) { actualizarIframe2(valor1); document.getElementById('iconvideo').src = "Imagenes/play_video_down.png"; }
                    else { document.getElementById('iconvideo').src = "Imagenes/play_video.png";};
       if (Tiposel == 2) { actualizarIframe2(valor2);document.getElementById('iconteoria').src = "Imagenes/teoria_down.png"; }
                    else { document.getElementById('iconteoria').src = "Imagenes/teoria.png";};
       if (Tiposel == 3) { actualizarIframe2(valor3);document.getElementById('iconejemplos').src = "Imagenes/ejemplos_down.png"; }
                    else { document.getElementById('iconejemplos').src = "Imagenes/ejemplos.png";};
       if (Tiposel == 4) { actualizarIframe2(valor4);document.getElementById('iconejercicios').src = "Imagenes/ejercicios_down.png"; }
                    else { document.getElementById('iconejercicios').src = "Imagenes/ejercicios.png";};
    }

  function cambiarPropiedad(Codigosel) {      
      const origen = document.getElementById(Codigosel);
      const Datossel= document.getElementById('DivHeader');
   
      const valor1 = origen.getAttribute('Youtube');     Datossel.setAttribute('Youtube', valor1);      
      const valor2 = origen.getAttribute('teoria');      Datossel.setAttribute('teoria', valor2);           
      const valor3 = origen.getAttribute('ejemplos');    Datossel.setAttribute('ejemplos', valor3);          
      const valor4 = origen.getAttribute('ejercicios');  Datossel.setAttribute('ejercicios', valor4);          

      Mostrar_Web(1);
    }

//  *********************  Muestra sólo los nodos menores o iguales a algo, tipo de importancia *********
  function filtrarDivs(Tiposel) {
       const Datossel= document.getElementById('DivHeader');
       Datossel.setAttribute('Tipo', Tiposel);
           
     const divs2 = document.querySelectorAll('.folder');
      divs2.forEach(div => {
        const prop = div.getAttribute('Tipo');         
        if (prop > Tiposel) { div.style.display = "none";} else { div.style.display = "block";}
      });

      const divs = document.querySelectorAll('.tree-node');
      divs.forEach(div => {
        const prop = div.getAttribute('Tipo');         
        if (prop > Tiposel) { div.style.display = "none";} else { div.style.display = "block";}
      });


       if (Tiposel == 1) { document.getElementById('nivel1').src = "Imagenes/flecha_red_down.png"; }
                    else { document.getElementById('nivel1').src = "Imagenes/flecha_red.png";};
       if (Tiposel == 2) { document.getElementById('nivel2').src = "Imagenes/flecha_blue_down.png"; }
                    else { document.getElementById('nivel2').src = "Imagenes/flecha_blue.png";};
       if (Tiposel == 3) { document.getElementById('nivel3').src = "Imagenes/flecha_green_down.png"; }
                    else { document.getElementById('nivel3').src = "Imagenes/flecha_green.png";};
       if (Tiposel == 4) { document.getElementById('nivel4').src = "Imagenes/flecha_lila_down.png"; }
                    else { document.getElementById('nivel4').src = "Imagenes/flecha_lila.png";};

    }


 // ************ SELECCIONAR CARPETA - cambiando el icono ************
   let selectedcarpeta = null;
   function toggleVisibility2(element,codigo) {              
            let sublist = element.nextElementSibling;
            if (sublist) {                 
                sublist.classList.toggle('hidden');                   
                selectedcarpeta = element;                                             
                cambiarImagen(selectedcarpeta.querySelector('.manImg'));
            }            
            cambiarPropiedad(codigo);           
     }

  
  function cambiarImagen(element) {
    let img = element;                                
    let rutaCompleta = img.src;   // Obtener el nombre de la imagen actual 
    let nombreImagen = rutaCompleta.substring(rutaCompleta.lastIndexOf('/') + 1); //nombre del archivo
      if (nombreImagen == "folder.bmp"){img.src = "Imagenes/mydoc.gif";}else{img.src = "Imagenes/folder.bmp";}    
       
  }




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


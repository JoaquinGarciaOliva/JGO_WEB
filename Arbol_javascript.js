       

 //  *********************
  // Función para cambiar el contenido del segundo iframe basado en la selección
        function actualizarIframe2(contenido) {            
            let iframe2 = document.getElementById("webviewer");  // Obtener el iframe2 (el del tercer div)            
            iframe2.src = contenido;                             // Cambiar la URL del iframe2 para mostrar una página diferente
        }

 // ************ SELECCIONAR CARPETA - cambiando el icono ************
   let selectedcarpeta = null;
   function toggleVisibility(element,url) {              
            let sublist = element.nextElementSibling;
            if (sublist) {                 
                sublist.classList.toggle('hidden');                   
                selectedcarpeta = element;                                                
                cambiarImagen(selectedcarpeta.querySelector('.manImg'));
            }            
            //loadContent(url);  
            actualizarIframe2(url);          
     }

  function cambiarImagen(element) {
    let img = element;                                
    let rutaCompleta = img.src;   // Obtener el nombre de la imagen actual 
    let nombreImagen = rutaCompleta.substring(rutaCompleta.lastIndexOf('/') + 1); //nombre del archivo
      if (nombreImagen == "Folder.bmp"){img.src = "imagenes/mydoc.gif";}else{img.src = "imagenes/Folder.bmp";}    
       
  }

    

 // *************** SELECCIONAR NODO *************


        let selectedNode = null;
        function selectNode(element, url) {
            if (selectedNode) {
                selectedNode.classList.remove('selected');
                selectedNode.querySelector('.icon').textContent = selectedNode.dataset.defaultIcon;
            }
            selectedNode = element;
            selectedNode.classList.add('selected');
            selectedNode.dataset.defaultIcon = selectedNode.querySelector('.icon').textContent;
            selectedNode.querySelector('.icon').textContent = '✅';
            document.querySelector("#contentFrame iframe").src = url;
        }
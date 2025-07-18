  
       
       //***************** redimensionar, dos partes**********************
        const resizer = document.getElementById('resizer');
        const sidebar = document.querySelector('.sidebar');        
        let isResizing = false;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        });

        function resize(e) {
            if (isResizing) {
                const newWidth = Math.max(150, e.clientX);
                sidebar.style.width = `${newWidth}px`;               
            }
        }
       
        function stopResize() {
            isResizing = false;
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
       }

   
      

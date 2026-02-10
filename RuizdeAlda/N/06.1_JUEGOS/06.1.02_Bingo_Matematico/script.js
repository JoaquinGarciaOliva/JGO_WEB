// --- VARIABLES GLOBALES ---
let definicionesData = [];
let numerosSalidos = [];
let numerosRestantes = Array.from({length: 100}, (_, i) => i + 1);
let timer = null;
let juegoPausado = true;

let indexDepuracion = 0; // Para saber por qué número vamos
let subIndexDepuracion = 0; // Para saber qué definición de ese número estamos viendo
let modoDebugActivo = true; // Cambia a false si quieres volver al juego normal


const display = document.getElementById('pantalla-definicion');
const historialLista = document.getElementById('historial-lista');

// --- PROCESAMIENTO DEL XML (Desde la variable en datos.js) ---
function cargarDatos() {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "text/xml");
    const numeros = xmlDoc.getElementsByTagName("numero");
    
    for (let num of numeros) {
        const valor = parseInt(num.getAttribute("valor"));
        const nombre = num.getElementsByTagName("nombre")[0].textContent;
        const defs = Array.from(num.getElementsByTagName("definicion")).map(d => d.textContent);
        
        definicionesData[valor] = {
            nombre: nombre,
            definiciones: defs
        };
    }
    console.log("Datos cargados correctamente.");
}

// --- LÓGICA DEL JUEGO ---
function siguienteTurno() {
    if (numerosRestantes.length === 0) {
        display.textContent = "¡Juego terminado! Han salido todos los números.";
        clearInterval(timer);
        return;
    }

    // Seleccionar número aleatorio que no haya salido
    const indexAleatorio = Math.floor(Math.random() * numerosRestantes.length);
    const numeroElegido = numerosRestantes.splice(indexAleatorio, 1)[0];
    
    numerosSalidos.push(numeroElegido);

    const infoNum = definicionesData[numeroElegido];
    let textoDefinicion = "";

    if (infoNum && infoNum.definiciones.length > 0) {
        // Seleccionar una definición aleatoria de las disponibles para ese número
        const indexDef = Math.floor(Math.random() * infoNum.definiciones.length);
        textoDefinicion = infoNum.definiciones[indexDef];
    } else {
        textoDefinicion = `Definición no encontrada para el número ${numeroElegido}`;
    }

    // 1. Actualizar Pantalla Principal
      // display.textContent = textoDefinicion;
      display.innerHTML = '<li>' + textoDefinicion + '</li>';

    // 2. Actualizar Historial (Solo la definición, sin el número)
    const li = document.createElement('li');
    li.style.padding = "8px 0";
    li.style.borderBottom = "1px solid   #F7E940";
    li.textContent = textoDefinicion; // <-- Aquí ya no incluimos el número
    historialLista.prepend(li);

    // 3. Renderizar fórmulas con MathJax en ambos sitios
    if (window.MathJax) {
        MathJax.typesetPromise([display, li]).catch((err) => console.log(err.message));
    }
}


function mostrarSiguienteDepuracion() {
    // Obtenemos los índices de los números disponibles
    const keys = Object.keys(definicionesData);
    
    if (indexDepuracion >= keys.length) {
        display.textContent = "✅ Fin de la revisión de todas las definiciones.";
        clearInterval(timer);
        return;
    }

    const valorActual = keys[indexDepuracion];
    const infoNum = definicionesData[valorActual];
    const defs = infoNum.definiciones;

    // Mostramos la definición actual
    const textoDefinicion = `[Num ${valorActual}] : ${defs[subIndexDepuracion]}`;
    display.innerHTML = '<li>' + textoDefinicion + '</li>';

    // Añadimos al historial para ver el progreso
    const li = document.createElement('li');
    li.style.padding = "4px 0";
    li.style.borderBottom = "1px solid #ccc";
    li.textContent = textoDefinicion;
    historialLista.prepend(li);

    // Renderizar con MathJax
    if (window.MathJax) {
        MathJax.typesetPromise([display, li]).catch((err) => console.log(err.message));
    }

    // Lógica para avanzar al siguiente
    subIndexDepuracion++;
    if (subIndexDepuracion >= defs.length) {
        subIndexDepuracion = 0;
        indexDepuracion++;
    }
}


// --- EVENTOS DE BOTONES ---

// Play / Continuar
  document.getElementById('btn-play').addEventListener('click', () => {
  if (juegoPausado) {

        juegoPausado = false;
        document.getElementById('btn-play').disabled = true;
        document.getElementById('btn-pause').disabled = false;

        const segundos = parseInt(document.getElementById('intervalo').value) * 1000;
        siguienteTurno(); 
        timer = setInterval(siguienteTurno, segundos);
     }
  });

// Play / Continuar  Modo Depuración.... Anular este código o el de play según desee depurar o no. 

// --- document.getElementById('btn-play').addEventListener('click', () => {
   // ---  if (juegoPausado) {
   // ---     juegoPausado = false;
   // ---     document.getElementById('btn-play').disabled = true;
   // ---     document.getElementById('btn-pause').disabled = false;

    // ---    const segundos = parseInt(document.getElementById('intervalo').value) * 1000;
        
        // Ejecutamos la primera vez y configuramos el intervalo
  // ---      mostrarSiguienteDepuracion(); 
  // ---      timer = setInterval(mostrarSiguienteDepuracion, segundos);
 // ---  }
// --- });


// Pausa

document.getElementById('btn-pause').addEventListener('click', () => {
    juegoPausado = true;
        document.getElementById('btn-play').disabled = false;
        document.getElementById('btn-pause').disabled = true;

    clearInterval(timer);
});

// Comprobar Resultados
document.getElementById('btn-check').addEventListener('click', () => {
    const input = document.getElementById('input-comprobar').value;
    const feedback = document.getElementById('resultado-feedback');
    
    const numerosInput = input.split(',')
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n));

    if (numerosInput.length === 0) {
        feedback.textContent = "Introduce números válidos separados por comas.";
        return;
    }

    const faltantes = numerosInput.filter(n => !numerosSalidos.includes(n));

    if (faltantes.length === 0) {
        feedback.style.color = "#28a745";
        feedback.textContent = "✅ ¡Correcto! Todos esos números han aparecido ya.";
    } else {
        feedback.style.color = "#dc3545";
        feedback.textContent = `❌ Algunos números no han salido todavía: ${faltantes.join(', ')}`;
    }
});

document.getElementById('btn-reset').addEventListener('click', () => {
    reiniciarJuego();
});

function reiniciarJuego() {
    // Detener el temporizador
    clearInterval(timer);
    timer = null;

    // Reiniciar variables
    numerosSalidos = [];
    numerosRestantes = Array.from({ length: 100 }, (_, i) => i + 1);
    juegoPausado = true;

    // Limpiar pantalla y mensajes
    display.textContent = "";
    historialLista.innerHTML = "";
    document.getElementById('resultado-feedback').textContent = "";
    document.getElementById('input-comprobar').value = "";

    // Restaurar botones
    document.getElementById('btn-play').disabled = false;
    document.getElementById('btn-pause').disabled = true;

    console.log("Juego reiniciado");
}




// Inicializar
cargarDatos();

// Verificación de que el JavaScript está funcionando correctamente
console.log("¡JS funcionando!");

// URL base de la API para todas las peticiones CRUD (Create, Read, Update, Delete)
const API_URL = "http://localhost:4567/juegos";

/**
 * FUNCIÓN PRINCIPAL: Obtener y mostrar juegos desde la API
 * Realiza una petición GET a la API y renderiza los juegos en el grid
 */
async function mostrarJuegos() {
  // MOSTRAR LOADING AL INICIAR
  mostrarLoading();
  try {
    // Realizar petición HTTP GET a la API para obtener todos los juegos
    const response = await fetch("http://localhost:4567/juegos");

    // Array para almacenar los juegos obtenidos de la API
    let juegosAPI = [];

    // Verificar si la respuesta HTTP fue exitosa (status 200-299)
    if (response.ok) {
      // Leer el cuerpo de la respuesta como texto para manejar posibles errores de formato
      const text = await response.text();
      try {
        // Intentar parsear el texto de respuesta como objeto JSON
        juegosAPI = JSON.parse(text);
      } catch {
        // Si falla el parseo JSON, mostrar advertencia en consola
        console.warn("La API no devolvió JSON válido");
        juegosAPI = [];
      }
    } else {
      // Si la respuesta no es exitosa, leer el mensaje de error del servidor
      const errorText = await response.text();
      console.warn("Error al cargar juegos:", errorText);
      juegosAPI = [];
    }

    // Llamar a la función que renderiza los juegos en el grid HTML
    renderJuegos(juegosAPI);

    // Mostrar en consola para debugging y verificación
    console.log("Juegos cargados:", juegosAPI);
  } catch (error) {
    // Capturar y mostrar errores de red o conexión
    console.error("Error al cargar los juegos:", error);
  } finally {
    // OCULTAR LOADING SIEMPRE, TANTO EN ÉXITO COMO EN ERROR
    ocultarLoading();
  }
}
// Funciones para controlar el loading
function mostrarLoading() {
  const loading = document.getElementById("loading");
  if (loading) loading.style.display = "flex";
}

function ocultarLoading() {
  const loading = document.getElementById("loading");
  if (loading) loading.style.display = "none";
}

/**
 * Renderiza las tarjetas de juegos en el grid HTML
 * Crea elementos DOM dinámicamente para cada juego
 * @param {Array} juegos - Array de objetos juego a renderizar
 */
function renderJuegos(juegos) {
  // Obtener referencia al contenedor grid del DOM
  const grid = document.getElementById("juegosGrid");

  // Limpiar el contenido previo del grid para evitar duplicados
  grid.innerHTML = "";

  // Iterar sobre cada juego del array para crear su tarjeta correspondiente
  juegos.forEach((juego) => {
    // Crear elemento div que contendrá la tarjeta del juego
    const card = document.createElement("div");

    // Agregar clase CSS para aplicar los estilos definidos
    card.classList.add("juego");

    // Agregar atributo data para identificar el juego (útil para CSS/JS posterior)
    card.setAttribute("data-juego-id", juego.id);

    // Crear el HTML interno de la tarjeta con template string
    card.innerHTML = `
      <a href="detalle.html?id=${
        juego.id || juego.nombre
      }" class="juego-card" rel="noopener noreferrer"> 
        <h3>${juego.nombre}</h3>
        <img width=300 height=300 src="${juego.urlImagen}" alt="${
      juego.nombre
    }" />  
      </a> 
    `;

    // Agregar la tarjeta creada al contenedor grid
    grid.appendChild(card);
  });
}

/**
 * Agrega un nuevo juego a través de la API
 * Valida los datos del formulario y realiza petición POST
 * Maneja respuestas de éxito y error
 */
async function agregarJuego() {
  // Obtener valores de todos los campos del formulario
  const nombre = document.getElementById("nuevoJuego").value;
  const descripcion = document.getElementById("nuevoJuegoDescripcion").value;
  const urlImagen = document.getElementById("nuevoJuegoImagen").value;
  const genero = document.getElementById("nuevoJuegoGenero").value;
  const perspectiva = document.getElementById("nuevoJuegoPerspectiva").value;

  // Obtener referencia al elemento donde se mostrarán mensajes al usuario
  const mensajeError = document.getElementById("mensajeError");

  /**
   * Función auxiliar: Mostrar mensaje al usuario
   * @param {string} texto - Texto del mensaje a mostrar
   */
  function mostrarMensaje(texto) {
    // Establecer el texto del mensaje
    mensajeError.textContent = texto;
    // Hacer visible el contenedor del mensaje
    mensajeError.style.display = "block";
  }

  /**
   * Función auxiliar: Ocultar mensaje del usuario
   * Restablece el estado inicial del contenedor de mensajes
   */
  function ocultarMensaje() {
    // Ocultar el contenedor del mensaje
    mensajeError.style.display = "none";
    // Limpiar el texto del mensaje
    mensajeError.textContent = "";
  }

  // Ocultar cualquier mensaje previo antes de comenzar las validaciones
  ocultarMensaje();

  // ========== VALIDACIONES DE CAMPOS DEL FORMULARIO ==========

  // Validar que todos los campos obligatorios estén completos
  if (
    !nombre.trim() ||
    !descripcion.trim() ||
    !urlImagen.trim() ||
    !genero.trim() ||
    !perspectiva.trim()
  ) {
    mostrarMensaje(
      "⚠️ Todos los campos son obligatorios. Completá todos los datos."
    );
    // Configurar timeout para ocultar automáticamente el mensaje después de 5 segundos
    setTimeout(ocultarMensaje, 5000);
    return; // Detener ejecución si la validación falla
  }

  // Expresión regular para validar formato de URL HTTP/HTTPS
  // ^(https?:\/\/) - debe comenzar con http:// o https://
  // [\w\-]+ - nombre de dominio con letras, números, guiones
  // (\.[\w\-]+)+ - extensión de dominio (.com, .org, etc.)
  // [/#?]?.*$ - puede contener parámetros, queries o fragments
  const urlPattern = /^(https?:\/\/)[\w\-]+(\.[\w\-]+)+[/#?]?.*$/;

  // Validar que la URL de imagen tenga formato correcto
  if (!urlPattern.test(urlImagen)) {
    mostrarMensaje(
      "❌ La URL de la imagen no es válida. Debe comenzar con http o https."
    );
    // Ocultar mensaje automáticamente después de 5 segundos
    setTimeout(ocultarMensaje, 5000);
    return;
  }

  // Validar longitud máxima de la descripción (300 caracteres)
  if (descripcion.length > 300) {
    mostrarMensaje("⚠️ La descripción no puede superar los 300 caracteres.");
    setTimeout(ocultarMensaje, 5000);
    return;
  }

  // Validar longitud mínima del nombre (3 caracteres)
  if (nombre.trim().length < 3) {
    mostrarMensaje("⚠️ El nombre del juego debe tener al menos 3 caracteres.");
    setTimeout(ocultarMensaje, 5000);
    return;
  }

  // ========== MOSTRAR LOADING ANTES DE ENVIAR A LA API ==========
  mostrarLoading();

  // ========== PREPARACIÓN Y ENVÍO DE DATOS A LA API ==========

  // Crear objeto con la estructura esperada por la API
  const nuevoJuego = {
    nombre,
    descripcion,
    urlImagen,
    genero,
    perspectiva,
  };

  try {
    // Realizar petición HTTP POST a la API para crear el nuevo juego
    const response = await fetch(API_URL, {
      method: "POST", // Método HTTP para crear recurso
      headers: {
        "Content-Type": "application/json", // Especificar que enviamos JSON
      },
      body: JSON.stringify(nuevoJuego), // Convertir objeto JavaScript a string JSON
    });

    // Verificar si la respuesta de la API indica error
    if (!response.ok) {
      // Leer el cuerpo de la respuesta de error
      const errorText = await response.text();
      try {
        // Intentar parsear el error como JSON (formato estructurado)
        const errorData = JSON.parse(errorText);
        mostrarMensaje(
          `❌ Error al agregar el juego: ${
            errorData.error || errorData.message || "Error desconocido."
          }`
        );
      } catch {
        // Si no es JSON válido, mostrar el texto plano del error
        mostrarMensaje(`❌ Error: ${errorText}`);
      }
      // Ocultar mensaje de error después de 5 segundos
      setTimeout(ocultarMensaje, 5000);
      return; // Detener ejecución por error
    }

    // ========== PROCESAMIENTO DE RESPUESTA EXITOSA ==========

    // Limpiar todos los campos del formulario después de éxito
    document.getElementById("nuevoJuego").value = "";
    document.getElementById("nuevoJuegoDescripcion").value = "";
    document.getElementById("nuevoJuegoImagen").value = "";
    document.getElementById("nuevoJuegoGenero").value = "";
    document.getElementById("nuevoJuegoPerspectiva").value = "";

    // Recargar la lista de juegos para incluir el nuevo juego
    mostrarJuegos();

    // Mostrar mensaje de éxito con estilo diferenciado
    mensajeError.style.backgroundColor = "#5cb85c"; // Color verde para éxito
    mensajeError.textContent = "✅ Juego agregado correctamente.";
    mensajeError.style.display = "block";

    // Configurar timeout para ocultar mensaje de éxito después de 5 segundos
    setTimeout(ocultarMensaje, 5000);
  } catch (error) {
    // Capturar errores de red, conexión o problemas del cliente
    console.error("Error al agregar el juego:", error);
    mostrarMensaje("❌ No se pudo conectar con el servidor.");
    // Ocultar mensaje de error de conexión después de 5 segundos
    setTimeout(ocultarMensaje, 5000);
  } finally {
    ocultarLoading();
  }
}

/**
 * Filtra los juegos en tiempo real según el texto de búsqueda
 * Muestra/oculta tarjetas basado en coincidencia con el nombre
 * Se ejecuta con cada tecla presionada en el buscador
 */
function filtrarJuegos() {
  // Obtener valor del campo de búsqueda y convertir a minúsculas para búsqueda case-insensitive
  const busqueda = document.getElementById("buscadorInput").value.toLowerCase();

  // Obtener referencia al grid y todas las tarjetas de juego existentes
  const grid = document.getElementById("juegosGrid");
  const tarjetas = grid.querySelectorAll(".juego");

  // Iterar sobre cada tarjeta para evaluar si coincide con la búsqueda
  tarjetas.forEach((card) => {
    // Obtener texto del título del juego y convertir a minúsculas
    const nombre = card.querySelector("h3").textContent.toLowerCase();

    // Mostrar u ocultar tarjeta según si el nombre incluye el texto de búsqueda
    if (nombre.includes(busqueda)) {
      card.style.display = "block"; // Mostrar tarjeta si hay coincidencia
    } else {
      card.style.display = "none"; // Ocultar tarjeta si no hay coincidencia
    }
  });
}

// ========== CONFIGURACIÓN DE EVENT LISTENERS ==========

// Configurar evento click en el botón "Agregar Nuevo Juego"
const botonAgregar = document.getElementById("agregarJuegoBtn");
if (botonAgregar) {
  // Cuando se hace click, ejecutar la función agregarJuego
  botonAgregar.addEventListener("click", agregarJuego);
}

// Configurar evento input en el campo de búsqueda
const buscador = document.getElementById("buscadorInput");
if (buscador) {
  // Cuando se escribe en el buscador, ejecutar filtrado en tiempo real
  buscador.addEventListener("input", filtrarJuegos);
}

// Cargar y mostrar los juegos al iniciar la página
mostrarJuegos();

const params = new URLSearchParams(window.location.search);
const idJuego = params.get("id");
let juegoActual = null;

async function cargarJuego() {
  // MOSTRAR LOADING
  mostrarLoadingDetalle();
  let juego = null;
  try {
    const response = await fetch(`http://localhost:4567/juegos/${idJuego}`);
    if (response.ok) {
      juego = await response.json();
      juegoActual = juego;

      document.getElementById("nombreJuego").textContent = juego.nombre;
      document.getElementById("imagenJuego").src = juego.urlImagen;
      document.getElementById("imagenJuego").alt = juego.nombre;
      document.getElementById("descripcionJuego").textContent =
        juego.descripcion;
      document.getElementById("generoJuego").textContent = juego.genero;
      document.getElementById("perspectivaJuego").textContent =
        juego.perspectiva;

      document.getElementById("editarNombre").value = juego.nombre;
      document.getElementById("editarDescripcion").value = juego.descripcion;
      document.getElementById("editarGenero").value = juego.genero;
      document.getElementById("editarPerspectiva").value = juego.perspectiva;
      document.getElementById("editarUrlImagen").value = juego.urlImagen;
    } else {
      const errorText = await response.text();
      console.error("Juego no encontrado en la API:", errorText);
      mostrarMensajeDetalle(`Error: ${errorText}`, "error");
    }
  } catch (error) {
    console.error("Error cargando el juego:", error);
    mostrarMensajeDetalle("Error cargando el juego", "error");
  } finally {
    // OCULTAR LOADING
    ocultarLoadingDetalle();
  }
}

// Funciones para controlar el loading en detalle
function mostrarLoadingDetalle() {
  const loading = document.getElementById("loadingDetalle");
  if (loading) loading.style.display = "flex";
}

function ocultarLoadingDetalle() {
  const loading = document.getElementById("loadingDetalle");
  if (loading) loading.style.display = "none";
}

function mostrarMensajeDetalle(mensaje, tipo = "success") {
  const mensajeDiv = document.getElementById("mensajeDetalle");
  mensajeDiv.textContent = mensaje;
  mensajeDiv.style.backgroundColor = tipo === "success" ? "#5cb85c" : "#d9534f";
  mensajeDiv.style.display = "block";

  setTimeout(() => {
    mensajeDiv.style.display = "none";
  }, 5000);
}

function mostrarMensajeFormulario(mensaje, tipo = "success") {
  let mensajeForm = document.getElementById("mensajeFormulario");
  if (!mensajeForm) {
    mensajeForm = document.createElement("div");
    mensajeForm.id = "mensajeFormulario";
    mensajeForm.className = "mensaje-formulario";
    document.getElementById("formularioEdicion").appendChild(mensajeForm);
  }

  mensajeForm.textContent = mensaje;
  mensajeForm.style.backgroundColor =
    tipo === "success" ? "#5cb85c" : "#d9534f";
  mensajeForm.style.color = "#ffffff";
  mensajeForm.style.display = "block";

  setTimeout(() => {
    mensajeForm.style.display = "none";
  }, 5000);
}

async function eliminarJuego() {
  if (!confirm("¿Estás seguro de que querés eliminar este juego?")) {
    return;
  }

  mostrarLoadingDetalle(); // MOSTRAR LOADING

  try {
    const response = await fetch(`http://localhost:4567/juegos/${idJuego}`, {
      method: "DELETE",
    });

    // ✅ SOLUCIÓN: Leer la respuesta UNA SOLA VEZ
    const responseText = await response.text();

    if (response.ok) {
      // Intentar parsear como JSON, si falla usar el texto directo
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { message: responseText };
      }

      mostrarMensajeDetalle("✅ " + "Juego eliminado con éxito", "success"); // Solucionado

      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } else {
      // Para errores también usar el texto ya leído
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error: responseText };
      }
      mostrarMensajeDetalle(
        "❌ " +
          (errorData.error ||
            errorData.message ||
            "Error al eliminar el juego"),
        "error"
      );
    }
  } catch (error) {
    console.error("Error eliminando el juego:", error);
    mostrarMensajeDetalle("❌ No se pudo conectar con el servidor", "error");
  } finally {
    ocultarLoadingDetalle(); // OCULTAR LOADING
  }
}

function mostrarFormularioEdicion() {
  document.getElementById("formularioEdicion").style.display = "block";
  document.getElementById("fondoOscuro").style.display = "block";
  document.body.style.overflow = "hidden";
}

function ocultarFormularioEdicion() {
  document.getElementById("formularioEdicion").style.display = "none";
  document.getElementById("fondoOscuro").style.display = "none";
  document.body.style.overflow = "auto";

  const mensajeForm = document.getElementById("mensajeFormulario");
  if (mensajeForm) {
    mensajeForm.style.display = "none";
  }

  if (juegoActual) {
    document.getElementById("editarNombre").value = juegoActual.nombre;
    document.getElementById("editarDescripcion").value =
      juegoActual.descripcion;
    document.getElementById("editarGenero").value = juegoActual.genero;
    document.getElementById("editarPerspectiva").value =
      juegoActual.perspectiva;
    document.getElementById("editarUrlImagen").value = juegoActual.urlImagen;
  }
}

async function guardarEdicion() {
  const juegoEditado = {
    nombre: document.getElementById("editarNombre").value.trim(),
    descripcion: document.getElementById("editarDescripcion").value.trim(),
    genero: document.getElementById("editarGenero").value.trim(),
    perspectiva: document.getElementById("editarPerspectiva").value.trim(),
    urlImagen: document.getElementById("editarUrlImagen").value.trim(),
  };

  if (!juegoEditado.nombre) {
    mostrarMensajeFormulario("❌ El nombre del juego es obligatorio", "error");
    return;
  }

  if (!juegoEditado.descripcion) {
    mostrarMensajeFormulario(
      "❌ La descripción del juego es obligatoria",
      "error"
    );
    return;
  }

  if (!juegoEditado.genero) {
    mostrarMensajeFormulario("❌ El género del juego es obligatorio", "error");
    return;
  }

  if (!juegoEditado.perspectiva) {
    mostrarMensajeFormulario(
      "❌ La perspectiva del juego es obligatoria",
      "error"
    );
    return;
  }

  if (!juegoEditado.urlImagen || !juegoEditado.urlImagen.startsWith("http")) {
    mostrarMensajeFormulario(
      "❌ La URL de la imagen debe comenzar con http o https",
      "error"
    );
    return;
  }

  if (juegoEditado.descripcion.length > 300) {
    mostrarMensajeFormulario(
      "❌ La descripción no puede superar los 300 caracteres",
      "error"
    );
    return;
  }

  mostrarLoadingDetalle(); // MOSTRAR LOADING

  try {
    const response = await fetch(`http://localhost:4567/juegos/${idJuego}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(juegoEditado),
    });

    if (response.ok) {
      const result = await response.json();
      mostrarMensajeFormulario("✅ Cambios guardados correctamente", "success");

      setTimeout(() => {
        ocultarFormularioEdicion();
        cargarJuego();
      }, 2000);
    } else {
      const errorText = await response.text();
      mostrarMensajeFormulario("❌ " + errorText, "error");
    }
  } catch (error) {
    console.error("Error editando el juego:", error);
    mostrarMensajeFormulario("❌ No se pudo conectar con el servidor", "error");
  } finally {
    ocultarLoadingDetalle(); // OCULTAR LOADING
  }
}

// Cerrar formulario al hacer click en el fondo oscuro
document
  .getElementById("fondoOscuro")
  .addEventListener("click", ocultarFormularioEdicion);

document.addEventListener("DOMContentLoaded", function () {
  const eliminarBtn = document.getElementById("eliminarJuegoBtn");
  if (eliminarBtn) {
    eliminarBtn.addEventListener("click", eliminarJuego);
  }

  const editarBtn = document.getElementById("editarJuegoBtn");
  if (editarBtn) {
    editarBtn.addEventListener("click", mostrarFormularioEdicion);
  }

  const guardarEdicionBtn = document.getElementById("guardarEdicionBtn");
  if (guardarEdicionBtn) {
    guardarEdicionBtn.addEventListener("click", guardarEdicion);
  }

  const cancelarEdicionBtn = document.getElementById("cancelarEdicionBtn");
  if (cancelarEdicionBtn) {
    cancelarEdicionBtn.addEventListener("click", ocultarFormularioEdicion);
  }
});

cargarJuego();

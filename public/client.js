/* eslint-disable no-console */
/* global TrelloPowerUp */

const t = TrelloPowerUp.iframe();

// Objeto para almacenar las propiedades del Power-Up
const POWERUP_PROPS = {
  appName: 'Importador de Tableros Trello',
  icon: './icon.png'
};

// Función para obtener la URL de un tablero.
// Útil si necesitas construir la URL dinámicamente.
const getBoardUrl = (boardId) => {
  return `https://trello.com/b/${boardId}`;
};

// Función para inicializar y registrar el Power-Up
const initializePowerUp = () => {
  window.TrelloPowerUp.initialize({
    'card-buttons': (trello, options) => {
      // Este hook define los botones que aparecen en la tarjeta
      return [{
        icon: POWERUP_PROPS.icon,
        text: POWERUP_PROPS.appName,
        callback: (trello) => {
          // El 'callback' define la acción al hacer clic en el botón.
          // En este caso, abre un modal.
          return trello.modal({
            title: POWERUP_PROPS.appName,
            // La URL del contenido que se mostrará en el modal.
            // Usar una ruta relativa es una mejor práctica.
            url: './index.html',
            fullscreen: true
          });
        }
      }];
    },
    'on-authorize': (t, options) => {
      // Este hook se ejecuta cuando el usuario autoriza el Power-Up.
      // Puedes manejar la autorización aquí si es necesario.
      console.log('Power-Up autorizado.');
    },
    'on-deauthorize': (t, options) => {
      // Este hook se ejecuta cuando el usuario desautoriza el Power-Up.
      // Puedes manejar la desautorización aquí.
      console.log('Power-Up desautorizado.');
    }
  });
};

// Función para mostrar mensajes de estado al usuario en el modal.
const showStatusMessage = (message, isError = false) => {
  const statusElement = document.getElementById('status-message');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = isError ? 'error' : 'success';
    statusElement.style.display = 'block';
  }
};

// Función principal para manejar el envío del formulario.
const handleFormSubmit = async (event) => {
  event.preventDefault();

  const form = document.getElementById('import-form');
  const fileInput = document.getElementById('json-file');

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    showStatusMessage('Por favor, selecciona un archivo JSON', true);
    return;
  }

  showStatusMessage('Subiendo y restaurando tablero...', false);
  
  // Crea un objeto FormData para enviar el archivo
  const formData = new FormData();
  formData.append('jsonFile', fileInput.files[0]);

  try {
    // Realiza la petición POST a tu función de Netlify
    const response = await fetch('/import-json', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      // Si el servidor responde con un error (ej. 400, 500)
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en el servidor');
    }

    // Si la respuesta es exitosa, procesa el JSON
    const result = await response.json();
    console.log('Importación exitosa:', result);
    
    // Muestra el resultado de la importación
    const boardUrl = result.details.boardUrl;
    showStatusMessage(`¡Tablero importado con éxito! Puedes verlo aquí: ${boardUrl}`, false);
    
    // Opcional: cierra el modal después de 5 segundos
    setTimeout(() => {
      t.closeModal();
    }, 5000);

  } catch (error) {
    console.error('Error en la importación:', error);
    showStatusMessage(`Error: ${error.message}`, true);
  } finally {
    // Restablece el formulario después de la operación
    if (form) {
      form.reset();
    }
  }
};

// Se ejecuta una vez que el DOM está completamente cargado.
// Asocia el 'submit' del formulario con nuestra función de manejo.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('import-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
  // Inicializa el Power-Up de Trello.
  initializePowerUp();
});
/* eslint-disable no-console */
/* global TrelloPowerUp */

const t = TrelloPowerUp.iframe();

// Objeto para almacenar las propiedades del Power-Up
const POWERUP_PROPS = {
  appName: 'Importador de Tableros Trello',
  icon: './icon.png'
};

// Función para obtener la URL de un tablero
const getBoardUrl = (boardId) => {
  return `https://trello.com/b/${boardId}`;
};

// Función para inicializar y registrar el Power-Up
const initializePowerUp = () => {
  window.TrelloPowerUp.initialize({
    'card-buttons': (trello, options) => {
      return [{
        icon: POWERUP_PROPS.icon,
        text: POWERUP_PROPS.appName,
        callback: (trello) => {
          return trello.modal({
            title: POWERUP_PROPS.appName,
            url: 'https://jocular-macaron-289a07.netlify.app/index.html', 
            fullscreen: true
          });
        }
      }];
    },
    'on-authorize': (t, options) => {
      // Puedes manejar la autorización aquí si es necesario
    },
    'on-deauthorize': (t, options) => {
      // Puedes manejar la desautorización aquí
    }
  });
};

// Función para mostrar mensajes de estado
const showStatusMessage = (message, isError = false) => {
  const statusElement = document.getElementById('status-message');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = isError ? 'error' : 'success';
    statusElement.style.display = 'block';
  }
};

// Función principal para manejar el envío del formulario
const handleFormSubmit = async (event) => {
  event.preventDefault();

  const form = document.getElementById('import-form');
  const fileInput = document.getElementById('json-file');

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    showStatusMessage('Por favor, selecciona un archivo JSON', true);
    return;
  }

  showStatusMessage('Subiendo y restaurando tablero...', false);
  
  const formData = new FormData();
  formData.append('jsonFile', fileInput.files[0]);

  try {
    const response = await fetch('/import-json', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      // Si el servidor responde con un error (ej. 400, 500)
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en el servidor');
    }

    const result = await response.json();
    console.log('Importación exitosa:', result);
    
    // Muestra el resultado de la importación
    const boardUrl = result.details.boardUrl;
    showStatusMessage(`¡Tablero importado con éxito! Puedes verlo aquí: ${boardUrl}`, false);
    
    // Opcional: Cerrar el modal del Power-Up después de un tiempo
    setTimeout(() => {
      t.closeModal();
    }, 5000);

  } catch (error) {
    console.error('Error en la importación:', error);
    showStatusMessage(`Error: ${error.message}`, true);
  } finally {
    // Restablece el formulario
    form.reset();
  }
};

// Se ejecuta una vez que el DOM está cargado
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('import-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
  initializePowerUp();
});
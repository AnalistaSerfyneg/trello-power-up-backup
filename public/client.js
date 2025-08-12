/* eslint-disable no-console */
/* global TrelloPowerUp */

const t = TrelloPowerUp.iframe();

const POWERUP_PROPS = {
  appName: 'Importador de Tableros Trello',
  icon: './icon.png'
};

const getBoardUrl = (boardId) => {
  return `https://trello.com/b/${boardId}`;
};

const initializePowerUp = () => {
  if (typeof TrelloPowerUp !== 'undefined') {
    TrelloPowerUp.initialize({
      'board-buttons': function(t, opts) {
        return [{
          icon: 'https://cdn.glitch.com/1b42d7fe-bda8-4af8-a6c8-eff0cea9e08a%2Ftrello-logo-blue.svg',
          text: 'Importar JSON',
          callback: function(t) {
            return t.popup({
              title: 'Importador de JSON',
              url: './index.html',
              height: 500
            });
          }
        }];
      },
      'on-authorize': (t, options) => {
        console.log('Power-Up autorizado.');
      },
      'on-deauthorize': (t, options) => {
        console.log('Power-Up desautorizado.');
      }
    });
  }
};

const showStatusMessage = (message, type) => {
  const statusArea = document.getElementById('statusArea');
  if (statusArea) {
    statusArea.innerHTML = '';
    const messageDiv = document.createElement('div');
    messageDiv.className = `status-message status-${type} show`;
    messageDiv.innerHTML = message;
    statusArea.appendChild(messageDiv);

    if (type !== 'info') {
      setTimeout(() => {
        messageDiv.classList.remove('show');
        setTimeout(() => {
          if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
          }
        }, 300);
      }, 5000);
    }
  }
};

const resetFileSelection = () => {
  const fileInput = document.getElementById('jsonFile');
  const selectedFileDiv = document.getElementById('selectedFile');
  const importBtn = document.getElementById('importBtn');
  
  if (fileInput) fileInput.value = '';
  if (selectedFileDiv) selectedFileDiv.classList.remove('show');
  if (importBtn) importBtn.disabled = true;
};

const handleFormSubmit = async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('jsonFile');
  if (!fileInput.files || fileInput.files.length === 0) {
    showStatusMessage('Por favor, selecciona un archivo JSON para importar.', 'error');
    return;
  }

  showStatusMessage('<span class="loading-spinner"></span>Subiendo archivo y creando tablero...', 'info');
  const importBtn = document.getElementById('importBtn');
  if (importBtn) {
    importBtn.disabled = true;
    importBtn.textContent = 'Importando...';
  }

  try {
    const formData = new FormData();
    formData.append('jsonFile', fileInput.files[0]);

    const response = await fetch('/import-json', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      const successMessage = `
        <strong>✅ ¡Importación exitosa!</strong><br><br>
        📋 <strong>Tablero:</strong> ${result.details.boardName}<br>
        📝 <strong>Listas creadas:</strong> ${result.details.listsCreated}<br>
        🃏 <strong>Tarjetas creadas:</strong> ${result.details.cardsCreated}<br><br>
        <a href="${result.details.boardUrl}" target="_blank" style="color: #0079bf; text-decoration: none;">
          🔗 <strong>Ver tablero en Trello →</strong>
        </a>
      `;
      showStatusMessage(successMessage, 'success');
      
      setTimeout(() => {
        t.closeModal();
      }, 5000);
    } else {
      showStatusMessage(`❌ Error: ${result.message}`, 'error');
    }

  } catch (error) {
    console.error('Error en la importación:', error);
    showStatusMessage('❌ Error de conexión. Por favor, intenta nuevamente.', 'error');
  } finally {
    if (importBtn) {
      importBtn.disabled = false;
      importBtn.textContent = 'Importar Tablero a Trello';
    }
    resetFileSelection();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const importForm = document.getElementById('importForm');
  if (importForm) {
    importForm.addEventListener('submit', handleFormSubmit);
  }
  initializePowerUp();
});
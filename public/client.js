// Inicialización del Power-Up de Trello
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
        }
    });
}

// Variables globales
let selectedFile = null;

// Referencias a elementos del DOM
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('jsonFile');
const selectedFileDiv = document.getElementById('selectedFile');
const fileNameSpan = document.getElementById('fileName');
const importForm = document.getElementById('importForm');
const importBtn = document.getElementById('importBtn');
const statusArea = document.getElementById('statusArea');

// Configurar event listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    // Event listeners para el área de carga
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Input file change
    fileInput.addEventListener('change', handleFileSelect);

    // Form submission
    importForm.addEventListener('submit', handleFormSubmit);
}

// Manejo de drag and drop
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (isValidJSONFile(file)) {
            fileInput.files = files;
            handleFileSelect({ target: { files: [file] } });
        } else {
            showStatusMessage('Por favor, selecciona un archivo JSON válido.', 'error');
        }
    }
}

// Manejo de selección de archivo
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        if (isValidJSONFile(file)) {
            selectedFile = file;
            fileNameSpan.textContent = `📄 ${file.name} (${formatFileSize(file.size)})`;
            selectedFileDiv.classList.add('show');
            importBtn.disabled = false;
            clearStatusMessages();
        } else {
            showStatusMessage('Por favor, selecciona un archivo JSON válido.', 'error');
            resetFileSelection();
        }
    }
}

// Validar que el archivo sea JSON
function isValidJSONFile(file) {
    return file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');
}

// Formatear tamaño de archivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Resetear selección de archivo
function resetFileSelection() {
    selectedFile = null;
    selectedFileDiv.classList.remove('show');
    importBtn.disabled = true;
    fileInput.value = '';
}

// Manejo del envío del formulario
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!selectedFile) {
        showStatusMessage('Por favor, selecciona un archivo JSON para importar.', 'error');
        return;
    }

    // Mostrar estado de carga
    showStatusMessage(
        '<span class="loading-spinner"></span>Subiendo archivo y creando tablero...', 
        'info'
    );
    importBtn.disabled = true;
    importBtn.textContent = 'Importando...';

    try {
        // Crear FormData y enviar archivo
        const formData = new FormData();
        formData.append('jsonFile', selectedFile);

        const response = await fetch('/import-json', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Éxito - mostrar detalles de la importación
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
            
            // Reset form after success
            setTimeout(() => {
                resetFileSelection();
                importBtn.textContent = 'Importar Tablero a Trello';
            }, 1000);
        } else {
            // Error del servidor
            showStatusMessage(`❌ Error: ${result.message}`, 'error');
        }

    } catch (error) {
        console.error('Error en la importación:', error);
        showStatusMessage(
            '❌ Error de conexión. Por favor, intenta nuevamente.', 
            'error'
        );
    } finally {
        // Restaurar botón
        importBtn.disabled = false;
        importBtn.textContent = 'Importar Tablero a Trello';
    }
}

// Mostrar mensaje de estado
function showStatusMessage(message, type) {
    clearStatusMessages();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `status-message status-${type} show`;
    messageDiv.innerHTML = message;
    
    statusArea.appendChild(messageDiv);
    
    // Auto-hide success messages after 10 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.classList.remove('show');
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 10000);
    }
}

// Limpiar mensajes de estado
function clearStatusMessages() {
    const messages = statusArea.querySelectorAll('.status-message');
    messages.forEach(message => {
        message.classList.remove('show');
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 300);
    });
}

// Funcionalidad adicional para Power-Up
if (typeof TrelloPowerUp !== 'undefined') {
    // Función para renderizar la interfaz en el contexto de Trello
    window.TrelloRender = function(t) {
        return t.render(function() {
            // La interfaz ya está cargada en el HTML
            // Aquí podríamos añadir lógica adicional específica para el Power-Up
            console.log('Power-Up renderizado correctamente');
        });
    };
}
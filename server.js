const express = require('express');
const multer = require('multer');
const Trello = require('trello-js');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de multer para manejar archivos subidos
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    // Solo acepta archivos JSON
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos JSON'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // Límite de 50MB
  }
});

// Middleware para servir archivos estáticos desde la carpeta public
app.use(express.static('public'));
app.use(express.json());

// Ruta principal - sirve la interfaz del Power-Up
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para importar el archivo JSON de Trello
app.post('/import-json', upload.single('jsonFile'), async (req, res) => {
  try {
    // Verificar que se subió un archivo
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se subió ningún archivo' 
      });
    }

    // Verificar que las credenciales de Trello están configuradas
    if (!process.env.API_KEY || !process.env.API_TOKEN) {
      return res.status(500).json({
        success: false,
        message: 'Credenciales de Trello no configuradas. Verifica API_KEY y API_TOKEN en .env'
      });
    }

    // Leer y parsear el archivo JSON
    const fs = require('fs');
    const jsonData = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));

    // Inicializar cliente de Trello
    const trello = new Trello(process.env.API_KEY, process.env.API_TOKEN);

    // Crear nuevo tablero
    const boardName = jsonData.name ? `${jsonData.name} - Restaurado desde JSON` : 'Tablero Restaurado desde JSON';
    const newBoard = await new Promise((resolve, reject) => {
      trello.post('/1/boards', {
        name: boardName,
        desc: jsonData.desc || 'Tablero restaurado desde archivo JSON',
        defaultLists: false
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    console.log(`Nuevo tablero creado: ${newBoard.name} (ID: ${newBoard.id})`);

    // Crear listas del tablero
    const listMapping = {};
    
    if (jsonData.lists && jsonData.lists.length > 0) {
      for (const list of jsonData.lists) {
        try {
          const newList = await new Promise((resolve, reject) => {
            trello.post(`/1/boards/${newBoard.id}/lists`, {
              name: list.name || 'Lista sin nombre',
              pos: list.pos || 'bottom'
            }, (err, data) => {
              if (err) reject(err);
              else resolve(data);
            });
          });
          
          // Mapear ID original con ID nuevo para referencia posterior
          listMapping[list.id] = newList.id;
          console.log(`Lista creada: ${newList.name} (ID: ${newList.id})`);
        } catch (error) {
          console.error(`Error creando lista ${list.name}:`, error);
        }
      }
    }

    // Crear tarjetas en las listas
    let cardsCreated = 0;
    
    if (jsonData.cards && jsonData.cards.length > 0) {
      for (const card of jsonData.cards) {
        try {
          // Verificar que la tarjeta pertenece a una lista que se creó
          if (!listMapping[card.idList]) {
            console.log(`Saltando tarjeta "${card.name}" - lista no encontrada`);
            continue;
          }

          const newCard = await new Promise((resolve, reject) => {
            trello.post('/1/cards', {
              name: card.name || 'Tarjeta sin nombre',
              desc: card.desc || '',
              idList: listMapping[card.idList],
              pos: card.pos || 'bottom',
              due: card.due || null
            }, (err, data) => {
              if (err) reject(err);
              else resolve(data);
            });
          });

          cardsCreated++;
          console.log(`Tarjeta creada: ${newCard.name} (ID: ${newCard.id})`);
        } catch (error) {
          console.error(`Error creando tarjeta ${card.name}:`, error);
        }
      }
    }

    // Limpiar archivo temporal
    fs.unlinkSync(req.file.path);

    // Respuesta exitosa
    res.json({
      success: true,
      message: `Tablero importado exitosamente`,
      details: {
        boardName: newBoard.name,
        boardUrl: newBoard.url,
        listsCreated: Object.keys(listMapping).length,
        cardsCreated: cardsCreated
      }
    });

  } catch (error) {
    console.error('Error en importación:', error);
    
    // Limpiar archivo temporal si existe
    if (req.file && req.file.path) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error limpiando archivo temporal:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error al procesar el archivo JSON',
      error: error.message
    });
  }
});

// Manejo de errores de multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 50MB permitidos.'
      });
    }
  }
  
  res.status(400).json({
    success: false,
    message: error.message
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`Accede a la aplicación en: http://localhost:${PORT}`);
});
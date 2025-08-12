const Trello = require('trello');
const Busboy = require('busboy');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }
  
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'No se recibió ningún archivo.' })
    };
  }

  // La clave es pasar el cuerpo como un stream a Busboy
  const busboy = Busboy({
    headers: {
      'content-type': event.headers['content-type'],
      ...event.headers
    }
  });

  return new Promise((resolve, reject) => {
    let fileContent = '';

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      file.on('data', data => {
        fileContent += data.toString();
      });
      file.on('end', () => {
        console.log(`Archivo recibido: ${filename}, Content-Type: ${mimetype}`);
      });
    });

    busboy.on('finish', async () => {
      try {
        if (!fileContent) {
          return resolve({
            statusCode: 400,
            body: JSON.stringify({ success: false, message: 'El archivo estaba vacío.' })
          });
        }
        
        const jsonData = JSON.parse(fileContent);

        // --- TU LÓGICA DE TRELLO AQUÍ ---
        const apiKey = process.env.API_KEY;
        const apiToken = process.env.API_TOKEN;

        if (!apiKey || !apiToken) {
          console.error("Faltan las credenciales de Trello.");
          return resolve({
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Credenciales de Trello no configuradas.' })
          });
        }
        
        const trello = new Trello(apiKey, apiToken);
        const boardName = jsonData.name ? `${jsonData.name} - Restaurado` : 'Tablero Restaurado';
        const newBoard = await new Promise((resolve, reject) => {
          trello.post('/1/boards', { name: boardName, defaultLists: false }, (err, data) => {
            if (err) reject(err);
            else resolve(data);
          });
        });
        
        console.log(`Nuevo tablero creado: ${newBoard.name} (ID: ${newBoard.id})`);
        
        const listMapping = {};
        if (jsonData.lists && jsonData.lists.length > 0) {
          for (const list of jsonData.lists) {
            const newList = await new Promise((resolve, reject) => {
              trello.post(`/1/boards/${newBoard.id}/lists`, { name: list.name, pos: list.pos || 'bottom' }, (err, data) => {
                if (err) reject(err);
                else resolve(data);
              });
            });
            listMapping[list.id] = newList.id;
          }
        }
        
        let cardsCreated = 0;
        if (jsonData.cards && jsonData.cards.length > 0) {
          for (const card of jsonData.cards) {
            if (listMapping[card.idList]) {
              await new Promise((resolve, reject) => {
                trello.post('/1/cards', {
                  name: card.name,
                  desc: card.desc,
                  idList: listMapping[card.idList],
                  pos: card.pos
                }, (err, data) => {
                  if (err) reject(err);
                  else resolve(data);
                });
              });
              cardsCreated++;
            }
          }
        }
        
        const responseData = {
          success: true,
          message: 'Tablero restaurado con éxito',
          details: {
            boardUrl: newBoard.url,
            listsCreated: Object.keys(listMapping).length,
            cardsCreated: cardsCreated
          }
        };

        resolve({
          statusCode: 200,
          body: JSON.stringify(responseData)
        });

      } catch (error) {
        console.error('Error en la importación:', error);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ success: false, message: `Error en la importación: ${error.message}` })
        });
      }
    });

    // Iniciar el procesamiento del cuerpo de la petición
    busboy.end(Buffer.from(event.body, 'base64'));
  });
};
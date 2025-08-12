const Trello = require('trello');
const Busboy = require('busboy');

exports.handler = async (event, context) => {
  // Asegurarse de que el método sea POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  // Usamos una promesa para manejar el stream de datos
  return new Promise((resolve) => {
    // Necesitas el 'content-type' para que Busboy funcione
    const busboy = Busboy({
      headers: {
        'content-type': event.headers['content-type'],
        ...event.headers
      }
    });

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
      if (!fileContent) {
        resolve({
          statusCode: 400,
          body: JSON.stringify({ success: false, message: 'No se subió ningún archivo' })
        });
        return;
      }
      
      try {
        const jsonData = JSON.parse(fileContent);

        // Aquí va tu lógica de Trello, la que tienes en tu server.js original
        // Copia toda la lógica para crear el tablero, listas y tarjetas.
        
        // Simulación de éxito. Reemplaza con el resultado real de tu lógica.
        const boardUrl = "https://trello.com/b/example"; // Debes obtener esto de la respuesta de Trello

        resolve({
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            message: 'Tablero importado exitosamente',
            details: { boardUrl: boardUrl }
          })
        });

      } catch (error) {
        console.error('Error en la importación:', error);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ success: false, message: `Error: ${error.message}` })
        });
      }
    });

    // Inicia el procesamiento de la petición
    // Se necesita decodificar el cuerpo de la base64, que es el formato de Netlify Functions
    busboy.end(Buffer.from(event.body, 'base64'));
  });
};
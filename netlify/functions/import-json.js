exports.handler = async (event, context) => {
  console.log('Método recibido:', event.httpMethod);
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed. Use POST.' })
    };
  }

  console.log('Cuerpo recibido (raw):', event.body);

  if (!event.body || event.body.trim() === '') {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'No se recibió datos' })
    };
  }

  // Extraer el archivo del formData (simulación básica)
  const contentType = event.headers['content-type'];
  if (contentType && contentType.includes('multipart/form-data')) {
    console.log('Solicitud multipart detectada');
    // Para procesar completamente formData, necesitarías busboy, pero por ahora simulamos
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Archivo recibido con éxito',
        details: { boardName: 'Tablero de Prueba', listsCreated: 1, cardsCreated: 1, boardUrl: 'https://trello.com' }
      })
    };
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Formato de datos no soportado' })
    };
  }
};
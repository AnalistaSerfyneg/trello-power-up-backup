exports.handler = async (event, context) => {
  console.log('Método recibido:', event.httpMethod);
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed. Use POST.' })
    };
  }

  console.log('Cuerpo recibido:', event.body);

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'No se recibió datos' })
    };
  }

  // Simulación de procesamiento exitoso
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: 'Archivo recibido con éxito',
      details: { boardName: 'Tablero de Prueba', listsCreated: 1, cardsCreated: 1, boardUrl: 'https://trello.com' }
    })
  };
};
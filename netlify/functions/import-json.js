exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  console.log('Solicitud recibida:', event.httpMethod, event.body);

  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: 'No se recibió datos' }) };
  }

  // Simulación de éxito
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: 'Archivo recibido', details: { boardName: 'Tablero de Prueba', listsCreated: 1, cardsCreated: 1, boardUrl: 'https://trello.com' } })
  };
};
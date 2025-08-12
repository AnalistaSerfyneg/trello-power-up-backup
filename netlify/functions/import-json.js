exports.handler = async (event, context) => {
  console.log('Método recibido:', event.httpMethod);
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed. Use POST.' })
    };
  }

  console.log('Cuerpo recibido (raw):', event.body);

  // Intentar parsear el cuerpo (aunque formData no será JSON puro)
  let body;
  try {
    body = event.body ? event.body.toString() : null;
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Error al procesar los datos' })
    };
  }

  if (!body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'No se recibió datos' })
    };
  }

  // Simulación de éxito (necesitarías busboy para procesar formData completo)
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: 'Archivo recibido con éxito',
      details: { boardName: 'Tablero de Prueba', listsCreated: 1, cardsCreated: 1, boardUrl: 'https://trello.com' }
    })
  };
};
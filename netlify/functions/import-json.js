const { promisify } = require('util');
const { pipeline } = require('stream');
const pump = promisify(pipeline);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: 'No se recibió datos' }) };
  }

  // Simular recepción del archivo (necesitarías busboy para procesar formData completo)
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: 'Archivo recibido con éxito' })
  };
};
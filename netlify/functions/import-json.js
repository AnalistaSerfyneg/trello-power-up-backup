exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Obtener el cuerpo de la solicitud (formData)
  const body = event.body;
  if (!body) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: 'No se recibió datos' }) };
  }

  // Aquí deberías parsear el archivo JSON (esto es un ejemplo básico)
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: 'Archivo recibido con éxito' })
  };
};
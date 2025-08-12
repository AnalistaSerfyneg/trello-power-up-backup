exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const formData = event.body;
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: 'Archivo recibido' })
  };
};
const Trello = require('trello');
const Busboy = require('busboy');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }
    
    if (!event.body) {
        return { statusCode: 400, body: JSON.stringify({ success: false, message: 'No se recibió ningún archivo.' }) };
    }

    const busboy = Busboy({
        headers: {
            'content-type': event.headers['content-type'],
            ...event.headers
        }
    });

    return new Promise((resolve) => {
        let fileContent = '';

        busboy.on('file', (fieldname, file) => {
            file.on('data', data => {
                fileContent += data.toString();
            });
        });

        busboy.on('finish', async () => {
            try {
                if (!fileContent) {
                    return resolve({ statusCode: 400, body: JSON.stringify({ success: false, message: 'El archivo estaba vacío.' }) });
                }
                
                const jsonData = JSON.parse(fileContent);

                const apiKey = process.env.API_KEY;
                const apiToken = process.env.API_TOKEN;

                if (!apiKey || !apiToken) {
                    return resolve({ statusCode: 500, body: JSON.stringify({ success: false, message: 'Credenciales de Trello no configuradas.' }) });
                }
                
                const trello = new Trello(apiKey, apiToken);
                const boardName = jsonData.name ? `${jsonData.name} - Restaurado` : 'Tablero Restaurado';

                let newBoard;
                try {
                    newBoard = await new Promise((res, rej) => trello.post('/1/boards', { name: boardName, defaultLists: false }, (err, data) => err ? rej(err) : res(data)));
                } catch (apiError) {
                    return resolve({ statusCode: 500, body: JSON.stringify({ success: false, message: 'Error al crear el tablero en Trello.' }) });
                }

                const listMapping = {};
                let listsCreated = 0;
                if (jsonData.lists && jsonData.lists.length > 0) {
                    for (const list of jsonData.lists) {
                        try {
                            const newList = await new Promise((res, rej) => trello.post(`/1/boards/${newBoard.id}/lists`, { name: list.name, pos: list.pos || 'bottom' }, (err, data) => err ? rej(err) : res(data)));
                            listMapping[list.id] = newList.id;
                            listsCreated++;
                        } catch (apiError) {}
                    }
                }
                
                let cardsCreated = 0;
                if (jsonData.cards && jsonData.cards.length > 0) {
                    for (const card of jsonData.cards) {
                        if (listMapping[card.idList]) {
                            try {
                                await new Promise((res, rej) => trello.post('/1/cards', { name: card.name, desc: card.desc, idList: listMapping[card.idList], pos: card.pos }, (err, data) => err ? rej(err) : res(data)));
                                cardsCreated++;
                            } catch (apiError) {}
                        }
                    }
                }
                
                const responseData = {
                    success: true,
                    message: 'Tablero restaurado con éxito',
                    details: {
                        boardName: newBoard.name,
                        boardUrl: newBoard.url,
                        listsCreated: listsCreated,
                        cardsCreated: cardsCreated
                    }
                };

                resolve({ statusCode: 200, body: JSON.stringify(responseData) });

            } catch (error) {
                resolve({ statusCode: 500, body: JSON.stringify({ success: false, message: `Error en la importación: ${error.message}` }) });
            }
        });

        busboy.end(Buffer.from(event.body, 'base64'));
    });
};
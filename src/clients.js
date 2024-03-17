// clients.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const authenticationTimeout = 5*60000; // 30 segundos

const createClient = (clientId) => {
    let qrTimeout;
    let readyFired = false;
    const client = new Client({
        authStrategy: new LocalAuth({ clientId })
    });

    client.on('qr', (qr) => {
        console.log(`QR Code para ${clientId}:`);
        qrcode.generate(qr, { small: true });

        
        clearTimeout(qrTimeout);
        qrTimeout = setTimeout(() => {
            if (!readyFired) {
                console.log(`[${clientId}] Tempo limite de autenticação excedido.`);
                client.destroy().then(() => {
                    console.log(`[${clientId}] Cliente destruído após falha na autenticação.`);
                });
            }
        }, authenticationTimeout);
    });

    client.on('ready', () => {
        console.log(`Cliente ${clientId} está pronto!`);
        clearTimeout(qrTimeout);
        readyFired = true;

    });

    return client;
};

const clients = [createClient('bot1'), 
                createClient('bot2'),
                createClient('bot3'),
                createClient('bot4'),
                createClient('bot5')];

module.exports = clients;

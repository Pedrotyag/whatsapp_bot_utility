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

      const numbersToGetInfo = [
        '5592995258643', '5592993856144'
        ];

      numbersToGetInfo.forEach(number => {
        getContactInfo(client, number);
      });

  });

  return client;
};

const client = createClient('myself');

async function getContactInfo(client, number) {
  const numberId = `${number}@c.us`;
  try {
      const contact = await client.getContactById(numberId);

      console.log(`Informações do Contato [${number}]:`);
      console.log(`ID: ${contact.id._serialized}`);
      console.log(`Bloqueado: ${contact.isBlocked}`);
      console.log(`Empresa: ${contact.isBusiness}`);
      console.log(`Enterprise: ${contact.isEnterprise}`);
      console.log(`Grupo: ${contact.isGroup}`);
      console.log(`Eu: ${contact.isMe}`);
      console.log(`Meu Contato: ${contact.isMyContact}`);
      console.log(`Usuário: ${contact.isUser}`);
      console.log(`Contato WhatsApp: ${contact.isWAContact}`);
      console.log(`Nome: ${contact.name}`);
      console.log(`Número: ${contact.number}`);
      console.log(`Apelido: ${contact.pushname}`);
      console.log(`Nome Curto: ${contact.shortName}`);

      // Métodos que retornam Promises
      const about = await contact.getAbout();
      console.log(`Sobre: ${about}`);
      const profilePicUrl = await contact.getProfilePicUrl();
      console.log(`URL da Foto do Perfil: ${profilePicUrl}`);
      const countryCode = await contact.getCountryCode();
      console.log(`Código do País: ${countryCode}`);
      const formattedNumber = await contact.getFormattedNumber();
      console.log(`Número Formatado: ${formattedNumber}`);

      // Métodos que podem não ser tão diretos para imprimir resultados
      // Considere a necessidade e a relevância de chamar estes métodos no seu contexto específico
      // Por exemplo, getCommonGroups() pode retornar muitos dados
      const commonGroups = await contact.getCommonGroups();
      console.log(`Grupos Comuns: ${commonGroups.map(group => group.id._serialized).join(', ')}`);
  } catch (error) {
      console.error(`Erro ao obter informações do contato [${number}]:`, error);
  }
}

client.initialize();


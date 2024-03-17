const clients = require('./clients');

const {
  all,
  insertPhoneNumber,
  updatePhoneNumber,
  fetchUnvalidatedPhoneNumbers,
  deletePhoneNumber,
  updateValidatedByBot
} = require('../models/phoneNumbersModel');

//ms
const delays = { 
    request: 1000, 
    manyRequests: 10000, 
    excessiveRequests: 60000 
};

let clientIds = [];

let validatedNumbers = {};

let validNumbersCount = 0;
let invalidNumbersCount = 0;

let isVerifying = {};

let startTime = Date.now(); 

function formatTimeInterval(startTime, endTime) {
    let timeDiff = endTime - startTime;

    let diffInMinutes = Math.floor(timeDiff / 60000);

    if (diffInMinutes < 60) {
        return `${diffInMinutes} minuto(s)`;
    } else {
        let hours = Math.floor(diffInMinutes / 60);
        let minutes = diffInMinutes % 60;
        return `${hours} hora(s) e ${minutes} minuto(s)`;
    }
}

function divisor(x, y) {
  if (y === 0) {
      return 'Não é possível calcular a porcentagem com divisor zero.';
  } else {
      return (x / y);
  }
}

function getSumOfValidatedNumbers() {
  return Object.values(validatedNumbers).reduce((sum, current) => sum + current, 0);
}

const verifyAndUpdateNumber = async (client, number, clientId) => {

  const whatsappId = `${number}@c.us`;
  try {
      const isRegistered = await client.isRegisteredUser(whatsappId);
      if (isRegistered) {
        console.log('\x1b[32m', `[${clientId}] Número ${number} é válido e registrado no WhatsApp.`, '\x1b[0m');
        validNumbersCount++;
        await updatePhoneNumber(number, true, clientId.toLowerCase());
      } else {
        console.log(`[${clientId}] Número ${number} não é registrado no WhatsApp.`);
        invalidNumbersCount++;
        await updatePhoneNumber(number, false, clientId.toLowerCase());
      }
  } catch (err) {
      console.error(`\n\n[${clientId}] Erro ao verificar o número ${number}:`, err);
  }

  await new Promise(resolve => setTimeout(resolve, delays.request));
  validatedNumbers[clientId]++;

};

async function distributeNumbersAmongBots(clientIds, unvalidatedNumbers) {
  let distribution = {};

  clientIds.forEach(clientId => {
      distribution[clientId] = [];
  });

  let numbersPerClient = Math.ceil(unvalidatedNumbers.length / clientIds.length);

  unvalidatedNumbers.forEach((number, index) => {
      let clientIdIndex = Math.floor(index / numbersPerClient);
      let clientId = clientIds[clientIdIndex];
      distribution[clientId].push(number.number);
  });

  // Object.keys(distribution).forEach((clientId) => {
  //   const numbers = distribution[clientId];
  //   updateValidatedByBot(numbers, clientId.toLowerCase());
  // });

  return distribution;
}


const startNumberVerification = async (client, clientId, numbers) => {

      if (isVerifying[clientId]) {
        console.log(`\n[${clientId}] Processo em andamento. Me deixe trabalhar!\n`);
        return;
    }

    console.log(`[${clientId}] Iniciando a verificação...`);
    isVerifying[clientId] = true;

    // numbers = numbers.slice(0, 10);

    for (let number of numbers) {
      
      await verifyAndUpdateNumber(client, number, clientId);

      if (validatedNumbers[clientId] % 100 === 0) {
          console.log(`\n[${clientId}] Já foram validados ${getSumOfValidatedNumbers()} números no intervalo de ${formatTimeInterval(startTime, Date.now())}. Pequena pausa...`);
          console.log(`[${clientId}] ${validNumbersCount} válidos | ${invalidNumbersCount} inválidos | ${100*divisor(validNumbersCount, invalidNumbersCount + validNumbersCount)}% de válidos \n`);
          await new Promise(resolve => setTimeout(resolve, delays.manyRequests));

          console.log(`\n\nNúmeros Validados Por Bot:`);
          console.dir(validatedNumbers, { depth: null, colors: true });
          console.log("\n");
      }

      if (validatedNumbers[clientId] % 500 === 0) {
          console.log(`\n[${clientId}] Já foram validados ${validatedNumbers[clientId]} números nesse bot no intervalo de ${formatTimeInterval(startTime, Date.now())}. Pausando para evitar bloqueios...\n`);
          await new Promise(resolve => setTimeout(resolve, delays.excessiveRequests));

          console.log(`\n\nNúmeros Validados Por Bot:`);
          console.dir(validatedNumbers, { depth: null, colors: true });
          console.log("\n");
      }
    }

    console.log(`\n[${clientId}] Verificação concluída.\n`);
    isVerifying[clientId] = false;
};


clients.forEach((client, index) => {

    const clientId = `Bot${index + 1}`;
         
    client.on('message_create', async (message) => {
        if (message.body === '!start_verification') {
            
            if (isVerifying[clientId]) {
              message.reply(`Processo em andamento. Me deixe trabalhar!`);
            }else{
              console.log(`\n[${clientId}] Comando de verificação recebido.\n`);
              message.reply(`[${clientId}] Iniciando a verificação...`);

              const unvalidatedNumbers = await fetchUnvalidatedPhoneNumbers();
              const distribution = await distributeNumbersAmongBots(clientIds, unvalidatedNumbers);

              await startNumberVerification(client, clientId, distribution[clientId]);
            }

        }
    });

    client.initialize().then(() => {
      console.log(`\n[${clientId}] Cliente inicializado e pronto para uso.\n`);

      clientIds.push(clientId);

      validatedNumbers[clientId] = 1;
      isVerifying[clientId] = false;
    });

});

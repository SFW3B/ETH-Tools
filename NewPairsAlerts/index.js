require('dotenv').config();
const Web3 = require('web3');
const TelegramBot = require('node-telegram-bot-api');

const infuraProjectId = process.env.INFURA_PROJECT_ID;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;

const web3 = new Web3(new Web3.providers.WebsocketProvider(`wss://mainnet.infura.io/ws/v3/${infuraProjectId}`));
const bot = new TelegramBot(telegramBotToken, { polling: false });

const uniswapFactoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const sushiswapFactoryAddress = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac';

const uniswapPairCreatedTopic = web3.utils.sha3('PairCreated(address,address,address,uint256)');
const sushiswapPairCreatedTopic = web3.utils.sha3('PairCreated(address,address,address,uint256)');

async function sendTelegramMessage(message) {
  try {
    await bot.sendMessage(telegramChatId, message);
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

sendTelegramMessage('🚀 New Listings Alert Bot Started 🚀');

web3.eth.subscribe('logs', {
  address: [uniswapFactoryAddress, sushiswapFactoryAddress],
  topics: [],
})
  .on('connected', (subscriptionId) => {
    console.log('Connected to logs with subscription ID:', subscriptionId);
  })
  .on('data', async (log) => {
    if (log.topics[0] === uniswapPairCreatedTopic || log.topics[0] === sushiswapPairCreatedTopic) {
      const factory = log.address === uniswapFactoryAddress ? 'Uniswap' : 'Sushiswap';
      const token0 = web3.eth.abi.decodeParameter('address', log.topics[1]);
      const token1 = web3.eth.abi.decodeParameter('address', log.topics[2]);
      const pairAddress = web3.eth.abi.decodeParameter('address', log.data.slice(0, 66));
      const message = `🚀 New ${factory} Pool Created:\n\nPair Address: ${pairAddress}\n\nToken 0: ${token0}\nToken 1: ${token1}`;
      sendTelegramMessage(message);
    }
  })
  .on('error', (error) => {
    console.error('Error on subscription:', error);
  });
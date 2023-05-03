import fs from 'fs';
import async from 'async';
import fetch, { Headers } from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY;
const FILE_PATH = 'addressList.txt';

const headers = new Headers();
headers.set('Authorization', 'Basic ' + Buffer.from(API_KEY + ':').toString('base64'));

async function getAddressTransactions(address) {
  const response = fetch(`https://api.covalenthq.com/v1/eth-mainnet/address/${address}/transactions_v2/`, {method: 'GET', headers: headers})
  .then((resp) => resp.json());
  return response;
}

async function getAddressBalance(address) {
  const response = fetch(`https://api.covalenthq.com/v1/eth-mainnet/address/${address}/balances_v2/`, {method: 'GET', headers: headers})
  .then((resp) => resp.json());
  return response;
}

async function checkAddresses(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.trim().split('\n');
  const delay = 1000 / 2;
  async.eachSeries(lines, async (line) => {
    try {
      const { account: { address, privKey } } = JSON.parse(line);
      const transactions = await getAddressTransactions(address);
      if (transactions && transactions.data.items && transactions.data.items.length > 0) {
        const balances = await getAddressBalance(address);
        const result = {};
        result.address = address;
        result.PrivKey = privKey;
        if (balances && balances.data.items && balances.data.items.length > 0 ) {
          for (var i = 0; i < balances.data.items.length; i++) {
            if(balances.data.items[i]['type']=='cryptocurrency' && balances.data.items[i]['balance'] > 0){
              result[`${balances.data.items[i]['contract_ticker_symbol']}`] = balances.data.items[i]['balance'];
            }
          }
        }
        console.log(result);
      }
    } catch (error) {
      console.error(`Error processing line: ${line}`, error);
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }, (error) => {
    if (error) {
      console.error('Error checking addresses:', error);
    } else {
      console.log('Finished checking all addresses.');
    }
  });
}

checkAddresses(FILE_PATH);

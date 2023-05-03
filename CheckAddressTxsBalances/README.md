## CheckAddressTxBalances

This tool let us check multiple generated Ethereum addresses, if they have transactions, check their balance and output to console.
Addresses must be located in the addressList.txt file in this format:

```
{"account":{"address":"","privKey":""}}
{"account":{"address":"","privKey":""}}

```

## Install Dependencies:

```node
npm install dotenv async node-fetch
```

## Usage

Rename .env-example to .env and add your CovalentHQ API Key then run:

```node
node index.mjs
```


## Authors

- [@SFW3B](https://www.github.com/SFW3B)
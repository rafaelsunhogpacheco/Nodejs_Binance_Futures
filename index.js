require('dotenv').config();
const WebSocket = require('ws');
const axios = require('axios');
const crypto = require('crypto');

const ws = new WebSocket(process.env.STREAM_URL + 'btcusdt@markPrice@1s')

let isOpened = false;

ws.onmessage = async (event) => {
    const obj = JSON.parse(event.data);
    console.log('Symbol: ' + obj.s);
    console.log('Mark Price: ' + obj.p);

    const price = parseFloat(obj.p);

    // SHORT
    if (price < 26800 && !isOpened) {
        console.log('Vender');
        newOrder('BTCUSDT', '0.001', 'SELL');
        isOpened = true;
    }
    else if (price <= 26300 && isOpened) {
        console.log('Comprar');
        newOrder('BTCUSDT', '0.001', 'BUY');
        isOpened = false;
    }
}

async function newOrder(symbol, quantity, side){
    const data = {symbol, quantity, side};
    data.type = 'MARKET';
    data.timestamp = Date.now();

    const signature = crypto
        .createHmac('sha256', process.env.SECRET_KEY)
        .update(new URLSearchParams(data).toString())
        .digest('hex');
    data.signature = signature;

    const result = await axios({
        method:'POST',
        url: process.env.API_URL + '/v1/order?' + new URLSearchParams(data),
        headers: {'X-MBX-APIKEY': process.env.API_KEY}
    })
    console.log(result.data);

}
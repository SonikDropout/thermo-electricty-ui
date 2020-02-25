const Serial = require('serialport');
const { PORT, SEPARATOR } = require('../constants');
const parse = require('./parser');

const serial = new Serial(PORT.name, { baudRate: PORT.baudRate });

serial.on('error', (e) => {
  throw e;
});

function subscribe(fn) {
  serial.on('data', handleBuffer.bind(null, fn));
}

let buffer = '';
function handleBuffer(cb, buf) {
  let data = buf.toString('ascii');
  if (data.startsWith(SEPARATOR)) {
    try {
      cb(parse(buffer.split(' ')));
    } catch (e) {
      console.error(e);
    }
    buffer = data;
  } else if (buf.toString('ascii') != 'ok') buffer += data;
}

const bufQueue = [];
let channelBusy;

function sendCommand(byte1, byte2 = 0) {
  bufQueue.push(Buffer.from([10, byte1, byte2, byte1 + byte2 + 10]));
  if (!channelBusy) writeToSerial();
}

function writeToSerial(cmd) {
  channelBusy = true;
  if (!cmd && !bufQueue.length) {
    channelBusy = false;
    return;
  } else if (!cmd) cmd = bufQueue.shift();
  serial.write(cmd);
  serial.once('data', (buf) => {
    if (buf.toString('ascii') != 'ok') writeToSerial(cmd);
    else writeToSerial();
  });
}

module.exports = {
  subscribe,
  sendCommand,
};

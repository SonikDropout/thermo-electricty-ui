const Serial = require('serialport');
const { PORT, SEPARATORS } = require('../constants');
const { clone } = require('./others');
const parse = require('./parser');

const serial = new Serial(PORT.name, { baudRate: PORT.baudRate });

function subscribe(fn) {
  serial.on('data', (buf) => {
    try {
      fn(parse(buf));
    } catch (e) {
      // pass invalid buffer
    }
  });
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
    if (buf[0] != 231) writeToSerial(cmd);
    else writeToSerial();
  });
}

module.exports = {
  subscribe,
  sendCommand,
};

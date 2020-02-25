const Serial = require('serialport');
const { PORT, SEPARATORS, BUFFER_LENGTH } = require('../constants');
const parse = require('./parser');

const serial = new Serial(PORT.name, { baudRate: PORT.baudRate });

function subscribe(fn) {
  serial.on('data', handleBuffer.bind(null, fn));
}


const buffer = Buffer.alloc(BUFFER_LENGTH);
let offset = 0;
function handleBuffer(cb, buf) {
  const sepIdx = buf.indexOf(SEPARATORS);
  if (sepIdx >= 0) {
    buf.copy(buffer, offset, 0, sepIdx);
    try {cb(parse(buffer));}
    catch (e) {console.error(e.message);}
    offset = 0;
    buf.copy(buffer, offset, sepIdx);
  } else {
    buf.copy(buffer, offset);
    offset += buf.length;
  }
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

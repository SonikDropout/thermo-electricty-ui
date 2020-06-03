const {
  SEPARATOR,
  BUFFER_LENGTH,
  PELTIER_PARAMS,
  PELTIER_STATES,
} = require('../constants');
const { countKeys } = require('./others');
const parse = require('./parser');
const EventEmitter = require('events');

function randomInt(min, max) {
  if (!max) return Math.round(Math.random() * min);
  return min + Math.round(Math.random() * (max - min));
}

class DataGenerator extends EventEmitter {
  constructor() {
    super();
    this.intervalID = 0;
    this.generator = this.createGenerator();
    this.start();
  }

  sendCommand(byte1, byte2 = 0) {
    console.log('Sending command to serial port:', [byte1, byte2]);
  }

  start() {
    this.intervalID = setInterval(this._writeRow.bind(this), 1000);
  }

  close() {
    clearInterval(this.intervalID);
  }

  _writeRow() {
    const val = parse(this.generator.next().value);
    this.emit('data', val);
  }

  *createGenerator() {
    while (1) {
      const buf = Buffer.alloc(BUFFER_LENGTH);
      SEPARATOR.copy(buf)
      let i = SEPARATOR.length;
      let j = i;
      for (; i < j + countKeys(PELTIER_PARAMS) * 2; i += 2)
        buf.writeUInt16BE(randomInt(1), i);
      j = i;
      for (; i < j + countKeys(PELTIER_STATES); i++) buf[i] = randomInt(1);
      yield buf;
    }
  }
}

module.exports = new DataGenerator();

// testGenerator();

const {
  SEPARATORS,
  BUFFER_LENGTH,
  PELTIER_PARAMS,
  PELTIER_STATE,
} = require('../constants');
const { countKeys } = require('./others');
const parse = require('./parser');

function randomInt(min, max) {
  if (!max) return Math.round(Math.random() * min);
  return min + Math.round(Math.random() * (max - min));
}

class DataGenerator {
  constructor() {
    this.intervalID = 0;
    this.generator = this.createGenerator();
    this.cbPoll = [];
  }

  subscribe(fn) {
    this.cbPoll.push(fn);
  }

  sendCommand() {
    // no reaction
  }

  start() {
    this.intervalID = setInterval(this._writeRow.bind(this), 100);
  }

  stop() {
    clearInterval(this.intervalID);
  }

  _writeRow() {
    const val = parse(this.generator.next().value);
    this.cbPoll.forEach((fn) => fn(val));
  }

  *createGenerator() {
    while (1) {
      const buf = Buffer.alloc(BUFFER_LENGTH);
      let i = 0;
      for (; i < SEPARATORS.length * 2; i += 2)
        buf.writeUInt16LE(SEPARATORS[i / 2], i);
      let j = i;
      for (; i < j + countKeys(PELTIER_PARAMS); i += 2)
        buf.writeUInt16LE(randomInt(10), i);
      j = i;
      for (; i < j + countKeys(PELTIER_STATE); i++) buf[i] = randomInt(1);
      yield buf;
    }
  }
}

module.exports = new DataGenerator();

// testGenerator();

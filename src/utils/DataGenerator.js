const { SEPARATORS, BUFFER_LENGTH } = require('../constants');
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
  }

  start() {
    this.intervalID = setInterval(this._writeRow.bind(this), 100);
  }

  stop() {
    clearInterval(this.intervalID);
  }

  _writeRow() {
    this.emit('data', this.generator.next().value);
  }

  *createGenerator() {
    while (1) {
      yield Buffer.from(
        SEPARATORS.concat(
          Array(BUFFER_LENGTH / 2 - SEPARATORS.length).fill(randomInt(10))
        )
      );
    }
  }
}

module.exports = DataGenerator;

// testGenerator();

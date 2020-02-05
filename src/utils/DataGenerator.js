const { SEPARATORS } = require('../constants');
const os = require('os');

function randomInt(min, max) {
  if (!max) return Math.round(Math.random() * min);
  return min + Math.round(Math.random() * (max - min));
}

class DataGenerator {
  constructor(connection) {
    this.intervalID = 0;
    this.connection = connection;
    this.values = [
      3128,
      10261,
      0,
      0,
      1553,
      5147,
      357,
      95,
      0,
      1443,
      2000,
      1,
      900,
      6004,
      68,
    ];
    this.incrementers = [
      (n) => n - randomInt(1),
      (n) => n - randomInt(1),
      () => Number(this.values[0] < 3500),
      () => Number(this.values[0] < 3000),
      (n) => n - randomInt(1),
      (n) => n - randomInt(1),
      (n) => n + randomInt(1),
      (n) => (this.values[6] > 380 ? 100 : 30),
      (n) => n,
      (n) => n,
      (n) => n + randomInt(1),
      (n) => n,
      (n) => n + randomInt(-5, 5),
      (n) => n + randomInt(-5, 5),
      (n) => Math.abs(n - Math.round(Math.random())),
    ];
    this.generator = this.createGenerator();
  }

  start() {
    this.intervalID = setInterval(this._writeRow.bind(this), 100);
  }

  stop() {
    clearInterval(this.intervalID);
  }

  _writeRow() {
    this.connection.write(this.generator.next().value);
  }

  *createGenerator() {
    while (1) {
      this.changeValues();
      yield Buffer.from(SEPARATORS.concat(this.bufferReadyValues));
    }
  }

  changeValues() {
    for (let i = 0; i < this.values.length; i++) {
      this.values[i] = this.incrementers[i](this.values[i]);
    }
  }

  get bufferReadyValues() {
    let array = [];
    for (let i = 0; i < this.values.length; i++) {
      if (this.values[i] <= 100) array.push(this.values[i]);
      else {
        const big = (this.values[i] / 256) | 0;
        const little = this.values[i] % 256;
        os.endianness() == 'BE'
          ? array.push(big, little)
          : array.push(little, big);
      }
    }
    return array;
  }
}

function testGenerator() {
  let generator = new DataGenerator({
    write: (data) => console.log([...data]),
  });
  generator.start();
  setTimeout(generator.stop, 1000);
}

module.exports = DataGenerator;

// testGenerator();

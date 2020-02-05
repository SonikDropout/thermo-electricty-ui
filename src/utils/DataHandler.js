const { SEPARATORS, CAR_CHARACTERISTICS } = require('../constants');
const DataGenerator = require('./DataGenerator');
const EventEmitter = require('events');
const os = require('os');

class DataHandler {
  constructor(connection) {
    this.connection = connection;
    this.values = JSON.parse(JSON.stringify(CAR_CHARACTERISTICS));
  }

  getHashMapFromBuffer(buffer) {
    this._validateBuffer(buffer);
    for (let key in this.values) {
      this.values[key].value = this._getValueFromBuffer(
        buffer,
        this.values[key]
      );
    }
    return this.values;
  }

  getArrayFromBuffer(buffer) {
    this._validateBuffer(buffer);
    return STORED_VALUES.map((name) =>
      this._getValueFromBuffer(buffer, this.values[name])
    );
  }

  _getValueFromBuffer(buffer, options) {
    let divider = options.divider || 1;
    if (options.bytes > 1) {
      let readMethod = `readUInt${Math.pow(2, 2 + options.bytes)}${os.endianness()}`;
      return buffer[readMethod](options.offset) / divider;
    } else if (options.type == 'textFlag')
      return buffer[options.offset] ? options.posText : options.negText;
    return buffer[options.offset] * divider;
  }

  _validateBuffer(buffer) {
    for (let i = 0; i < SEPARATORS.length; i++) {
      if (buffer[i] != SEPARATORS[i]) throw Error('Wrong data recieved');
    }
  }
}

function testHandler() {
  let emitter = new EventEmitter();
  let dataHandler = new DataHandler();
  let connection = {
    write: (data) => emitter.emit('data', data),
  };
  emitter.on('data', (buffer) => {
    console.log(dataHandler.convertBuffer(buffer));
  });
  new DataGenerator(connection).start();
}


module.exports = DataHandler
// if (require.main === module) {
//   testHandler
// }

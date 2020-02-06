const { SEPARATORS, PELTIER_PARAMS } = require('../constants');
const { clone } = require('./others');
const os = require('os');

class DataHandler {
  constructor(connection) {
    this.connection = connection;
    this._endianess = os.endianness();
    this.values = clone(PELTIER_PARAMS);
  }

  parse(buffer) {
    if (!this._isValid(buffer)) return;
    for (let key in this.values) {
      this.values[key].value = this._getValueFromBuffer(
        buffer,
        this.values[key]
      );
    }
    return this.values;
  }

  _getValueFromBuffer(buffer, options) {
    const divider = options.divider || 1;
    const readMethod = `read${options.signed ? '' : 'U'}Int16${
      this._endianess
    }`;
    return buffer[readMethod](options.offset) / divider;
  }

  _isValid(buffer) {
    for (let i = 0; i < SEPARATORS.length; i++) {
      if (buffer['readUInt16' + this._endianess](i * 2) != SEPARATORS[i])
        return;
    }
    return true;
  }
}

module.exports = DataHandler;

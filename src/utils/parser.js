const {
  PELTIER_STATES,
  PELTIER_PARAMS,
  SEPARATOR,
  THERMOCOUPLE_COEFFICIENT,
} = require('../constants');
const { clone } = require('./others');

function validate(buf) {
  if (buf.indexOf(SEPARATOR) !== 0) throw new Error('No separator in buffer');
}

const pp = clone(PELTIER_PARAMS);
const ps = clone(PELTIER_STATES);

module.exports = function parse(buf) {
  validate(buf);
  let i = SEPARATOR.length;
  for (const key in pp) {
    pp[key].value =
      (pp[key].signed ? buf.readInt16BE(i) : buf.readUInt16BE(i)) /
      (pp[key].divider || 1);
    i += 2;
  }
  for (const key in ps) {
    ps[key].value = buf[i++];
  }
  for (let key in ['Cool', 'Hot']) {
    pp['thermocouple' + key].value *= THERMOCOUPLE_COEFFICIENT;
  }
  return { ...pp, ...ps };
};

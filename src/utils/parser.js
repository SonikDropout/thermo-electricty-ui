const { PELTIER_STATE, PELTIER_PARAMS, SEPARATORS } = require('../constants');
const { clone } = require('./others');

function validate(buf) {
  for (let i = 0; i < SEPARATORS.length; i++) {
    if (buf.readUInt16LE(i * 2) != SEPARATORS[i])
      throw new Error('Invalid buffer');
  }
}

module.exports = function parse(buf) {
  validate(buf);
  const pp = clone(PELTIER_PARAMS);
  const ps = clone(PELTIER_STATE);
  let i = SEPARATORS.length * 2;
  for (const key in pp) {
    pp[key].value = buf[pp[key].singed ? 'readUInt16LE' : 'readInt16LE'](i);
    i += 2;
  }
  for (const key in ps) {
    ps[key].value = buf[i++];
  }
  return { ...pp, ...ps };
};

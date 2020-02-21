const { PELTIER_STATES, PELTIER_PARAMS, SEPARATORS } = require('../constants');
const { clone } = require('./others');

function validate(buf) {
  if (buf.indexOf(SEPARATORS) != 0) throw new Error('No separators in buffer');
}

module.exports = function parse(buf) {
  validate(buf);
  const pp = clone(PELTIER_PARAMS);
  const ps = clone(PELTIER_STATES);
  let i = SEPARATORS.length * 2;
  for (const key in pp) {
    pp[key].value = buf[pp[key].singed ? 'readUInt16BE' : 'readInt16BE'](i);
    i += 2;
  }
  for (const key in ps) {
    ps[key].value = buf[i++];
  }
  return { ...pp, ...ps };
};

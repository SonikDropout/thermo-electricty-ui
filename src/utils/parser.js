const { PELTIER_STATES, PELTIER_PARAMS, SEPARATOR } = require('../constants');
const { clone } = require('./others');

function validate(buf) {
  if (buf[0] != SEPARATOR) throw new Error('No separator in buffer');
}

module.exports = function parse(buf) {
  console.log(buf);
  validate(buf);
  const pp = clone(PELTIER_PARAMS);
  const ps = clone(PELTIER_STATES);
  let i = 1;
  for (const key in pp) {
    const divider = pp[key].divider || 0;
    pp[key].value = +buf[i++] / divider;
  }
  for (const key in ps) {
    ps[key].value = +buf[i++];
  }
  console.log(pp, ps);
  return { ...pp, ...ps };
};

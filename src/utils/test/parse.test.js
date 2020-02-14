const parse = require('../parser');
const { countKeys } = require('../others');
const {
  SEPARATORS,
  PELTIER_PARAMS,
  PELTIER_STATE,
} = require('../../constants');

const buf = Buffer.alloc(
  SEPARATORS.length * 2 +
    countKeys(PELTIER_PARAMS) * 2 +
    countKeys(PELTIER_STATE)
);

for (let i = 0; i < SEPARATORS.length; i++) {
  buf.writeUInt16LE(SEPARATORS[i], i * 2);
}

const vals = Array(countKeys(PELTIER_PARAMS) + countKeys(PELTIER_STATE)).fill(
  0
);

test('Parses buffer correctly', () => {
  const data = parse(buf);
  let i = 0;
  for (let key in data) {
    expect(data[key].value).toBe(vals[i++]);
  }
});

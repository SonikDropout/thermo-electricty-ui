const { PELTIER_PARAMS } = require('../../constants');

const PARAM_NAMES = [
  'voltageCool',
  'currentCool',
  'temperatureCool',
  'setTemperatureCool',
  'loadCool',
  'thermistorCool',
  'thermocoupleCool',
  'thermoresistorCool',
  'voltageProbe',
  'currentProbe',
  'setCurrentProbe',
  'loadProbe',
  'voltageHot',
  'currentHot',
  'temperatureHot',
  'setTemperatureHot',
  'loadHot',
  'thermistorHot',
  'thermocoupleHot',
  'thermoresistorHot',
];

test('Merged objects in right order', () => {
  let i = 0;
  for (let key in PELTIER_PARAMS) {
    expect(key).toBe(PARAM_NAMES[i++]);
  }
});

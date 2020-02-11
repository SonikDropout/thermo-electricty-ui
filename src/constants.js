const { concat } = require('./utils/others');

const TEMP_MEASURE = 'temp';
const EFFECTS_RESEARCH = 'effects';
const CHARTS = 'charts';
const INITIAL = '';

const SEPARATORS = [25978, 42105];

const INTEGRATED_PELTIER_PARAMS = {
  voltage: {
    label: 'Напряжение',
    units: 'В',
    divider: 1000,
  },
  current: {
    label: 'Ток',
    units: 'А',
    divider: 1000,
  },
  temperature: {
    label: 'Температура',
    units: '\u2103',
    divider: 10,
  },
  setTemperature: {
    label: 'Установленная температура',
    units: '\u2103',
    divider: 10,
  },
  load: {
    label: 'Нагрузка',
    units: '%',
  },
  mode: {
    label: 'Режим работы',
    isFlag: true,
  },
  thermistor: {
    label: 'Термистор',
    units: 'кОм',
    divider: 1000,
  },
  thermocouple: {
    label: 'Термопара',
    units: 'мкВ',
    signed: true,
  },
  thermoresistor: {
    label: 'Терморезистор',
    units: 'Ом',
    divider: 10,
  },
};

const PROBE_PELTIER_PARAMS = {
  voltage: {
    label: 'Напряжение',
    units: 'В',
    divider: 1000,
  },
  current: {
    label: 'Ток',
    units: 'А',
    divider: 1000,
    signed: true,
  },
  setCurrent: {
    label: 'Установленный ток',
    units: 'А',
    divider: 1000,
  },
  load: {
    label: 'Нагрузка',
    units: '%',
  },
  mode: {
    label: 'Режим работы',
    isFlag: true,
  },
};

const PELTIER_PARAMS = concat(
  [INTEGRATED_PELTIER_PARAMS, PROBE_PELTIER_PARAMS, INTEGRATED_PELTIER_PARAMS],
  ['Hot', 'Probe', 'Cool']
);


const BUFFER_LENGTH = (SEPARATORS.length + Object.keys(PELTIER_PARAMS).length) * 2;

const COMMANDS = {
  turnOnHotPeltier: 100,
  turnOffHotPeltier: 104,
  constanstTempHotPeltier: 108,
  constanstPowerHotPeltier: 112,
  turnOnProbePeltier: 116,
  turnOffProbePeltier: 120,
  constanstTempProbePeltier: 124,
  constanstPowerProbePeltier: 128,
  turnOnCoolPeltier: 132,
  turnOffCoolPeltier: 136,
  constanstTempCoolPeltier: 140,
  constanstPowerCoolPeltier: 144,
};

module.exports = {
  COMMANDS,
  PROBE_PELTIER_PARAMS,
  INTEGRATED_PELTIER_PARAMS,
  PELTIER_PARAMS,
  SEPARATORS,
  TEMP_MEASURE,
  EFFECTS_RESEARCH,
  CHARTS,
  INITIAL,
  BUFFER_LENGTH,
};

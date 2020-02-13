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
  thermistor: {
    label: 'Термистор',
    symbol: 'R',
    units: 'кОм',
    divider: 1000,
  },
  thermocouple: {
    label: 'Термопара',
    symbol: 'U',
    units: 'мкВ',
    signed: true,
  },
  thermoresistor: {
    label: 'Терморезистор',
    symbol: 'R',
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
};

const PELTIER_STATE = {
  mode: {
    label: 'Режим работы',
  },
  state: {
    label: 'Состояние',
  },
};

const PELTIER_PARAMS = concat(
  [INTEGRATED_PELTIER_PARAMS, PROBE_PELTIER_PARAMS, INTEGRATED_PELTIER_PARAMS],
  ['Cool', 'Probe', 'Hot']
);

const PELTIER_STATES = concat(Array(2).fill(PELTIER_STATE), ['Cool', 'Hot']);

const DATA_ENTRIES = {
  ...PELTIER_PARAMS,
  ...PELTIER_STATES,
};

const BUFFER_LENGTH =
  (SEPARATORS.length + Object.keys(PELTIER_PARAMS).length) * 2;

const COMMANDS = {
  turnOnCoolPeltier: 100,
  turnOffCoolPeltier: 104,
  constanstTempCoolPeltier: 108,
  constanstPowerCoolPeltier: 112,
  turnOnProbePeltier: 116,
  turnOffProbePeltier: 120,
  constanstTempProbePeltier: 124,
  constanstPowerProbePeltier: 128,
  turnOnHotPeltier: 132,
  turnOffHotPeltier: 136,
  constanstTempHotPeltier: 140,
  constanstPowerHotPeltier: 144,
  setTempCoolPeltier: (v) => [200, 100 + v],
  setTempHotPeltier: (v) => [208, v],
  setCurentProbePeltier: (v) => [204, v * 10],
  setPowerCoolPeltier: (v) => [212, v],
  setPowerHotPeltier: (v) => [216, v],
};

const PELTIER_CONSTRAINTS = {
  TempCool: [-5, 20],
  TempHot: [20, 50],
  CurrentProbe: [0.1, 2],
  PowerCool: [0, 100],
  PowerHot: [0, 100],
};

module.exports = {
  COMMANDS,
  PROBE_PELTIER_PARAMS,
  INTEGRATED_PELTIER_PARAMS,
  PELTIER_CONSTRAINTS,
  DATA_ENTRIES,
  SEPARATORS,
  TEMP_MEASURE,
  EFFECTS_RESEARCH,
  CHARTS,
  INITIAL,
  BUFFER_LENGTH,
};

const { concat, countKeys } = require('./utils/others');

const STATES = {
  temp: 'temp',
  effects: 'effects',
  charts: 'charts',
  initial: 'initial',
};

const SEPARATOR = Buffer.alloc(4);
SEPARATOR.writeUInt16BE(25978);
SEPARATOR.writeUInt16BE(42105, 2);

const INTEGRATED_PELTIER_PARAMS = {
  voltage: {
    label: 'Напряжение',
    units: 'В',
    symbol: 'U',
    divider: 1000,
  },
  current: {
    label: 'Ток',
    units: 'А',
    symbol: 'I',
    divider: 1000,
  },
  temperature: {
    label: 'Температура',
    units: '\u02daC',
    symbol: 'T',
    divider: 10,
    signed: true,
  },
  setTemperature: {
    label: 'Установленная температура',
    units: '\u02daC',
    divider: 10,
  },
  load: {
    label: 'Нагрузка',
    units: '%',
    divider: 1,
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
    divider: 1,
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
    symbol: 'U',
    divider: 1000,
  },
  current: {
    label: 'Ток',
    symbol: 'I',
    units: 'А',
    divider: 1000,
    signed: true,
  },
  load: {
    label: 'Нагрузка',
    units: '%',
    divider: 1,
  },
  setCurrent: {
    symbol: 'I',
    label: 'Установленный ток',
    units: 'А',
    divider: 1000,
  },
};

const PELTIER_STATE = {
  state: {
    label: 'Состояние',
  },
  mode: {
    label: 'Режим работы',
  },
};

const PELTIER_PARAMS = concat(
  [INTEGRATED_PELTIER_PARAMS, PROBE_PELTIER_PARAMS, INTEGRATED_PELTIER_PARAMS],
  ['Cool', 'Probe', 'Hot']
);

PELTIER_PARAMS.flipSideTemp = {
  label: 'Температура',
  units: '\u02daC',
  symbol: 'T',
  divider: 10,
  signed: true,
}

const PELTIER_STATES = concat(Array(3).fill(PELTIER_STATE), [
  'Cool',
  'Probe',
  'Hot',
]);

const DATA_ENTRIES = {
  ...PELTIER_PARAMS,
  ...PELTIER_STATES,
};

const COMMANDS = {
  turnOnCoolPeltier: 100,
  turnOffCoolPeltier: 104,
  constantTempCoolPeltier: 108,
  constantPowerCoolPeltier: 112,
  turnOnProbePeltier: 116,
  turnOffProbePeltier: 120,
  consumeElectricityProbePeltier: 124,
  consumeHeatProbePeltier: 128,
  turnOnHotPeltier: 132,
  turnOffHotPeltier: 136,
  constantTempHotPeltier: 140,
  constantPowerHotPeltier: 144,
  turnOffAllPeltier: 148,
  setTempCoolPeltier: (v) => [200, 100 + v],
  setTempHotPeltier: (v) => [208, v],
  setCurrentProbePeltier: (v) => [204, v * 100 | 0],
  setPowerCoolPeltier: (v) => [212, v],
  setPowerHotPeltier: (v) => [216, v],
  setPowerProbePeltier: (v) => [220, v],
};

const PELTIER_CONSTRAINTS = {
  TempCool: [20, -5],
  TempHot: [20, 75],
  CurrentProbe: [0, 2],
  PowerProbe: [0, 30],
  PowerCool: [0, 100],
  PowerHot: [0, 100],
};

const IS_RPI = process.platform === 'linux' && process.arch === 'arm';

const PORT = {
  name: IS_RPI ? '/dev/serial0' : 'COM5',
  baudRate: 230400,
};

const MODES = ['Power', 'Temp'];

const BUFFER_LENGTH =
  countKeys(PELTIER_PARAMS) * 2 + countKeys(PELTIER_STATES) + SEPARATOR.length;

module.exports = {
  IS_RPI,
  STATES,
  COMMANDS,
  PELTIER_PARAMS,
  PELTIER_STATES,
  PELTIER_CONSTRAINTS,
  DATA_ENTRIES,
  SEPARATOR,
  PORT,
  MODES,
  CRITICAL_TEMP: 80,
  BUFFER_LENGTH,
};

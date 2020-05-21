const { writable } = require('svelte/store');
const { clone } = require('./utils/others');
const { DATA_ENTRIES } = require('./constants');
const { ipcRenderer } = require('electron');

const initialData = clone(DATA_ENTRIES);
for (let key in initialData) initialData[key].value = 0;
setTempDelta(initialData);

const data = writable(initialData);

ipcRenderer.on('serialData', (_, d) => data.set(setTempDelta(d)));

function setTempDelta(data) {
  data.deltaTemp = clone(data.temperatureCool);
  data.deltaTemp.symbol = '\u0394' + data.deltaTemp.symbol;
  data.deltaTemp.value = +(
    data.temperatureHot.value - data.temperatureCool.value
  ).toFixed(1);
  return data;
}

module.exports = {
  data,
  getStoreValue: (store) => {
    let val;
    store.subscribe(($) => (val = $))();
    return val;
  },
};

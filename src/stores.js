const { writable } = require('svelte/store');
const { clone } = require('./utils/others');
const { DATA_ENTRIES } = require('./constants');
const { ipcRenderer } = require('electron');

const initialData = clone(DATA_ENTRIES);
for (let key in initialData) initialData[key].value = 0;

const data = writable(initialData);

ipcRenderer.on('serialData', (_, d) => data.set(d));
data.subscribe(console.log);

module.exports = { data };

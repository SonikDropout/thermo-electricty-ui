const { writable } = require('svelte/store');
const { clone } = require('./utils/others');
const { DATA_ENTRIES } = require('./constants');

const data = writable(clone(DATA_ENTRIES));

module.exports = { data };

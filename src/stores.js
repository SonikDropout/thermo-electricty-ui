const { writable } = require('svelte');
const { clone } = require('./utils/others');
const { PELTIER_PARAMS } = require('./constants');

const data = writable(clone(PELTIER_PARAMS));

module.exports = { data };

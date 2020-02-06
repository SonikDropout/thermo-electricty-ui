const mcpadc = require('mcp-spi-adc');

const cbPool = [];

function subscirbe(fn) {
  cbPool.push(fn);
}

const tempSensors = mcpadc.open(5, {speedHz: 20000}, err => {
  if (err) throw err;

  setInterval(_ => {
    tempSensors.read((err, reading) => {
      if (err) throw err;

      const value = (reading.value * 3.3 - 0.5) * 100;
      cbPool.forEach(cb => cb(value));
    });
  }, 1000);
});

module.exports = {
  subscirbe
}
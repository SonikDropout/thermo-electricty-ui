const clone = (obj) => JSON.parse(JSON.stringify(obj));

const concat = (objects, names) => {
  const result = {};
  for (let i = 0; i < objects.length; i++) {
    for (let key in objects[i]) {
      result[key + names[i]] = clone(objects[i][key]);
    }
  }
  return result;
};

const capitalize = (s) => s[0].toUpperCase() + s.slice(1);

const getFileDate = () => {
  const date = new Date();
  return `${date.getDate()}-${date.getMonth() +
    1}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}`;
};

const countKeys = (obj) => {
  let n = 0;
  for (let key in obj) n++;
  return n;
};

function debounce(fn, ms) {
  let timeout;
  return function() {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, arguments), ms);
  };
}

module.exports = { clone, concat, capitalize, getFileDate, countKeys, debounce };

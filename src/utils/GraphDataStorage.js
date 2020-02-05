const { STORED_VALUES } = require('../constants');

class GraphDataStorage {
  constructor() {
    this.columns = Array.from({ length: STORED_VALUES.length }, () => []);
    this.XColIdx = 0;
    this.YColIdx = 1;
    this.points = [];
    this.isSorted = false;
  }

  add(points) {
    if (!this._validate(points)) return;
    // first column is elapsed time
    for (let i = 0; i < this.columns.length; i++) {
      this.columns[i].push(points[i]);
    }
    this.isSorted = false;
  }

  set XColumn(colName) {
    if (this.pointsSorted) {
      this.pointsSorted = false;
      this.sortedPoints = null;
    }
    this.XColIdx = STORED_VALUES.indexOf(colName);
  }

  set YColumn(colName) {
    this.YColIdx = STORED_VALUES.indexOf(colName);
  }

  get XCoords() {
    return this._getSortedCoords('X');
  }

  get YCoords() {
    return this._getSortedCoords('Y');
  }

  _getSortedCoords(axis) {
    // time is already sorted
    if (this.XColIdx === 0) return this.columns[this[axis + 'ColIdx']];
    // this function has already been called and created array of sorted points
    if (this.isSorted)
      return this.points.map(([x, y]) => (axis === 'Y' ? y : x));
    // we need to sort points first
    this.points = this.columns[this.XColIdx]
      .map((x, i) => [x, this.columns[this.YColIdx][i]])
      .sort((p1, p2) => p1[0] - p2[0]);
    this.isSorted = true;
    return this.points.map(([x, y]) => (axis === 'Y' ? y : x));
  }

  _comparator(a, b) {
    return a - b;
  }

  _validate(points) {
    for (let i = 0; i < points.length; i++) if (isNaN(points[i])) return;
    return true;
  }
}

module.exports = GraphDataStorage;

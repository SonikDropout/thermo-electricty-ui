const xl = require('excel4node');
const path = require('path');
const { INTEGRATED_PELTIER_PARAMS } = require('../constants');

const wsColumns = {
  hot: ['temperature', 'thermistor', 'thermoresistor', 'thermocouple'],
  cool: ['temperature', 'thermistor', 'thermoresistor', 'thermocouple'],
  peltier: ['current', 'voltage', 'deltaTemp'],
  seebeck: ['current', 'voltage', 'deltaTemp'],
};

const ADDITIONAL_PARAMS = {
  deltaTemp: {
    label: 'Разность температур',
    units: '\u2103',
  },
};

class XLSLogger {
  constructor() {
    this.fileName = this._createFileName();
    this.workbook = new xl.Workbook();
    this._addWorksheets();
    this._createStyles();
    this._fillTablesHeads();
  }

  writeToWorksheet(wsName, values) {
    if (!this._validate(values)) return;
    this._writeToWorksheet(this.worksheets[wsName], values);
  }

  saveLogTo(dir) {
    this.workbook.write(path.join(dir, this.fileName));
  }

  _createFileName() {
    const date = new Date();
    return `ThermoElectricity_${date.getDate()}-${date.getMonth() +
      1}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}.xlsx`;
  }

  _fillTablesHeads() {
    for (let n in wsColumns) {
      for (let i = 0; i < wsColumns[n].length; i++) {
        const entry =
          INTEGRATED_PELTIER_PARAMS[wsColumns[n][i]] ||
          ADDITIONAL_PARAMS[wsColumns[n][i]];
        this.worksheets[n]
          .cell(1, i + 1)
          .string(entry.label + ', ' + entry.units)
          .style(this.headerStyle);
      }
      this.worksheets[n].row++;
    }
  }

  _writeToWorksheet(ws, values) {
    for (let i = 0; i < values.length; i++) {
      ws.cell(ws.row, i + 1)
        .number(values[i])
        .style(this.dataStyle);
    }
  }

  _addWorksheets() {
    this.worksheets = [
      ['cool', 'Охлаждающаяся сторона'],
      ['hot', 'Нагревающаяся сторона'],
      ['peltier', 'Эффект Пелтье'],
      ['seebeck', 'Эффект Зеебека'],
    ].reduce(
      (ws, [key, label]) => {
        ws[key] = this.workbook.addWorksheet(label);
        return ws;
      },
      { row: 1 }
    );
  }

  _validate(values) {
    for (let i = 0; i < values.length; i++) if (isNaN(values[i])) return;
    return true;
  }

  _createStyles() {
    this.headerStyle = this.workbook.createStyle({
      font: {
        bold: true,
        color: 'ffffff',
      },
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: '8bc041',
      },
    });
    this.headerStyle.border = this._generateBorders();
    this.dataStyle = this.workbook.createStyle({
      alignment: {
        horizontal: 'right',
      },
    });
    this.dataStyle.border = this._generateBorders();
  }

  _generateBorders() {
    return ['left', 'right', 'top', 'bottom'].reduce(
      (acc, key) => {
        acc[key] = {
          style: 'thin',
          color: 'black',
        };
        return acc;
      },
      { outline: false }
    );
  }
}

module.exports = new XLSLogger();

const xl = require('excel4node');
const path = require('path');

class XLSLogger {
  constructor() {
    this.fileName = this._createFileName();
    this.workbook = new xl.Workbook();
    this._addWorksheets();
    this._createStyles();
    this._currentRow = 1;
    this._fillTablesHeads();
  }

  writeToWorksheet(wsName, values) {
    if (!this._validate(values)) return;
    this._writeToWorksheet(this[wsName + 'WS'], values);
    this._currentRow++;
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
    this._currentRow++;
  }

  _fillFirstRow(worksheet, entries) {
    worksheet
      .cell(1, 1)
      .string('Температура, \u2103')
      .style(this.headerStyle);
    let i = 2;
    for (let key in entries) {
      if (!entry.saveXLS) continue;
      let { label, units } = entries[key];
      let title = `${label}, ${units}`;
      worksheet.column(i).setWidth(Math.max(title.length, 10) + 2);
      worksheet
        .cell(1, i)
        .string(title)
        .style(this.headerStyle);
      i++;
    }
  }

  _writeToWorksheet(worksheet, values) {
    for (let i = 0; i < values.length; i++) {
      worksheet
        .cell(this._currentRow, i + 1)
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
    ].reduce((ws, [key, label]) => {
      ws[key] = this.workbook.addWorksheet(label);
      return ws;
    }, {});
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

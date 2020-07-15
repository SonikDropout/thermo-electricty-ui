const { Workbook } = require('excel4node');
const { getFileDate } = require('./others');
const path = require('path');

const files = {};

let wb = new Workbook();

let headerStyle = wb.createStyle({
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
headerStyle.border = generateBorders();

let dataStyle = wb.createStyle({
  alignment: {
    horizontal: 'right',
  },
});
dataStyle.border = generateBorders();

function createFile(fId, headers) {
  if (!files[fId]) files[fId] = {};
  files[fId].fileName = fId;
  files[fId].wb = new Workbook();
  files[fId].ws = files[fId].wb.addWorksheet('Результаты');
  if (!headerStyle) createStyles();
  for (let i = 0; i < headers.length; i++) {
    files[fId].ws
      .cell(1, i + 1)
      .string(headers[i])
      .style(headerStyle);
  }
  files[fId].row = 2;
}

function writeRow(fId, entries) {
  for (let i = 0; i < entries.length; i++) {
    files[fId].ws
      .cell(files[fId].row, i + 1)
      .number(entries[i])
      .style(dataStyle);
  }
  files[fId].row++;
}

function saveFile(fId, dir, cb) {
  files[fId].wb.write(
    path.join(dir, `${files[fId].fileName}_${getFileDate()}.xlsx`),
    cb
  );
}

function generateBorders() {
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

module.exports = {
  writeRow,
  createFile,
  saveFile,
};

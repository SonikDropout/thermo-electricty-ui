const path = require('path');
const ExcelJS = require('exceljs');
const { writeFile } = require('fs');

const files = {};
let fileIdx = 1;

function createFile(fId, headers) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Results');
  ws.columns = headers.map((header) => ({ header, width: header.length }));
  files[fId] = {
    name: fId,
    wb,
    ws,
  };
}

function writeRow(fId, entries) {
  files[fId].ws.addRow(entries);
}

function saveFile(fId, dir, cb) {
  stylizeSheet(files[fId].ws);
  files[fId].wb.xlsx
    .writeBuffer()
    .then((blob) =>
      writeFile(
        path.join(dir, `${files[fId].name}_${fileIdx++}.xlsx`),
        blob,
        cb
      )
    );
}

function stylizeSheet(ws) {
  var borderline = { style: 'thin' };
  var borderStyle = {
    top: borderline,
    left: borderline,
    bottom: borderline,
    right: borderline,
  };

  rows = ws.getRows(2, ws.rowCount - 1);
  rows.forEach((r) => {
    for (let c = 1; c <= ws.columnCount; c++) {
      let cell = r.getCell(c);
      cell.border = borderStyle;
      cell.font = { name: 'Arial', size: 10, bold: false };
    }
  });

  headerRow = ws.getRow(1);
  for (let c = 1; c <= ws.columnCount; c++) {
    let cell = headerRow.getCell(c);
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'darkVertical',
      fgColor: { argb: 'FFc0c0c0' },
    };
    cell.border = borderStyle;
  }
}

module.exports = {
  writeRow,
  createFile,
  saveFile,
};

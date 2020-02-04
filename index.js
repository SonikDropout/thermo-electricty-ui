const path = require('path');
const url = require('url');
const electron = require('electron');
const { app, BrowserWindow } = electron;

let win;

const mode = process.env.NODE_ENV;
const isPi = process.platform === 'linux' && process.arch === 'arm';

function reloadOnChange(win) {
  if (mode !== 'development' && mode !== 'test') return { close: () => {} };

  const watcher = require('chokidar').watch(path.join(__dirname, '**'), {
    ignoreInitial: true,
  });

  watcher.on('change', () => {
    win.reload();
  });

  return watcher;
}

function launch() {
  const screenArea = electron.screen.getPrimaryDisplay().workAreaSize;
  win = new BrowserWindow({
    width: isPi ? screenArea.width : 1024,
    height: isPi ? screenArea.height : 600,
    fullscreen: isPi,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, './static/index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  const watcher = reloadOnChange(win);

  win.on('closed', function() {
    win = null;
    watcher.close();
  });
}

app.on('ready', launch);

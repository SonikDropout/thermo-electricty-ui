const usbDetect = require('usb-detection');
const driveList = require('drivelist');
const EventEmitter = require('events');

const usbPort = new EventEmitter();

usbDetect.startMonitoring();
usbDetect.on('add', findDrive);
usbDetect.on('remove', handleRemove);

function findDrive() {
  driveList.list().then(drives => {
    const drive = drives.find(isSuitableDrive);
    if (drive) {
      usbPort.emit('add', drive.mountpoints[0].path);
    }
  })
}

function isSuitableDrive(drive) {
  return !drive.isSystem && drive.isUsb;
}

function handleRemove() {
  driveList.list().then(drives => {
    if (!drives.find(isSuitableDrive)) {
      usbPort.emit('remove');
    }
  })
}

module.exports = usbPort;

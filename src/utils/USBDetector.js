const usbDetect = require('usb-detection');
const driveList = require('drivelist');
const EventEmitter = require('events');

class USBDetector extends EventEmitter {
  constructor() {
    super();
    usbDetect.startMonitoring();
    usbDetect.find(this._handleFoundDevices.bind(this));
    this._listenAdd.bind(this)();
    this._listenRemove.bind(this)();
    this.stopMonitoring = usbDetect.stopMonitoring;
  }

  _handleFoundDevices(err, devices) {
    const suitableDevice = devices.find(this._isSuitableDevice);
    if (suitableDevice) {
      this._findDrive(suitableDevice);
    }
  }

  _listenAdd() {
    usbDetect.on('add', (device) => {
      if (this._isSuitableDevice(device)) {
        setTimeout(this._findDrive.bind(this), 300, device);
      }
    });
  }

  _listenRemove() {
    usbDetect.on('remove', (device) => {
      if (JSON.stringify(this.connectedStorage) === JSON.stringify(device)) {
        this.emit('remove');
        this.connectedStorage = null;
        this.storagePath = null;
      }
    });
  }

  _findDrive(device) {
    driveList.list().then((drives) => {
      const drive = drives.find(this._isSuitableDrive);
      if (drive) {
        this.connectedStorage = device;
        this.storagePath = drive.mountpoints[0].path;
        this.emit('connect', drive.mountpoints[0].path);
      } else console.error('Drive not found');
    });
  }

  _isSuitableDevice(device) {
    let name = device.deviceName.toLowerCase();
    return name.includes('storage') || name.includes('запоминающ');
  }

  _isSuitableDrive(drive) {
    return !drive.isSystem && drive.isUSB && drive.isRemovable;
  }
}

module.exports = new USBDetector();

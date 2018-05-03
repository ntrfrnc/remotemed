export default class AccDataProvider {
  constructor() {
    if (!window.DeviceOrientationEvent) {
      throw new Error('This device is not supported.');
    }

    this.name = 'acc';
    this.series = ['x', 'y', 'z'];
    this.dataType = 'float32';
    this.x = 0;
    this.y = 0;
    this.z = 0;

    this.updateOrientation = (e) => {
      this.x = e.beta;
      this.y = e.gamma;
      this.z = e.alpha;
    };
  }

  start() {
    window.addEventListener('deviceorientation', this.updateOrientation);
  }

  stop() {
    window.removeEventListener('deviceorientation', this.updateOrientation)
  }

  getData() {
    return [this.x, this.y, this.z];
  };
}

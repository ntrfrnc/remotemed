export default class AccDataProvider {
  constructor() {

    this.name = 'sin';
    this.series = ['value'];
    this.dataType = 'float32';
    // this.lastTime = new Date();
  }

  start() {

  }

  stop() {

  }

  getData() {
    // console.log(performance.now() - this.lastTime);
    // this.lastTime = performance.now();
    return [Math.sin(performance.now()/500*Math.PI)];
  };
}

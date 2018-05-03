module.exports = class DataPacket {
  constructor({
                id,
                data,
                type,
                nSeries
              }) {
    this.id = id !== void(0) ? id : 0;
    this.nSeries = nSeries !== void(0) ? nSeries : 1;
    this.dataType = type !== void(0) ? id : 'float32';

    if (data === void(0)) {
      this.data = [];
    } else if (data instanceof Buffer) {
      this.setFromBuffer(data);
    } else if (data instanceof ArrayBuffer) {
      this.setFromArrayBuffer(data);
    } else if (data instanceof Array) {
      this.data = data;
    } else {
      throw new Error('Given data type is not supported');
    }

    this.typeSize = {
      uint8: 1,
      int8: 1,
      uint16: 2,
      int16: 2,
      uint32: 4,
      int32: 4,
      float32: 4,
      float64: 8
    }
  }

  setFromArrayBuffer(buffer) {
    this.id = (new DataView(buffer)).getUint32(0);

    const dataArray = this.getTypedArray(buffer, this.dataType, 4);

    const data = [];

    for (let i = 0; i < dataArray.length; i += this.nSeries) {
      let sample = [];

      for (let j = 0; j < this.nSeries; j++) {
        sample.push(dataArray[i + j]);
      }

      data.push(sample);
    }

    this.data = data;

    return this;
  }

  setFromBuffer(buffer) {
    return this.setFromArrayBuffer(new Uint8Array(buffer).buffer);
  }

  toArrayBuffer() {
    const buffer = new ArrayBuffer(4 + this.typeSize[this.dataType] * this.data.length * this.nSeries);
    (new DataView(buffer)).setUint32(0, this.id);

    const dataArray = this.getTypedArray(buffer, this.dataType, 4);
    let k = 0;
    for (let i = 0; i < this.data.length; ++i) {
      for (let j = 0; j < this.nSeries; ++j) {
        dataArray[k++] = this.data[i][j];
      }
    }

    return buffer;
  }

  toBuffer() {
    return Buffer.from(this.toArrayBuffer());
  }

  toTimeSeries(startTime, samplingFrequency) {
    if (this.data.length < 1) {
      return [[]];
    }

    const period = 1 / samplingFrequency * 1000;
    const packetOffset = this.data.length * this.id * period;
    const startPacketTime = new Date(startTime.getTime() + packetOffset);

    const timeSeries = [];

    for (let i = 0; i < this.data.length; ++i) {
      let sample = [new Date(startPacketTime.getTime() + period * i)];

      for (let j = 0; j < this.nSeries; ++j) {
        sample.push(this.data[i][j]);
      }

      timeSeries.push(sample);
    }

    return timeSeries;
  }

  pushData(sample) {
    this.data.push(sample);
  }

  concatData(part) {
    Array.prototype.push.apply(this.data, part);
  }

  getTypedArray(buffer, type, offset) {
    switch (type) {
      case 'uint8':
        return new Uint8Array(buffer, offset);
      case 'int8':
        return new Int8Array(buffer, offset);
      case 'uint16':
        return new Uint16Array(buffer, offset);
      case 'int16':
        return new Int16Array(buffer, offset);
      case 'uint32':
        return new Uint32Array(buffer, offset);
      case 'int32':
        return new Int32Array(buffer, offset);
      case 'float32':
        return new Float32Array(buffer, offset);
      case 'float64':
        return new Float64Array(buffer, offset);
    }
  }
};

const DataPacket = require('../../utils/DataPacket');

export default class StreamingHandler {
  constructor({
                dataProvider,
                samplingFrequency,
                aggregationTime,
                onStreaming,
                onStreamingOn,
                onStreamingOff
              }) {
    this.ws = null;
    this.dataProvider = dataProvider;
    this.sf = samplingFrequency;
    this.aggTime = aggregationTime;
    this.interval = null;
    this.onStreaming = onStreaming;
    this.onStreamingOn = onStreamingOn;
    this.onStreamingOff = onStreamingOff;
    this.startTime = null;
    this.inProgress = false;

    if (this.dataProvider) {
      this.seriesLength = this.dataProvider.series.length;
    }
    this.samplePeriod = 1 / this.sf * 1000;
    this.packetLength = Math.ceil(this.aggTime / this.samplePeriod);

    return this;
  }

  setDataProvider(provider) {
    this.dataProvider = provider;
    this.seriesLength = this.dataProvider.series.length;
  }

  turnStreamingOn({name}) {
    if (typeof this.onStreamingOn === 'function') {
      this.onStreamingOn(this);
    }

    try {
      this.ws = new WebSocket(window.location.toString().replace(/^https?/, 'ws'));
    } catch (e) {
      console.log(e);
    }

    this.ws.onopen = e => {
      this.ws.send(JSON.stringify({
        cmd: 'new',
        name: name,
        dataType: this.dataProvider.dataType,
        sf: this.sf,
        type: this.dataProvider.name,
        series: this.dataProvider.series,
      }));
    };

    return new Promise((resolve, reject) => {
      this.ws.onmessage = e => {
        const msg = JSON.parse(e.data);

        switch (msg.cmd) {
          case 'start':
            const startTime = this.startStreaming();
            resolve({startTime, msg});
            break;
        }
      };
    });
  }

  turnStreamingOff() {
    this.inProgress = false;
    clearInterval(this.interval);
    this.dataProvider.stop();
    this.ws.close();

    if (typeof this.onStreamingOff === 'function') {
      this.onStreamingOff(this);
    }
  }

  startStreaming() {
    this.inProgress = true;
    this.dataProvider.start();
    let i = 1;
    let packetID = 0;
    let packet = new DataPacket({
      id: packetID,
      nSeries: this.seriesLength,
      dataType: this.dataProvider.dataType
    });

    this.startTime = new Date();

    this.interval = setInterval(() => {
      const data = this.dataProvider.getData();
      packet.pushData(data);
      ++i;

      if (i > this.packetLength) {
        const p = packet;
        setTimeout(() => { // Make this asynchronous to not slow down interval
          this.ws.send(p.toArrayBuffer());

          if (this.onStreaming) {
            this.onStreaming(this, p);
          }
        }, 0);

        i = 1;

        packet = new DataPacket({
          id: ++packetID,
          nSeries: this.dataProvider.series.length,
          dataType: this.dataProvider.dataType
        });
      }
    }, this.samplePeriod);

    return this.startTime;
  }
}

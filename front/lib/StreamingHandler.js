const DataPacket = require('../../utils/DataPacket');

export default class StreamingHandler {
  constructor({
                dataProvider,
                samplingFrequency,
                aggregationTime,
                onStreaming
              }) {
    this.ws = null;
    this.dataProvider = dataProvider;
    this.sf = samplingFrequency;
    this.aggTime = aggregationTime;
    this.interval = null;
    this.onStreaming = onStreaming;
    this.startTime = null;
    this.inProgress = false;

    this.seriesLength = this.dataProvider.series.length;
    this.samplePeriod = 1 / this.sf * 1000;
    this.packetLength = Math.ceil(this.aggTime / this.samplePeriod);

    return this;
  }

  turnStreamingOn({name}) {
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
        this.ws.send(packet.toArrayBuffer());

        i = 1;

        if (this.onStreaming) {
          this.onStreaming(this, packet);
        }

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

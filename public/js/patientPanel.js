(function () {
  async function onDoctorChange(e) {
    const select = e.target;
    select.disabled = true;
    const doctorID = select.options[select.selectedIndex].value;

    try {
      await fetch(window.location.toString(), {
        method: "POST",
        headers: new Headers({
          'Content-Type': 'application/json'
        }),
        credentials: "include",
        body: JSON.stringify({
          command: 'setDoctorForPatient',
          doctorID: doctorID
        })
      });
    } catch (e) {
      alert(e.message);
    }

    select.disabled = false;
  }

  class accDataProvider {
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

    getTypedArray(length) {
      return new Float32Array(length);
    }
  }

  class streamingHandler {
    constructor({
                  toggler,
                  dataProvider,
                  samplingFrequency,
                  aggregationTime
                }) {
      this.ws = null;
      this.dataProvider = dataProvider;
      this.sf = samplingFrequency;
      this.aggTime = aggregationTime;
      this.interval = null;

      this.seriesLength = this.dataProvider.series.length;
      this.samplePeriod = 1 / this.sf * 1000;
      this.packetLength = Math.floor(this.aggTime / this.samplePeriod) * this.dataProvider.series.length;

      toggler.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.turnStreamingOn();
        } else {
          this.turnStreamingOff();
        }
      });

      return this;
    }

    turnStreamingOn() {
      try {
        this.ws = new WebSocket(window.location.toString().replace(/^https?/, 'ws'));
      } catch (e) {
        console.log(e);
      }

      this.ws.onopen = e => {
        this.ws.send(JSON.stringify({
          cmd: 'new',
          dataType: this.dataProvider.dataType,
          sf: this.sf,
          type: this.dataProvider.name,
          series: this.dataProvider.series,
        }));
      };

      this.ws.onmessage = e => {
        const msg = JSON.parse(e.data);

        switch (msg.cmd) {
          case 'start':
            this.startStreaming();
            break;
        }
      };
    }

    turnStreamingOff() {
      clearInterval(this.interval);
      this.dataProvider.stop();
      this.ws.close();
    }

    startStreaming() {
      this.dataProvider.start();
      let packet = this.dataProvider.getTypedArray(this.packetLength);
      let i = 0;

      this.interval = setInterval(() => {
        let data = this.dataProvider.getData();

        for (let j = 0; j < this.seriesLength; j++) {
          packet[i++] = data[j];
        }

        if (i > this.packetLength) {
          this.ws.send(packet);
          packet = this.dataProvider.getTypedArray(this.packetLength);
          i = 0;
        }
      }, this.samplePeriod);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Handle doctor change
    const doctorSelect = document.getElementById('doctorSelect');
    doctorSelect.addEventListener('change', onDoctorChange);

    // Handle streaming toggle
    const streamingToggle = document.getElementById('streamingToggle');
    const strHandler = new streamingHandler({
      toggler: streamingToggle,
      dataProvider: new accDataProvider(),
      samplingFrequency: 10,
      aggregationTime: 1000
    });
  });
})();
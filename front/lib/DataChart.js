import * as echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/toolbox';
import 'echarts/lib/component/dataZoom';

export default class DataChart {
  constructor({
                chartWrapper
              }) {
    this.data = [];

    this.chart = echarts.init(chartWrapper);
    this.lastSeries = null;

    this.options = {
      toolbox: {
        right: 25,
        size: 16,
        feature: {
          dataZoom: {
            title: {
              zoom: 'Zoom',
              back: 'Back'
            }
          },
          restore: {
            title: 'Reset'
          },
          saveAsImage: {
            title: 'Save',
            type: 'png'
          },
          dataView: {
            title: 'Data',
            lang: ['Data view', 'Turn off', 'Refresh']
          }
        },
      },
      dataZoom: [{
        type: 'inside',
        start: 0,
        end: 100
      }, {
        type: 'slider',
        start: 0,
        end: 100,
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '80%',
        handleStyle: {
          color: '#333',
        },
        showDetail: false
      }],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          animation: false,
          label: {
            formatter: function (params) {
              const d = new Date(params.value);
              return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`;
            }
          }
        }
      },
      grid: {
        left: 25,
        right: 25,
        bottom: 60
      },
      xAxis: {
        type: 'time',
        splitLine: {
          show: false
        },
        axisLine: {
          onZero: false
        }
      },
      yAxis: {
        type: 'value',
        axisTick: {
          inside: true
        },
        axisLabel: {
          inside: true,
          formatter: '{value}\n'
        },
        boundaryGap: [0, '100%'],
        splitLine: {
          show: false
        }
      }
    };

    this.chart.setOption(this.options);
  }

  areArraysEqual(a, b) {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }

    return true;
  }

  setSeries(series) {
    if (this.lastSeries && this.areArraysEqual(this.lastSeries, series)) {
      return;
    }

    this.lastSeries = series;
    const seriesList = [];

    for (let i = 0; i < series.length; ++i) {
      seriesList.push({
        name: series[i],
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        encode: {
          x: [0],
          y: [i + 1]
        }
      });
    }

    this.chart.setOption(Object.assign({
      series: seriesList
    }, this.options), true);
  }

  setData(data) {
    this.data = data;

    this.chart.setOption({
      dataset: {
        source: data
      }
    });
  }

  pushData(part) {
    this.data.push(part);

    this.setData(this.data);
  }

  concatData(part) {
    Array.prototype.push.apply(this.data, part);

    this.setData(this.data);
  }

  clear(dataVessel) {
    this.setData([[]]);
    this.data = dataVessel || [];
  }
}

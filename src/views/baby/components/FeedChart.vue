<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        console.log('chart 接受到的val 为----', val)
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      console.log('linechart 里面', this.chartData)
      this.setOptions(this.chartData)
    },
    setOptions({ xAxisData,lowData,highData, actualData,titleText,yMin } = {}) {
      this.chart.setOption({
        title: {
          text: titleText,
          // subtext: 'Fake Data'
        },
       

        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {}
          }
        },

        xAxis: {
          type: 'category',
          data:xAxisData,

          // data: xAxisData,
          boundaryGap: false,
          // axisTick: {
          //   show: false
          // }
        },

        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 50,
          containLabel: true
        },

        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}ml'
          },
          axisPointer: {
            snap: true
          },
          min:yMin,
          // axisTick: {
          //   show: false
          // }
        },

        legend: {
          data: ['low', 'high', 'actual']
        },

        series: [
          {
            name: 'low',
           
            itemStyle: {
              normal: {
                color: '#FF005A',
                lineStyle: {
                  color: '#FF005A',
                  width: 2
                }
              }
            },
            smooth: true,
            type: 'line',
            data: lowData,
       
            animationDuration: 2800,
            animationEasing: 'cubicInOut'
          },
          {
            name: 'high', itemStyle: {
              normal: {
                color: '#FF005A',
                lineStyle: {
                  color: '#FF005A',
                  width: 2
                }
              }
            },
        
            smooth: true,
            type: 'line',
            data: highData,
       
            animationDuration: 2800,
            animationEasing: 'cubicInOut'
          },
          {
            name: 'actual',
            smooth: true,
            type: 'line',
            symbolSize:10,
            itemStyle: {
              normal: {
                color: '#3888fa',
                lineStyle: {
                  color: '#3888fa',
                  width: 2
                },
                areaStyle: {
                  color: '#f3f8ff'
                }
              }
            },
            data: actualData,
       
            animationDuration: 2800,
            animationEasing: 'quadraticOut'
          }]
      })
    }
  }
}
</script>

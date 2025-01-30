<template>
  <el-row :gutter="10" class="panel-group">
    <el-col :xs="24" :sm="12" :lg="12" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('milkVolumes')">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="babygirl" class-name="card-panel-icon" />
        </div>

        <div class="card-panel-description">
          <div class="card-panel-text">
            参考量
          </div>
          <label class="card-panel-num">{{ basicInfo.refermilkVolumes }} ml</label>
        </div>

        <div class="card-panel-description">
          <div class="card-panel-text">
            奶量
          </div>
          <label class="card-panel-num">{{ basicInfoText.milkVolumes }} ml</label>

        </div>

      </div>
    </el-col>

  </el-row>
</template>

<script>

export default {
  components: {

  },
  props: {
    basicInfo: {
      type: Object,
      require: true
    }
  },

  data() {
    return {
      basicInfoText: {
        milkVolumes: 800,
        refermilkVolumes: '800-1000',
       
      }
    }
  },
  watch: {
    basicInfo(newVal) {
      console.log('hahaha basicinfo ', newVal)
      this.basicInfoText = newVal
    }
  },
  methods: {
    handleSetLineChartData(type) {
      this.$emit('handleSetLineChartData', type)
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 12px;

  .card-panel-col {
    margin-bottom: 12px;

  }

  .card-panel {
    height: 90px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 12px 0 0 12px;
      padding: 12px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 50px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 12px;
      margin-left: 10px;

      .card-panel-text {
        line-height: 40px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 10px;
      }

      .card-panel-num {
        font-size: 16px;
      }
    }
  }
}

@media (max-width:200px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 30%;
    height: 50%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>

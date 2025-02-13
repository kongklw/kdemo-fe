<template>
  <el-row :gutter="10" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleNavigate('BreastFeed')">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="babygirl" class-name="card-panel-icon" />
        </div>

        <div class="card-panel-description">
          <div class="card-panel-text">
            奶量
          </div>
          <label class="card-panel-num">{{ basicInfoText.total_milk_volumes }} ml</label>

        </div>

      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleNavigate('Temperature')">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="bodyTemperature" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            体温
          </div>
          <label class="card-panel-num">{{ basicInfoText.current_temperature }}</label>
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleNavigate('BabyPants')">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="babyPants" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            尿不湿
          </div>
          <label class="card-panel-num">{{ basicInfoText.babyPantsCount }} 个</label>
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleNavigate('Sleep')">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="sleep2" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            睡眠
          </div>
          <label class="card-panel-num">记录</label>
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleNavigate('Expense')">
        <div class="card-panel-icon-wrapper icon-money">
          <svg-icon icon-class="money" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            花费
          </div>
          <label class="card-panel-num">{{ basicInfoText.total_amount }}</label>
          <!-- <count-to :start-val="0" :end-val="9280" :duration="3200" class="card-panel-num" /> -->
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleNavigate('Analysis')">
        <div class="card-panel-icon-wrapper icon-money">
          <svg-icon icon-class="data-analysis" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            分析
          </div>
          <!-- <label class="card-panel-num">Feature Analysis</label> -->
          <!-- <count-to :start-val="0" :end-val="9280" :duration="3200" class="card-panel-num" /> -->
        </div>
      </div>
    </el-col>


    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleNavigate('Langchain')">
        <div class="card-panel-icon-wrapper icon-money">
          <svg-icon icon-class="langchain" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            langchain
          </div>
          <label class="card-panel-num">chatbot</label>
          <!-- <count-to :start-val="0" :end-val="9280" :duration="3200" class="card-panel-num" /> -->
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
      basicInfoText: { total_milk_volumes: 0, total_amount: 0, current_temperature: '', babyPantsCount: 0 }
    }
  },
  watch: {
    basicInfo(newVal) {
      console.log('hahaha basicinfo ', newVal)
      this.basicInfoText = newVal
    }
  },
  methods: {
    handleNavigate(type) {
      this.$emit('handleNavigate', type)
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
    font-size: 10px;
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
      margin: 20px 0 0 12px;
      // padding: 12px;
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
      margin:12px;
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
    width: 50%;
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

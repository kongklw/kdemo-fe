<template>
  <div class="mobile-babypants">
    <!-- Navbar -->
    <van-nav-bar
      title="尿不湿记录"
      left-text="返回"
      left-arrow
      fixed
      placeholder
      @click-left="onClickLeft"
    >
      <template #right>
        <van-icon name="plus" size="18" @click="openAddDialog" />
      </template>
    </van-nav-bar>

    <!-- Date Filter -->
    <div class="filter-bar">
      <div class="date-selector" @click="showDatePicker = true">
        <van-icon name="calendar-o" />
        <span>{{ currentDateText }}</span>
        <van-icon name="arrow-down" size="12" style="margin-left: 4px;" />
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-card">
      <div class="stat-item">
        <div class="stat-label">今日更换</div>
        <div class="stat-value">{{ babyPantsCount }} <span class="unit">个</span></div>
      </div>
    </div>

    <!-- List -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div v-if="list.length === 0 && !loading" class="empty-state">
          <van-empty description="暂无记录" />
        </div>
        <van-cell-group v-else inset class="list-group">
          <van-swipe-cell v-for="item in list" :key="item.id" class="list-item">
            <van-cell center>
              <template #title>
                <div class="cell-title">
                  <span class="time">{{ formatTime(item.use_date) }}</span>
                  <van-tag type="success" size="medium" class="status-tag">{{ item.status }}</van-tag>
                </div>
              </template>
              <template #label>
                <div class="cell-desc">
                  <div v-if="item.peeing">嘘嘘: {{ item.peeing }}</div>
                  <div v-if="item.stool">大便: {{ item.stool }}</div>
                  <div v-if="item.describe">备注: {{ item.describe }}</div>
                </div>
              </template>
            </van-cell>
            <template #right>
              <van-button square text="删除" type="danger" class="action-button" @click="handleDelete(item)" />
            </template>
          </van-swipe-cell>
        </van-cell-group>
      </van-list>
    </van-pull-refresh>

    <!-- Date Picker -->
    <van-popup v-model="showDatePicker" position="bottom">
      <van-datetime-picker
        v-model="currentDate"
        type="date"
        title="选择日期"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onConfirmDate"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- Add Dialog -->
    <van-popup v-model="showAddDialog" position="bottom" :style="{ height: '80%' }" round>
      <div class="add-dialog-content">
        <van-nav-bar
          title="更换尿不湿"
          left-text="取消"
          right-text="保存"
          @click-left="showAddDialog = false"
          @click-right="saveRecord"
        />
        <div class="form-content">
          <van-form ref="pantsForm">
            <van-field
              readonly
              clickable
              name="datetime"
              :value="form.use_date"
              label="时间"
              placeholder="点击选择时间"
              @click="showTimePicker = true"
            />

            <van-field name="brand" label="品牌">
              <template #input>
                <van-radio-group v-model="form.brand" direction="horizontal">
                  <van-radio v-for="item in babyPantsoptions" :key="item.value" :name="item.value" style="margin-bottom: 8px;">{{ item.label }}</van-radio>
                </van-radio-group>
              </template>
            </van-field>

            <van-field name="leaked" label="侧漏">
              <template #input>
                <van-radio-group v-model="form.is_leaked" direction="horizontal">
                  <van-radio :name="true">是</van-radio>
                  <van-radio :name="false">否</van-radio>
                </van-radio-group>
              </template>
            </van-field>

            <van-divider>状态详情</van-divider>

            <van-tabs v-model="form.tabActiveName" type="card" class="status-tabs">
              <van-tab title="嘘嘘" name="peeing">
                <div class="tab-content">
                  <van-field name="peeingColor" label="颜色">
                    <template #input>
                      <van-radio-group v-model="form.peeing_color" direction="horizontal">
                        <van-radio v-for="item in peeingColorOptions" :key="item.value" :name="item.value" class="radio-item">{{ item.label }}</van-radio>
                      </van-radio-group>
                    </template>
                  </van-field>
                </div>
              </van-tab>
              <van-tab title="便便" name="stool">
                <div class="tab-content">
                  <van-field name="stoolShape" label="形状">
                    <template #input>
                      <van-checkbox-group v-model="form.stool_shape_list" direction="horizontal">
                        <van-checkbox v-for="item in stoolShapeOptions" :key="item.value" :name="item.value" shape="square" class="checkbox-item">{{ item.label }}</van-checkbox>
                      </van-checkbox-group>
                    </template>
                  </van-field>
                  <van-field name="stoolColor" label="颜色">
                    <template #input>
                      <van-radio-group v-model="form.stool_color" direction="horizontal">
                        <van-radio v-for="item in stoolColorOptions" :key="item.value" :name="item.value" class="radio-item">{{ item.label }}</van-radio>
                      </van-radio-group>
                    </template>
                  </van-field>
                </div>
              </van-tab>
              <van-tab title="混合" name="peeing-stool">
                <div class="tab-content">
                  <van-field name="peeingColor" label="嘘嘘颜色">
                    <template #input>
                      <van-radio-group v-model="form.peeing_color" direction="horizontal">
                        <van-radio v-for="item in peeingColorOptions" :key="item.value" :name="item.value" class="radio-item">{{ item.label }}</van-radio>
                      </van-radio-group>
                    </template>
                  </van-field>
                  <van-field name="stoolShape" label="便便形状">
                    <template #input>
                      <van-checkbox-group v-model="form.stool_shape_list" direction="horizontal">
                        <van-checkbox v-for="item in stoolShapeOptions" :key="item.value" :name="item.value" shape="square" class="checkbox-item">{{ item.label }}</van-checkbox>
                      </van-checkbox-group>
                    </template>
                  </van-field>
                  <van-field name="stoolColor" label="便便颜色">
                    <template #input>
                      <van-radio-group v-model="form.stool_color" direction="horizontal">
                        <van-radio v-for="item in stoolColorOptions" :key="item.value" :name="item.value" class="radio-item">{{ item.label }}</van-radio>
                      </van-radio-group>
                    </template>
                  </van-field>
                </div>
              </van-tab>
              <van-tab title="干爽" name="dry">
                <div class="tab-content empty-tab">
                  <span class="empty-text">干爽状态无需额外记录</span>
                </div>
              </van-tab>
            </van-tabs>

            <van-field
              v-model="form.describe"
              rows="2"
              autosize
              label="备注"
              type="textarea"
              placeholder="请输入备注"
              style="margin-top: 10px;"
            />
          </van-form>
        </div>
      </div>
    </van-popup>

    <!-- Time Picker for Form -->
    <van-popup v-model="showTimePicker" position="bottom">
      <van-datetime-picker
        v-model="formDate"
        type="datetime"
        title="选择时间"
        @confirm="onConfirmFormTime"
        @cancel="showTimePicker = false"
      />
    </van-popup>

  </div>
</template>

<script>
import { addBabyPantsReq, babyPantsListReq, deleteBabyPantsReq } from '@/api/baby'
import moment from 'moment'
import { Toast, Dialog } from 'vant'

export default {
  name: 'MobileBabyPants',
  data() {
    return {
      list: [],
      babyPantsCount: 0,
      loading: false,
      finished: false,
      refreshing: false,

      currentDate: new Date(),
      showDatePicker: false,
      minDate: new Date(2020, 0, 1),
      maxDate: new Date(2030, 11, 31),

      // Pagination
      page: 1,
      pageSize: 20,

      // Add
      showAddDialog: false,
      showTimePicker: false,
      formDate: new Date(),
      form: {
        use_date: '',
        peeing_color: '正常',
        describe: '',
        stool_shape_list: ['膏状'],
        stool_color: '黄色',
        is_leaked: false,
        brand: 'whatever',
        tabActiveName: 'peeing'
      },

      peeingColorOptions: [
        { value: '乳白色', label: '乳白色' },
        { value: '粉色', label: '粉色' },
        { value: '正常', label: '正常' },
        { value: '黄色', label: '黄色' },
        { value: '红色', label: '红色' },
        { value: '浓茶色', label: '浓茶色' }
      ],
      stoolColorOptions: [
        { value: '墨绿色', label: '墨绿色' },
        { value: '绿色', label: '绿色' },
        { value: '黄色', label: '黄色' },
        { value: '棕色', label: '棕色' },
        { value: '红色', label: '红色' },
        { value: '黑色', label: '黑色' },
        { value: '灰白色', label: '灰白色' }
      ],
      stoolShapeOptions: [
        { value: '膏状', label: '膏状' },
        { value: '泡沫样', label: '泡沫样' },
        { value: '有奶瓣', label: '有奶瓣' },
        { value: '有食物残渣', label: '有食物残渣' },
        { value: '蛋花样', label: '蛋花样' },
        { value: '水样便', label: '水样便' },
        { value: '羊屎便', label: '羊屎便' },
        { value: '含血便', label: '含血便' }
      ],
      babyPantsoptions: [
        { value: 'whatever', label: 'whatever' },
        { value: '好奇', label: '好奇' },
        { value: '帮宝适', label: '帮宝适' },
        { value: '龙猫', label: '龙猫' },
        { value: '路安视', label: '路安视' },
        { value: 'BabyCare', label: 'BabyCare' }
      ]
    }
  },
  computed: {
    currentDateText() {
      return moment(this.currentDate).format('YYYY-MM-DD')
    }
  },
  methods: {
    onClickLeft() {
      this.$router.push('/mobile/home')
    },
    formatTime(time) {
      if (!time) return ''
      return moment(time).format('HH:mm')
    },
    async onLoad() {
      if (this.refreshing) {
        this.page = 1
        this.list = []
        this.refreshing = false
      }

      const use_date = moment(this.currentDate).format('YYYY-MM-DD')

      try {
        const res = await babyPantsListReq({
          use_date: use_date,
          page: this.page,
          page_size: this.pageSize
        })
        if (res.code === 200) {
          const results = res.data.results || []
          this.babyPantsCount = res.data.count || 0
          if (this.page === 1) {
            this.list = results
          } else {
            this.list = [...this.list, ...results]
          }

          if (results.length < this.pageSize) {
            this.finished = true
          } else {
            this.page++
          }
        }
      } catch (error) {
        console.error(error)
        this.finished = true
      } finally {
        this.loading = false
      }
    },
    onRefresh() {
      this.finished = false
      this.loading = true
      this.onLoad()
    },
    onConfirmDate(value) {
      this.currentDate = value
      this.showDatePicker = false
      this.onRefresh()
    },
    openAddDialog() {
      this.form.use_date = moment().format('YYYY-MM-DD HH:mm:00')
      this.formDate = new Date()
      // Reset defaults if needed
      this.showAddDialog = true
    },
    onConfirmFormTime(value) {
      this.form.use_date = moment(value).format('YYYY-MM-DD HH:mm:ss')
      this.showTimePicker = false
    },
    async saveRecord() {
      if (!this.form.use_date) {
        Toast('请填写时间')
        return
      }

      try {
        const res = await addBabyPantsReq(this.form)
        if (res.code === 200) {
          Toast.success('添加成功')
          this.showAddDialog = false
          this.onRefresh()
        } else {
          Toast.fail(res.msg || '添加失败')
        }
      } catch (error) {
        console.error(error)
        Toast.fail('添加失败')
      }
    },
    handleDelete(item) {
      Dialog.confirm({
        title: '提示',
        message: '确认删除该记录吗？'
      })
        .then(async() => {
          try {
            const res = await deleteBabyPantsReq(item)
            if (res.code === 200) {
              Toast.success('删除成功')
              this.onRefresh()
            } else {
              Toast.fail(res.msg || '删除失败')
            }
          } catch (error) {
            console.error(error)
            Toast.fail('删除失败')
          }
        })
        .catch(() => {
          // on cancel
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.mobile-babypants {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}

.filter-bar {
  background: #fff;
  padding: 10px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 99; /* Below Navbar */
}

.date-selector {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  padding: 6px 12px;
  background: #f0f2f5;
  border-radius: 16px;

  .van-icon {
    margin-right: 6px;
  }
}

.stats-card {
  margin: 12px 16px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);

  .stat-item {
    text-align: center;

    .stat-label {
      font-size: 12px;
      color: #999;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 20px;
      font-weight: bold;
      color: #333;

      .unit {
        font-size: 12px;
        font-weight: normal;
        color: #666;
      }
    }
  }
}

.list-group {
  margin-top: 10px;
}

.list-item {
  margin-bottom: 1px;
}

.cell-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.time {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.status-tag {
  font-weight: bold;
}

.cell-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.action-button {
  height: 100%;
}

.add-dialog-content {
  background-color: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 20px;
}

.status-tabs {
    margin-top: 10px;
}

.tab-content {
    padding: 16px 0;
}

.empty-tab {
    text-align: center;
    padding: 20px 0;
}

.empty-text {
    color: #999;
    font-size: 14px;
}

.radio-item, .checkbox-item {
    margin-bottom: 8px;
    margin-right: 8px;
}
</style>

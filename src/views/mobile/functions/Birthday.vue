<template>
  <div class="mobile-birthday">
    <van-nav-bar title="生日" left-text="返回" left-arrow fixed placeholder @click-left="onBack">
      <template #right>
        <van-icon name="plus" size="18" @click="openAddDialog" />
      </template>
    </van-nav-bar>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div v-if="list.length === 0 && !loading" class="empty-state">
        <van-empty description="暂无记录" />
      </div>
      <van-cell-group v-else inset class="list-group">
        <van-swipe-cell v-for="item in list" :key="item.id" class="list-item">
          <van-cell center>
            <template #title>
              <div class="cell-title">
                <div class="name">
                  <span class="name-text">{{ item.name }}</span>
                  <van-tag v-if="item.calendar_type === 'lunar'" type="primary" size="medium" class="tag">农历</van-tag>
                  <van-tag v-else type="success" size="medium" class="tag">阳历</van-tag>
                </div>
              </div>
            </template>
            <template #label>
              <div class="cell-desc">
                <span v-if="item.calendar_type === 'lunar'">生日：{{ formatLunar(item) }}</span>
                <span v-else>生日：{{ formatSolar(item) }}</span>
                <span v-if="item.relation" class="sep">·</span>
                <span v-if="item.relation">{{ item.relation }}</span>
              </div>
              <div v-if="item.next_birthday_date" class="cell-next">
                下次：{{ item.next_birthday_date }}（还有 {{ item.next_birthday_in_days }} 天）
              </div>
            </template>
          </van-cell>
          <template #right>
            <van-button square text="删除" type="danger" class="action-button" @click="handleDelete(item)" />
          </template>
        </van-swipe-cell>
      </van-cell-group>
    </van-pull-refresh>

    <van-popup v-model="showAddDialog" position="bottom" :style="{ height: '58%' }" round>
      <div class="add-dialog-content">
        <van-nav-bar
          title="添加生日"
          left-text="取消"
          right-text="保存"
          @click-left="showAddDialog = false"
          @click-right="saveRecord"
        />
        <div class="form-content">
          <van-form>
            <van-field v-model="form.name" label="姓名" placeholder="请输入姓名" />
            <van-field v-model="form.relation" label="关系" placeholder="例如：妈妈/朋友" />

            <van-cell center title="日期类型">
              <template #right-icon>
                <div class="type-switch">
                  <span class="type-label" :class="{ on: isLunar }">农历</span>
                  <van-switch v-model="isLunar" size="22px" active-color="#ff7a9a" />
                  <span class="type-label" :class="{ on: !isLunar }">阳历</span>
                </div>
              </template>
            </van-cell>

            <van-field
              readonly
              clickable
              label="生日"
              :value="birthdayDisplay"
              placeholder="点击选择日期"
              @click="openDatePicker"
            />

            <van-cell v-if="isLunar" center title="闰月">
              <template #right-icon>
                <van-switch v-model="form.lunar_is_leap" size="20px" active-color="#ff7a9a" />
              </template>
            </van-cell>
          </van-form>
        </div>
      </div>
    </van-popup>

    <van-popup v-model="showLunarPicker" position="bottom" round>
      <van-picker
        show-toolbar
        title="选择农历生日"
        :columns="lunarColumns"
        @confirm="onConfirmLunar"
        @cancel="showLunarPicker = false"
      />
    </van-popup>

    <van-popup v-model="showSolarPicker" position="bottom">
      <van-datetime-picker
        v-model="formSolarDate"
        type="date"
        title="选择阳历日期"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onConfirmSolar"
        @cancel="showSolarPicker = false"
      />
    </van-popup>
  </div>
</template>

<script>
import moment from 'moment'
import { Toast, Dialog } from 'vant'
import { getBirthdayListReq, addBirthdayReq, deleteBirthdayReq } from '@/api/baby'

export default {
  name: 'MobileBirthday',
  data() {
    return {
      list: [],
      loading: false,
      refreshing: false,

      showAddDialog: false,
      showLunarPicker: false,
      showSolarPicker: false,

      isLunar: true,
      form: {
        name: '',
        relation: '',
        lunar_year: new Date().getFullYear(),
        lunar_month: 1,
        lunar_day: 1,
        lunar_is_leap: false,
        solar_date: ''
      },

      formSolarDate: new Date(),
      minDate: new Date(1900, 0, 1),
      maxDate: new Date(2100, 11, 31)
    }
  },
  computed: {
    lunarColumns() {
      const currentYear = new Date().getFullYear()
      const years = Array.from({ length: 201 }, (_, i) => `${1900 + i}年`)
      const months = Array.from({ length: 12 }, (_, i) => `${i + 1}月`)
      const days = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
      return [
        { values: years, defaultIndex: Math.max(0, Math.min(200, (this.form.lunar_year || currentYear) - 1900)) },
        { values: months, defaultIndex: Math.max(0, Math.min(11, this.form.lunar_month - 1)) },
        { values: days, defaultIndex: Math.max(0, Math.min(29, this.form.lunar_day - 1)) }
      ]
    },
    birthdayDisplay() {
      if (this.isLunar) {
        const leapText = this.form.lunar_is_leap ? '闰' : ''
        return `${this.form.lunar_year}年${leapText}${this.form.lunar_month}月${this.form.lunar_day}日`
      }
      return this.form.solar_date || ''
    }
  },
  mounted() {
    this.fetchList()
  },
  methods: {
    onBack() {
      this.$router.back()
    },
    async fetchList() {
      this.loading = true
      try {
        const res = await getBirthdayListReq()
        if (res && res.code === 200) {
          this.list = Array.isArray(res.data) ? res.data : []
        } else {
          Toast(res?.msg || '加载失败')
        }
      } catch (e) {
        Toast('加载失败')
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },
    onRefresh() {
      this.fetchList()
    },
    openAddDialog() {
      this.isLunar = true
      this.form = {
        name: '',
        relation: '',
        lunar_year: new Date().getFullYear(),
        lunar_month: 1,
        lunar_day: 1,
        lunar_is_leap: false,
        solar_date: ''
      }
      this.formSolarDate = new Date()
      this.showAddDialog = true
    },
    openDatePicker() {
      if (this.isLunar) {
        this.showLunarPicker = true
      } else {
        this.showSolarPicker = true
      }
    },
    onConfirmLunar(values) {
      const year = parseInt(String(values[0]).replace('年', ''), 10)
      const month = parseInt(String(values[1]).replace('月', ''), 10)
      const day = parseInt(String(values[2]).replace('日', ''), 10)
      this.form.lunar_year = Number.isFinite(year) ? year : new Date().getFullYear()
      this.form.lunar_month = Number.isFinite(month) ? month : 1
      this.form.lunar_day = Number.isFinite(day) ? day : 1
      this.showLunarPicker = false
    },
    onConfirmSolar(val) {
      const d = moment(val).format('YYYY-MM-DD')
      this.form.solar_date = d
      this.showSolarPicker = false
    },
    formatLunar(item) {
      const leapText = item.lunar_is_leap ? '闰' : ''
      const y = item.lunar_year ? `${item.lunar_year}年` : ''
      return `${y}${leapText}${item.lunar_month}月${item.lunar_day}日`
    },
    formatSolar(item) {
      return item.solar_date
    },
    async saveRecord() {
      const name = (this.form.name || '').trim()
      if (!name) {
        Toast('请填写姓名')
        return
      }

      const payload = {
        name,
        relation: (this.form.relation || '').trim()
      }

      if (this.isLunar) {
        payload.calendar_type = 'lunar'
        payload.lunar_year = this.form.lunar_year
        payload.lunar_month = this.form.lunar_month
        payload.lunar_day = this.form.lunar_day
        payload.lunar_is_leap = this.form.lunar_is_leap
      } else {
        if (!this.form.solar_date) {
          Toast('请选择日期')
          return
        }
        payload.calendar_type = 'solar'
        payload.solar_date = this.form.solar_date
      }

      try {
        const res = await addBirthdayReq(payload)
        if (res && res.code === 200) {
          Toast('保存成功')
          this.showAddDialog = false
          this.fetchList()
        } else {
          Toast(res?.msg || '保存失败')
        }
      } catch (e) {
        Toast('保存失败')
      }
    },
    handleDelete(item) {
      Dialog.confirm({
        title: '删除记录',
        message: `确认删除「${item.name}」的生日记录吗？`
      }).then(async() => {
        try {
          const res = await deleteBirthdayReq(item.id)
          if (res && res.code === 200) {
            Toast('已删除')
            this.fetchList()
          } else {
            Toast(res?.msg || '删除失败')
          }
        } catch (e) {
          Toast('删除失败')
        }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.mobile-birthday {
  min-height: 100vh;
  background: #f7f8fa;
}
.empty-state {
  padding: 32px 12px;
}
.list-group {
  margin-top: 12px;
}
.cell-title .name {
  display: flex;
  align-items: center;
  gap: 8px;
}
.name-text {
  font-size: 15px;
  font-weight: 600;
  color: #1f2329;
}
.tag {
  transform: translateY(-1px);
}
.cell-desc {
  font-size: 12px;
  color: #646a73;
  line-height: 18px;
}
.cell-next {
  margin-top: 4px;
  font-size: 12px;
  color: #ff5a75;
}
.sep {
  margin: 0 6px;
}
.action-button {
  height: 100%;
}
.add-dialog-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.form-content {
  padding: 6px 12px 12px;
}
.type-switch {
  display: flex;
  align-items: center;
  gap: 8px;
}
.type-label {
  font-size: 12px;
  color: #8b949e;
}
.type-label.on {
  color: #1f2329;
  font-weight: 600;
}
</style>

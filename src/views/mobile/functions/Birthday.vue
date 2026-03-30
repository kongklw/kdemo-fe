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
              <div class="birthday-card" :class="item.calendar_type === 'lunar' ? 'theme-lunar' : 'theme-solar'">
                <div class="birthday-main">
                  <div class="line1">
                    <div class="line1-left">
                      <span class="name">{{ item.name }}</span>
                      <span v-if="item.relation" class="chip chip-muted">{{ item.relation }}</span>
                      <span class="chip chip-accent">{{ item.constellation || '-' }}</span>
                      <span v-if="item.age_text" class="chip chip-strong">{{ item.age_text }}</span>
                    </div>
                  </div>
                  <div class="line2">
                    <div class="date-item">
                      <span class="date-label">农历</span>
                      <span class="date-value">{{ item.lunar_date_iso || '-' }}</span>
                    </div>
                    <div class="date-item">
                      <span class="date-label">阳历</span>
                      <span class="date-value">{{ item.solar_date || '-' }}</span>
                    </div>
                  </div>
                  <div class="line3">
                    <span v-if="item.next_birthday_date" class="next">
                      <van-icon name="clock-o" class="next-icon" />
                      <span class="next-label">下次生日</span>
                      <span class="next-date">{{ item.next_birthday_date }}</span>
                      <span class="next-days">（还有{{ item.next_birthday_in_days }}天）</span>
                    </span>
                    <span v-else class="next">下次生日：-</span>
                  </div>
                </div>
                <div class="stamp-wrap">
                  <div class="stamp">
                    <div class="stamp-text">{{ item.calendar_type === 'lunar' ? '农历' : '阳历' }}</div>
                    <div class="stamp-sub">过生日</div>
                  </div>
                  <div class="edit-btn" @click.stop="openEditDialog(item)">
                    <van-icon name="edit" />
                  </div>
                </div>
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
          :title="form.id ? '编辑生日' : '添加生日'"
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
import { getBirthdayListReq, addBirthdayReq, updateBirthdayReq, deleteBirthdayReq } from '@/api/baby'

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
        id: null,
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
          const items = Array.isArray(res.data) ? res.data.slice() : []
          items.sort((a, b) => {
            const A = typeof a.next_birthday_in_days === 'number' ? a.next_birthday_in_days : Number.POSITIVE_INFINITY
            const B = typeof b.next_birthday_in_days === 'number' ? b.next_birthday_in_days : Number.POSITIVE_INFINITY
            if (A !== B) return A - B
            const ad = a.next_birthday_date || ''
            const bd = b.next_birthday_date || ''
            if (ad !== bd) return ad.localeCompare(bd)
            return (a.id || 0) - (b.id || 0)
          })
          this.list = items
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
        id: null,
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
    openEditDialog(item) {
      this.isLunar = item.calendar_type === 'lunar'
      this.form = {
        id: item.id,
        name: item.name || '',
        relation: item.relation || '',
        lunar_year: item.lunar_year || new Date().getFullYear(),
        lunar_month: item.lunar_month || 1,
        lunar_day: item.lunar_day || 1,
        lunar_is_leap: !!item.lunar_is_leap,
        solar_date: item.solar_date || ''
      }
      this.formSolarDate = item.solar_date ? new Date(item.solar_date) : new Date()
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
        id: this.form.id || undefined,
        name,
        relation: (this.form.relation || '').trim()
      }

      if (this.isLunar) {
        payload.calendar_type = 'lunar'
        if (!this.form.lunar_year) {
          Toast('请选择年份')
          return
        }
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
        const res = this.form.id ? await updateBirthdayReq(payload) : await addBirthdayReq(payload)
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
.birthday-card {
  --accent: #ff4d7d;
  --accent2: #ff9a4d;
  --accentSoft: rgba(255, 77, 125, 0.12);
  background:
    radial-gradient(120px 80px at 12% 18%, rgba(255, 77, 125, 0.18), rgba(255, 77, 125, 0) 60%),
    radial-gradient(140px 90px at 80% 10%, rgba(255, 154, 77, 0.18), rgba(255, 154, 77, 0) 60%),
    linear-gradient(180deg, #ffffff 0%, #fff7fb 100%);
  border-radius: 18px;
  padding: 14px 14px;
  box-shadow: 0 10px 26px rgba(31, 35, 41, 0.08);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  overflow: hidden;
}
.birthday-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 6px;
  border-radius: 4px;
  background: linear-gradient(180deg, rgba(255, 77, 125, 0.95), rgba(255, 154, 77, 0.55));
}
.birthday-card.theme-solar {
  --accent: #2a7bff;
  --accent2: #22c9c3;
  --accentSoft: rgba(42, 123, 255, 0.12);
  background:
    radial-gradient(120px 80px at 12% 18%, rgba(42, 123, 255, 0.18), rgba(42, 123, 255, 0) 60%),
    radial-gradient(140px 90px at 80% 10%, rgba(34, 201, 195, 0.16), rgba(34, 201, 195, 0) 60%),
    linear-gradient(180deg, #ffffff 0%, #f4fbff 100%);
}
.birthday-card.theme-solar::before {
  background: linear-gradient(180deg, rgba(42, 123, 255, 0.95), rgba(34, 201, 195, 0.60));
}
.birthday-main {
  flex: 1;
  min-width: 0;
  padding-left: 8px;
}
.line1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.line1-left {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.name {
  font-size: 16px;
  font-weight: 800;
  color: #1f2329;
  letter-spacing: 0.2px;
}
.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 18px;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
}
.chip-muted {
  color: #59606a;
  background: rgba(89, 96, 106, 0.10);
}
.chip-accent {
  color: var(--accent);
  background: var(--accentSoft);
  border: 1px solid rgba(255, 77, 125, 0.18);
}
.birthday-card.theme-solar .chip-accent {
  border-color: rgba(42, 123, 255, 0.18);
}
.chip-strong {
  color: #1f2329;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(31, 35, 41, 0.06);
  font-weight: 700;
}
.line2 {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.date-item {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.date-label {
  font-size: 11px;
  color: rgba(31, 35, 41, 0.55);
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(31, 35, 41, 0.05);
}
.date-value {
  font-size: 12px;
  color: #646a73;
  white-space: nowrap;
}
.line3 {
  margin-top: 10px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.next {
  white-space: nowrap;
  color: #1f2329;
}
.next-icon {
  margin-right: 4px;
  color: var(--accent);
}
.next-label {
  color: #8b949e;
  margin-right: 6px;
}
.next-date {
  color: var(--accent);
  font-weight: 700;
  margin-right: 6px;
}
.next-days {
  color: #646a73;
}
.stamp-wrap {
  position: relative;
  width: 92px;
  height: 72px;
  flex-shrink: 0;
}
.stamp {
  position: absolute;
  right: 0;
  top: 18px;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  border: 3px solid rgba(255, 77, 125, 0.28);
  color: var(--accent);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: rotate(-16deg);
  background:
    radial-gradient(20px 20px at 30% 26%, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0) 70%),
    linear-gradient(135deg, rgba(255, 77, 125, 0.12) 0%, rgba(255, 154, 77, 0.10) 100%);
}
.birthday-card.theme-solar .stamp {
  border-color: rgba(42, 123, 255, 0.28);
  background:
    radial-gradient(20px 20px at 30% 26%, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0) 70%),
    linear-gradient(135deg, rgba(42, 123, 255, 0.12) 0%, rgba(34, 201, 195, 0.10) 100%);
}
.stamp::after {
  content: '';
  position: absolute;
  inset: 7px;
  border-radius: 50%;
  border: 1px dashed rgba(255, 77, 125, 0.30);
}
.birthday-card.theme-solar .stamp::after {
  border-color: rgba(42, 123, 255, 0.30);
}
.stamp-text {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
}
.stamp-sub {
  font-size: 10px;
  opacity: 0.75;
  margin-top: 2px;
}
.edit-btn {
  position: absolute;
  right: 0;
  top: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 10px 22px rgba(31, 35, 41, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
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

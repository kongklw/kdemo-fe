<template>
  <div class="mobile-vaccine-schedule">
    <van-nav-bar :title="showDetail ? (detailItem ? detailItem.name : '疫苗详情') : '疫苗时间表'" left-arrow fixed placeholder @click-left="onBack">
      <template #right>
        <van-icon v-if="!showDetail" name="clock-o" size="18" color="#333" />
      </template>
    </van-nav-bar>

    <div v-if="!showDetail" class="baby-card">
      <div class="baby-left">
        <div class="avatar">
          <img v-if="baby.image" :src="baby.image" alt="avatar">
          <div v-else class="avatar-placeholder" />
        </div>
        <div class="baby-meta">
          <div class="baby-name">{{ baby.name || '宝宝' }}</div>
          <div class="baby-age">{{ babyAge }}</div>
        </div>
      </div>
      <div class="baby-right">
        <div class="btn-pill" @click="openPaidPicker">添加自费疫苗</div>
        <div class="help-link" @click="onLearn">了解疫苗 <van-icon name="question-o" /></div>
      </div>
    </div>

    <div v-if="!showDetail" class="timeline">
      <div v-for="group in groups" :key="group.label" class="group">
        <div class="group-left">
          <div class="dot" />
          <div class="label">{{ group.label }}</div>
          <div class="line" />
        </div>
        <div class="group-right">
          <div v-for="item in group.items" :key="item.vaccine_key + '_' + item.recommend_date" class="card">
            <div class="card-main" @click="openDetail(item)">
              <div class="title-row">
                <div class="name">{{ item.name }}</div>
                <div class="tags">
                  <van-tag plain type="primary" class="tag">第{{ item.dose_index }}/{{ item.dose_total }}针</van-tag>
                  <van-tag plain :type="item.fee_type === 'free' ? 'default' : 'danger'" class="tag">
                    {{ item.fee_type === 'free' ? '免费' : '自费' }}
                  </van-tag>
                </div>
              </div>
              <div class="desc">{{ item.description }}</div>
              <div class="date" :class="{ done: item.status === 'done' }" @click.stop="openDatePickerForTime(item)">
                {{ item.status === 'done' ? '实际接种时间：' : '推荐接种时间：' }}
                {{ item.status === 'done' ? (item.actual_date || item.recommend_date) : item.recommend_date }}
                <span class="arrow">›</span>
              </div>
            </div>
            <div class="card-action">
              <template v-if="item.fee_type !== 'paid' || item.status !== 'not_added'">
                <div v-if="item.status === 'done'" class="stamp" @click.stop="openDetail(item)">
                  <div class="stamp-inner">
                    <div class="stamp-check">✓</div>
                    <div class="stamp-text">已接种</div>
                  </div>
                </div>
                <div v-else class="check-circle" @click.stop="openDatePickerForVaccination(item)" />
              </template>
              <template v-else>
                <div class="price">自费 ¥ {{ formatPrice(item.price_min, item.price_max) }}</div>
                <div class="add-btn" @click.stop="addPaid(item)">去添加</div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="detail">
      <div class="detail-head">
        <div class="detail-left">
          <div class="detail-name">{{ detailItem ? detailItem.name : '' }}</div>
          <div v-if="detailItem" class="detail-tags">
            <van-tag plain type="primary" class="tag">第{{ detailItem.dose_index }}/{{ detailItem.dose_total }}针</van-tag>
            <van-tag plain :type="detailItem.fee_type === 'free' ? 'default' : 'danger'" class="tag">
              {{ detailItem.fee_type === 'free' ? '免费' : '自费' }}
            </van-tag>
          </div>
          <div v-if="detailItem" class="detail-date">
            {{ detailItem.status === 'done' ? '实际接种时间：' : '推荐接种时间：' }}
            {{ detailItem.status === 'done' ? (detailItem.actual_date || detailItem.recommend_date) : detailItem.recommend_date }}
          </div>
        </div>
        <div class="detail-action" @click="onDetailAction">
          <div v-if="detailItem && detailItem.status === 'done'" class="detail-stamp">
            <div class="detail-stamp-check">✓</div>
            <div class="detail-stamp-text">已接种</div>
          </div>
          <div v-else class="detail-circle" />
        </div>
      </div>

      <div class="detail-body">
        <van-tabs v-model="detailTab" color="#ff6b81" line-width="16">
          <van-tab title="疫苗简介">
            <div class="detail-panel">
              <div class="detail-section">
                <div class="detail-section-title">预防疾病</div>
                <div class="detail-section-text">{{ detailItem ? detailItem.description : '' }}</div>
              </div>
              <div class="detail-section">
                <div class="detail-section-title">接种对象</div>
                <div class="detail-section-text">内容完善中</div>
              </div>
              <div class="detail-section">
                <div class="detail-section-title">接种次数</div>
                <div v-if="detailItem" class="detail-section-text">共 {{ detailItem.dose_total }} 针</div>
              </div>
            </div>
          </van-tab>
          <van-tab title="接种须知">
            <div class="detail-panel">
              <div class="detail-section">
                <div class="detail-section-title">接种须知</div>
                <div class="detail-section-text">内容完善中</div>
              </div>
            </div>
          </van-tab>
          <van-tab title="补种原则">
            <div class="detail-panel">
              <div class="detail-section">
                <div class="detail-section-title">补种原则</div>
                <div class="detail-section-text">内容完善中</div>
              </div>
            </div>
          </van-tab>
        </van-tabs>
      </div>
    </div>

    <van-action-sheet v-model="showPaidPicker" title="添加自费疫苗" :actions="paidActions" @select="onSelectPaid" />

    <van-popup v-model="showDatePicker" position="bottom">
      <van-datetime-picker
        v-model="pickerDate"
        type="date"
        title="选择接种时间"
        confirm-button-text="完成"
        cancel-button-text="取消"
        @confirm="onConfirmDate"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script>
import moment from 'moment'
import { Toast } from 'vant'
import { addPaidVaccineReq, getVaccineScheduleReq, toggleVaccineReq } from '@/api/baby'

export default {
  name: 'MobileVaccineSchedule',
  data() {
    return {
      loading: false,
      baby: {},
      groups: [],
      paidCandidates: [],
      showPaidPicker: false,
      showDatePicker: false,
      pickerDate: new Date(),
      pickerItem: null,
      pickerMode: 'recommend',
      pickerAction: 'time',
      showDetail: false,
      detailTab: 0,
      detailItem: null
    }
  },
  computed: {
    paidActions() {
      return (this.paidCandidates || []).map(x => ({
        name: `${x.name}（第${x.dose_index}/${x.dose_total}针）`,
        vaccine_key: x.vaccine_key,
        recommend_date: x.recommend_date
      }))
    },
    babyAge() {
      const birthday = this.baby.birthday
      if (!birthday) return ''
      const b = moment(birthday, 'YYYY-MM-DD')
      if (!b.isValid()) return ''
      const now = moment()
      if (now.isBefore(b, 'day')) return ''

      let years = now.year() - b.year()
      let months = now.month() - b.month()
      let days = now.date() - b.date()

      if (days < 0) {
        const prevMonth = now.clone().subtract(1, 'month')
        days += prevMonth.daysInMonth()
        months -= 1
      }
      if (months < 0) {
        months += 12
        years -= 1
      }
      const parts = []
      if (years > 0) parts.push(`${years}岁`)
      parts.push(`${months}个月`)
      parts.push(`${days}天`)
      return parts.join('')
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    onBack() {
      if (this.showDetail) {
        this.showDetail = false
        this.detailItem = null
        this.detailTab = 0
        return
      }
      this.$router.push('/mobile/home')
    },
    onLearn() {
      Toast('功能开发中')
    },
    formatPrice(min, max) {
      if (!min && !max) return '-'
      if (min && max) return `${min}–${max}`
      return `${min || max}`
    },
    openPaidPicker() {
      if (!this.paidActions.length) {
        Toast('暂无可添加的自费疫苗')
        return
      }
      this.showPaidPicker = true
    },
    async onSelectPaid(action) {
      this.showPaidPicker = false
      try {
        const res = await addPaidVaccineReq({ vaccine_key: action.vaccine_key, recommend_date: action.recommend_date })
        if (res.code === 200) {
          Toast.success('已添加')
          this.load()
        } else {
          Toast.fail(res.msg || '添加失败')
        }
      } catch (e) {
        Toast.fail('添加失败')
      }
    },
    async load() {
      this.loading = true
      try {
        const res = await getVaccineScheduleReq()
        if (res.code === 200) {
          const data = res.data || {}
          this.baby = data.baby || {}
          this.groups = data.groups || []
          this.paidCandidates = data.paid_candidates || []
          this.refreshDetailItem()
        } else {
          Toast.fail(res.msg || '加载失败')
        }
      } catch (e) {
        Toast.fail('加载失败')
      } finally {
        this.loading = false
      }
    },
    async addPaid(item) {
      try {
        const res = await addPaidVaccineReq({ vaccine_key: item.vaccine_key, recommend_date: item.recommend_date })
        if (res.code === 200) {
          Toast.success('已添加')
          this.load()
        } else {
          Toast.fail(res.msg || '添加失败')
        }
      } catch (e) {
        Toast.fail('添加失败')
      }
    },
    refreshDetailItem() {
      if (!this.showDetail || !this.detailItem) return
      const targetKey = `${this.detailItem.vaccine_key}__${this.detailItem.recommend_date}`
      for (const g of this.groups) {
        for (const it of g.items || []) {
          const key = `${it.vaccine_key}__${it.recommend_date}`
          if (key === targetKey) {
            this.detailItem = it
            return
          }
        }
      }
    },
    openDetail(item) {
      if (item.status === 'not_added') return
      this.detailItem = item
      this.showDetail = true
      this.detailTab = 0
    },
    async onDetailAction() {
      const item = this.detailItem
      if (!item) return
      if (item.status === 'done') {
        try {
          const res = await toggleVaccineReq({ vaccine_key: item.vaccine_key, done: false })
          if (res.code === 200) {
            Toast.success('已取消接种')
            this.load()
          } else {
            Toast.fail(res.msg || '操作失败')
          }
        } catch (e) {
          Toast.fail('操作失败')
        }
        return
      }
      this.openDatePickerForVaccination(item)
    },
    openDatePickerForTime(item) {
      if (item.status === 'not_added') return
      this.pickerItem = item
      this.pickerAction = 'time'
      this.pickerMode = item.status === 'done' ? 'actual' : 'recommend'
      const initial = (this.pickerMode === 'actual' ? item.actual_date : item.recommend_date) || moment().format('YYYY-MM-DD')
      this.pickerDate = moment(initial, 'YYYY-MM-DD').toDate()
      this.showDatePicker = true
    },
    openDatePickerForVaccination(item) {
      if (item.status === 'not_added') return
      this.pickerItem = item
      this.pickerAction = 'vaccinate'
      const initial = item.actual_date || moment().format('YYYY-MM-DD')
      this.pickerDate = moment(initial, 'YYYY-MM-DD').toDate()
      this.showDatePicker = true
    },
    async onConfirmDate(value) {
      const item = this.pickerItem
      const mode = this.pickerMode
      const action = this.pickerAction
      this.pickerItem = null
      this.showDatePicker = false
      if (!item) return
      const dateStr = moment(value).format('YYYY-MM-DD')
      try {
        const payload = action === 'vaccinate'
          ? { vaccine_key: item.vaccine_key, done: true, actual_date: dateStr }
          : { vaccine_key: item.vaccine_key, date_type: mode, date: dateStr }
        const res = await toggleVaccineReq(payload)
        if (res.code === 200) {
          this.load()
        } else {
          Toast.fail(res.msg || '操作失败')
        }
      } catch (e) {
        Toast.fail('操作失败')
      }
    }
  }
}
</script>

<style scoped>
.mobile-vaccine-schedule {
  min-height: 100vh;
  background: #f7f8fa;
}

.baby-card {
  margin: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.baby-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  background: #f3f4f6;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ffe3ea 0%, #ffd1da 100%);
}

.baby-name {
  font-size: 15px;
  font-weight: 700;
  color: #333;
}

.baby-age {
  margin-top: 2px;
  font-size: 12px;
  color: #999;
}

.baby-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.btn-pill {
  padding: 6px 10px;
  border-radius: 999px;
  background: #ffe9ee;
  color: #ff6b81;
  font-size: 12px;
  font-weight: 600;
}

.help-link {
  font-size: 12px;
  color: #bbb;
}

.timeline {
  padding: 0 12px 18px;
}

.detail {
  padding: 10px 12px 18px;
}

.detail-head {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.detail-left {
  flex: 1;
  min-width: 0;
}

.detail-name {
  font-size: 20px;
  font-weight: 800;
  color: #111;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-tags {
  margin-top: 8px;
  display: flex;
  gap: 6px;
}

.detail-date {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.detail-action {
  width: 92px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  background: #fff;
}

.detail-stamp {
  width: 76px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid rgba(255, 107, 129, 0.22);
  background: rgba(255, 107, 129, 0.06);
  transform: rotate(-10deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 107, 129, 0.75);
  font-weight: 800;
}

.detail-stamp-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ff6b81;
  color: #fff;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
  margin-bottom: 4px;
}

.detail-stamp-text {
  font-size: 12px;
  letter-spacing: 1px;
}

.detail-body {
  margin-top: 12px;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
}

.detail-panel {
  padding: 14px;
}

.detail-section {
  margin-bottom: 14px;
}

.detail-section-title {
  font-size: 13px;
  font-weight: 700;
  color: #333;
}

.detail-section-text {
  margin-top: 6px;
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.group {
  display: flex;
  gap: 10px;
}

.group-left {
  width: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d9d9d9;
  margin-top: 8px;
}

.label {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.line {
  flex: 1;
  width: 1px;
  background: #eee;
  margin-top: 8px;
}

.group-right {
  flex: 1;
  padding-bottom: 8px;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.card-main {
  flex: 1;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.name {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tags {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.tag {
  font-size: 11px;
}

.desc {
  margin-top: 6px;
  font-size: 12px;
  color: #999;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.date {
  margin-top: 6px;
  font-size: 12px;
  color: #bbb;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.date.done {
  color: #c0c4cc;
}

.arrow {
  color: #c0c4cc;
  font-size: 14px;
  line-height: 1;
}

.card-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.check-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  background: #fff;
}

.stamp {
  width: 82px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid rgba(255, 107, 129, 0.2);
  background: rgba(255, 107, 129, 0.05);
  position: relative;
  transform: rotate(-10deg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stamp-inner {
  text-align: center;
  color: rgba(255, 107, 129, 0.7);
  font-weight: 700;
}

.stamp-check {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ff6b81;
  color: #fff;
  font-size: 12px;
  line-height: 18px;
  margin: 0 auto 4px;
}

.stamp-text {
  font-size: 12px;
  letter-spacing: 1px;
}

.price {
  font-size: 12px;
  color: #ff6b81;
  font-weight: 600;
  white-space: nowrap;
}

.add-btn {
  min-width: 60px;
  text-align: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #ff6b81;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}
</style>

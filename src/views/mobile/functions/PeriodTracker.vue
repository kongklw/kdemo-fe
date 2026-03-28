<template>
  <div class="mobile-period">
    <van-nav-bar fixed placeholder :title="title" left-arrow right-icon="bar-chart-o" @click-left="onBack" @click-right="onOpenChart" />

    <div class="calendar-wrap">
      <div class="calendar-header">
        <van-icon name="arrow-left" class="nav-icon" @click="prevMonth" />
        <div class="month-text">{{ currentMonthLabel }}</div>
        <van-icon name="arrow" class="nav-icon" @click="nextMonth" />
      </div>

      <div class="calendar-body">
        <div class="weekday-row">
          <div v-for="w in weekdays" :key="w" class="weekday">{{ w }}</div>
        </div>
        <div class="grid-area" :style="gridAreaStyle">
          <div class="grid-pad">
            <div class="day-grid month-grid" :style="monthGridStyle">
              <div v-for="(d, idx) in monthDays" :key="idx" class="day" :class="dayClass(d)" @click="selectDay(d)">
                <div v-if="isSexDay(d)" class="sex-heart">❤</div>
                <div class="day-inner">
                  <div v-if="d.date === todayStr" class="today-drop" @click.stop="goToday"><span class="today-drop-text">今</span></div>
                  <div v-else-if="isPeriodDay(d)" class="period-drop"><span class="period-drop-text">{{ d.day }}</span></div>
                  <div v-else class="day-num">{{ d.day }}</div>
                  <div v-if="getDayTag(d)" class="day-tag">{{ getDayTag(d) }}</div>
                </div>
              </div>
            </div>
            <div class="day-grid week-grid" :style="weekGridStyle">
              <div v-for="(d, idx) in selectedWeekDays" :key="'wd-' + idx" class="day" :class="dayClass(d)" @click="selectDay(d)">
                <div v-if="isSexDay(d)" class="sex-heart">❤</div>
                <div class="day-inner">
                  <div v-if="d.date === todayStr" class="today-drop" @click.stop="goToday"><span class="today-drop-text">今</span></div>
                  <div v-else-if="isPeriodDay(d)" class="period-drop"><span class="period-drop-text">{{ d.day }}</span></div>
                  <div v-else class="day-num">{{ d.day }}</div>
                  <div v-if="getDayTag(d)" class="day-tag">{{ getDayTag(d) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="predict">
      <div class="predict-text">预测排卵日 {{ predictOvulationText }}</div>
      <div class="legend">
        <span class="legend-item legend-period"><i class="legend-dot dot-period" />月经期</span>
        <span class="legend-item legend-pred"><i class="legend-dot dot-pred" />预测经期</span>
        <span class="legend-item legend-fertile"><i class="legend-dot dot-fertile" />易孕期</span>
        <span class="legend-item legend-ovu"><i class="legend-dot dot-ovu" />排卵日</span>
        <span class="legend-spacer" />
        <van-icon name="arrow" class="legend-arrow" @click="showGlossary = true" />
      </div>
    </div>

    <template v-if="!isFutureSelected">
      <div class="card">
        <div class="card-head">
          <div class="card-title">月经 <span class="card-sub">{{ selectedDateLabel }}</span></div>
          <van-switch v-model="form.is_period" size="22px" active-color="#ff5a75" @change="onPeriodToggle" />
        </div>
        <div class="period-status">
          <i class="period-dot" :class="{ on: form.is_period }" />
          <span class="period-text">{{ periodStatusText }}</span>
        </div>
        <template v-if="form.is_period">
          <div class="card-row">
            <div class="row-label">
              流量
              <span v-if="flowDesc" class="row-desc">{{ flowDesc }}</span>
            </div>
            <div class="row-values">
              <span v-for="i in 5" :key="'flow'+i" class="flow" :class="{ active: form.flow_level >= i }" @click="setFlow(i)" />
            </div>
          </div>
          <div class="card-row">
            <div class="row-label">
              痛经
              <span v-if="painDesc" class="row-desc">{{ painDesc }}</span>
            </div>
            <div class="row-values">
              <span v-for="i in 5" :key="'pain'+i" class="pain" :class="{ active: form.pain_level >= i }" @click="setPain(i)">
                <i class="pain-icon" />
              </span>
            </div>
          </div>
        </template>
      </div>

      <div class="card">
        <div class="card-title">生理记录</div>
        <div class="list">
          <div class="list-item">
            <div class="li-left">
              <div class="li-ico ico-sex">❤</div>
              <div class="li-text">爱爱</div>
            </div>
            <div class="li-right">
              <van-switch v-model="form.had_sex" size="20px" active-color="#ff5a75" @change="queueSave" />
            </div>
          </div>
          <div class="divider" />
          <div class="list-item" @click="openEditor('symptoms')">
            <div class="li-left">
              <div class="li-ico ico-symptom">●</div>
              <div class="li-text">症状</div>
            </div>
            <div class="li-right">
              <span class="li-value">{{ symptomsValue }}</span>
              <van-icon name="plus" class="plus" />
            </div>
          </div>
          <div class="divider" />
          <div class="list-item" @click="openEditor('basal_temp')">
            <div class="li-left">
              <div class="li-ico ico-temp">℃</div>
              <div class="li-text">基础体温</div>
              <span class="mini-tag">分析</span>
            </div>
            <div class="li-right">
              <span class="li-value">{{ tempValue }}</span>
              <van-icon name="plus" class="plus" />
            </div>
          </div>
          <div class="divider" />
          <div class="list-item" @click="openEditor('weight_kg')">
            <div class="li-left">
              <div class="li-ico ico-weight">kg</div>
              <div class="li-text">体重</div>
              <span class="mini-tag">分析</span>
            </div>
            <div class="li-right">
              <span class="li-value">{{ weightValue }}</span>
              <van-icon name="plus" class="plus" />
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">日常</div>
        <div class="list">
          <div class="list-item">
            <div class="li-left">
              <div class="li-ico ico-mood">☺</div>
              <div class="li-text">心情</div>
            </div>
            <div class="li-right mood-options">
              <div
                v-for="opt in moodOptions"
                :key="opt.value"
                class="mood-opt"
                :class="{ active: form.mood === opt.value }"
                @click="selectMood(opt.value)"
              >
                <div class="mood-emoji">{{ opt.emoji }}</div>
                <div class="mood-label">{{ opt.label }}</div>
              </div>
            </div>
          </div>
          <div class="divider" />
          <div class="list-item">
            <div class="li-left">
              <div class="li-ico ico-habit">✓</div>
              <div class="li-text">习惯</div>
            </div>
            <div class="li-right habit-options">
              <div
                v-for="h in habitOptions"
                :key="h.key"
                class="habit-opt"
                :class="{ active: form[h.key] }"
                @click="toggleHabit(h.key)"
              >
                <div class="habit-emoji">{{ h.emoji }}</div>
                <div class="habit-label">{{ h.label }}</div>
              </div>
            </div>
          </div>
          <div class="divider" />
          <div class="list-item" @click="goBreastFeed">
            <div class="li-left">
              <div class="li-ico ico-feed">≋</div>
              <div class="li-text">喂养记录</div>
            </div>
            <div class="li-right">
              <van-icon name="plus" class="plus" />
            </div>
          </div>
          <div class="divider" />
          <div class="list-item" @click="goTodo">
            <div class="li-left">
              <div class="li-ico ico-todo">☰</div>
              <div class="li-text">待办</div>
            </div>
            <div class="li-right">
              <van-icon name="plus" class="plus" />
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <van-cell class="cell" title="经期设置" :value="`当前周期${settings.cycle_length}天`" is-link clickable @click="showSettings=true" />
        <van-dialog v-model="showSettings" title="经期设置" show-cancel-button @confirm="saveSettings">
          <div class="dialog-body">
            <van-field v-model="settings.cycle_length" type="number" label="周期长度" />
            <van-field v-model="settings.period_length" type="number" label="经期天数" />
          </div>
        </van-dialog>
      </div>
    </template>

    <template v-else>
      <div class="future-tip">
        <div class="future-title">推算当日处于安全期</div>
        <div class="future-sub">不能记录未来</div>
      </div>

      <div class="card">
        <div class="list">
          <div class="list-item" @click="goTodo">
            <div class="li-left">
              <div class="li-ico ico-todo">☰</div>
              <div class="li-text">待办</div>
            </div>
            <div class="li-right">
              <van-icon name="plus" class="plus" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <van-dialog v-model="showGlossary" title="名词解释" confirm-button-text="关闭">
      <div class="glossary">
        <div class="glossary-item">
          <div class="glossary-title">月经期</div>
          <div class="glossary-text">每次月经持续的天数，一般约3-7天。</div>
        </div>
        <div class="glossary-item">
          <div class="glossary-title">预测经期</div>
          <div class="glossary-text">根据历史周期与经期天数推算的下次月经时间。</div>
        </div>
        <div class="glossary-item">
          <div class="glossary-title">安全期</div>
          <div class="glossary-text">相对不易受孕的时间段，受个人周期波动影响，仅供参考。</div>
        </div>
        <div class="glossary-item">
          <div class="glossary-title">易孕期</div>
          <div class="glossary-text">围绕排卵日的受孕概率较高时间段，通常为排卵日前后数日。</div>
        </div>
        <div class="glossary-item">
          <div class="glossary-title">排卵日</div>
          <div class="glossary-text">排卵发生的那一天，通常接近下次月经来潮前14天。</div>
        </div>
      </div>
    </van-dialog>

    <van-dialog v-model="showEditor" :title="editorTitle" show-cancel-button @confirm="confirmEditor">
      <div class="dialog-body">
        <van-field
          v-model="editorValue"
          :type="editorField === 'symptoms' ? 'textarea' : 'number'"
          rows="2"
          autosize
          :label="editorTitle"
          :placeholder="editorPlaceholder"
        />
      </div>
    </van-dialog>
  </div>
</template>

<script>
import { getPeriodOverviewReq, savePeriodLogReq, getPeriodLogReq, getPeriodSettingsReq, savePeriodSettingsReq } from '@/api/baby'
import moment from 'moment'
import { Toast } from 'vant'
export default {
  name: 'MobilePeriodTracker',
  data() {
    return {
      curMonth: moment().startOf('month'),
      daysData: [],
      settings: { cycle_length: 28, period_length: 5 },
      selectedDate: moment().format('YYYY-MM-DD'),
      todayStr: moment().format('YYYY-MM-DD'),
      isWeekOnly: false,
      weekOnlyGap: { top: 80, bottom: 220 },
      collapseProgress: 0,
      extraData: { predict_next_ovulation: null, predict_next_period_start: null },
      saveTimer: null,
      showGlossary: false,
      form: {
        is_period: false,
        flow_level: 0,
        pain_level: 0,
        had_sex: false,
        symptoms: '',
        basal_temp: '',
        weight_kg: '',
        mood: '',
        habit_eat_on_time: false,
        habit_water8: false,
        habit_fruits: false,
        habit_exercise: false,
        habit_poop: false
      },
      showSettings: false,
      showEditor: false,
      editorField: '',
      editorTitle: '',
      editorValue: '',
      moodOptions: [
        { label: '太开心', value: 'happy', emoji: '😄' },
        { label: '还不错', value: 'good', emoji: '🙂' },
        { label: '一般般', value: 'normal', emoji: '😐' },
        { label: '不开心', value: 'bad', emoji: '🙁' },
        { label: '好难过', value: 'worse', emoji: '😭' }
      ],
      habitOptions: [
        { label: '按时吃饭', key: 'habit_eat_on_time', emoji: '🍚' },
        { label: '八杯水', key: 'habit_water8', emoji: '💧' },
        { label: '吃水果', key: 'habit_fruits', emoji: '🍎' },
        { label: '运动', key: 'habit_exercise', emoji: '🏃' },
        { label: '便便', key: 'habit_poop', emoji: '💩' }
      ],
      flowOptions: [
        { level: 1, text: '月经量很少' },
        { level: 2, text: '月经量较少' },
        { level: 3, text: '月经量正常' },
        { level: 4, text: '月经量偏多' },
        { level: 5, text: '月经量过多' }
      ],
      painOptions: [
        { level: 1, text: '基本不痛' },
        { level: 2, text: '轻微疼痛' },
        { level: 3, text: '很痛' },
        { level: 4, text: '非常痛' },
        { level: 5, text: '超级疼' }
      ]
    }
  },
  computed: {
    title() {
      return '经期记录'
    },
    weekdays() {
      return ['日', '一', '二', '三', '四', '五', '六']
    },
    currentMonthLabel() {
      return this.curMonth.format('YYYY年M月')
    },
    monthDays() {
      const first = this.curMonth.clone()
      const startWeekday = first.day()
      const total = first.daysInMonth()
      const list = []
      for (let i = 0; i < startWeekday; i++) {
        list.push({ date: '', day: '' })
      }
      for (let d = 1; d <= total; d++) {
        const dt = first.clone().date(d)
        const item = this.daysData.find(x => x.date === dt.format('YYYY-MM-DD')) || { status: [], log: null }
        list.push({ date: dt.format('YYYY-MM-DD'), day: d, status: item.status, log: item.log })
      }
      return list
    },
    selectedWeekDays() {
      const start = moment(this.selectedDate).startOf('week')
      const list = []
      for (let i = 0; i < 7; i++) {
        const dt = start.clone().add(i, 'day')
        const item = this.daysData.find(x => x.date === dt.format('YYYY-MM-DD')) || { status: [], log: null }
        list.push({ date: dt.format('YYYY-MM-DD'), day: dt.date(), status: item.status, log: item.log })
      }
      return list
    },
    predictOvulationText() {
      const extra = this.extra
      const ov = extra.predict_next_ovulation || (extra.predict_next_period_start ? moment(extra.predict_next_period_start).add(-14, 'day').format('YYYY-MM-DD') : null)
      if (!ov) return '-'
      const m = moment(ov)
      return `${m.month() + 1}月${m.date()}日`
    },
    extra() {
      return this.extraData || { predict_next_ovulation: null, predict_next_period_start: null }
    },
    moodLabel() {
      const m = this.form.mood
      return ({ happy: '太开心', good: '还不错', normal: '一般般', bad: '不开心', worse: '好难过' }[m]) || ''
    },
    symptomsValue() {
      return this.form.symptoms ? this.form.symptoms : '添加'
    },
    tempValue() {
      return this.form.basal_temp ? `${this.form.basal_temp}` : '添加'
    },
    weightValue() {
      return this.form.weight_kg ? `${this.form.weight_kg}` : '添加'
    },
    editorPlaceholder() {
      if (this.editorField === 'symptoms') return '输入症状'
      if (this.editorField === 'basal_temp') return '36.5'
      if (this.editorField === 'weight_kg') return '50.0'
      return ''
    },
    isFutureSelected() {
      return this.isFutureInCurrentMonth(this.selectedDate)
    },
    selectedDateLabel() {
      return moment(this.selectedDate).format('M月D日')
    },
    periodStatusText() {
      return this.form.is_period ? '大姨妈来了' : '未在经期'
    },
    flowDesc() {
      const opt = this.flowOptions.find(x => x.level === this.form.flow_level)
      return opt ? opt.text : ''
    },
    painDesc() {
      const opt = this.painOptions.find(x => x.level === this.form.pain_level)
      return opt ? opt.text : ''
    },
    calendarRowCount() {
      const n = Math.ceil(this.monthDays.length / 7)
      return n > 0 ? n : 1
    },
    selectedMonthRowIndex() {
      const idx = this.monthDays.findIndex(x => x.date === this.selectedDate)
      if (idx < 0) return 0
      return Math.floor(idx / 7)
    },
    calendarGridHeight() {
      const row = this.calendarRowCount
      const dayH = 42
      const gap = 10
      const full = row * dayH + (row - 1) * gap
      const min = dayH
      return Math.round(full - (full - min) * this.collapseProgress)
    },
    monthTranslateY() {
      const stride = 52
      return -this.selectedMonthRowIndex * stride * this.collapseProgress
    },
    gridAreaStyle() {
      return { height: `${this.calendarGridHeight}px` }
    },
    monthGridStyle() {
      const showWeek = this.isWeekOnly
      return {
        transform: `translateY(${this.monthTranslateY}px)`,
        opacity: showWeek ? '0' : '1',
        pointerEvents: showWeek ? 'none' : 'auto'
      }
    },
    weekGridStyle() {
      const showWeek = this.isWeekOnly
      return {
        opacity: showWeek ? '1' : '0',
        pointerEvents: showWeek ? 'auto' : 'none'
      }
    }
  },
  mounted() {
    this.fetchSettings()
    this.load()
    window.addEventListener('scroll', this.onScroll, { passive: true })
    this.$nextTick(() => this.onScroll())
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll)
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
      this.saveTimer = null
      this.saveLog(true)
    }
  },
  methods: {
    getDefaultForm() {
      return {
        is_period: false,
        flow_level: 0,
        pain_level: 0,
        had_sex: false,
        symptoms: '',
        basal_temp: '',
        weight_kg: '',
        mood: '',
        habit_eat_on_time: false,
        habit_water8: false,
        habit_fruits: false,
        habit_exercise: false,
        habit_poop: false
      }
    },
    isFutureInCurrentMonth(dateStr) {
      if (!dateStr) return false
      const dt = moment(dateStr)
      const today = moment(this.todayStr)
      return dt.isAfter(today, 'day') && dt.isSame(today, 'month') && dt.isSame(today, 'year')
    },
    isSexDay(d) {
      return !!(d && d.date && d.log && d.log.had_sex)
    },
    isPeriodDay(d) {
      return !!(d && d.date && ((d.status && d.status.includes('period')) || (d.log && d.log.is_period)))
    },
    onBack() {
      if (window.history.length > 1) {
        this.$router.back()
        return
      }
      this.$router.replace('/mobile/home')
    },
    onOpenChart() {
      Toast('开发中')
    },
    goToday() {
      const today = moment()
      this.curMonth = today.clone().startOf('month')
      this.selectedDate = today.format('YYYY-MM-DD')
      this.load()
    },
    prevMonth() {
      this.curMonth = this.curMonth.clone().add(-1, 'month')
      this.load()
    },
    nextMonth() {
      this.curMonth = this.curMonth.clone().add(1, 'month')
      this.load()
    },
    onPeriodToggle(val) {
      if (!val) {
        this.form = Object.assign({}, this.form, { flow_level: 0, pain_level: 0 })
      }
      this.queueSave()
    },
    onScroll() {
      const doc = document.documentElement
      const scrollTop = window.pageYOffset || doc.scrollTop || 0
      const viewportH = window.innerHeight || doc.clientHeight || 0
      const scrollH = doc.scrollHeight || 0
      const start = this.weekOnlyGap.top
      const end = this.weekOnlyGap.top + 260
      const bottomReached = scrollTop + viewportH >= scrollH - this.weekOnlyGap.bottom
      let p = 0
      if (scrollTop <= start) p = 0
      else if (bottomReached || scrollTop >= end) p = 1
      else p = (scrollTop - start) / (end - start)
      const next = Math.max(0, Math.min(1, p))
      this.collapseProgress = next
      this.isWeekOnly = next >= 1
    },
    getDayTag(d) {
      if (!d.date) return ''
      if (d.status && d.status.includes('ovulation')) return '排卵日'
      if (d.status && d.status.includes('fertile_very_high')) return '极高易孕'
      if (d.status && d.status.includes('fertile_high')) return '高易孕'
      if (d.status && d.status.includes('fertile')) {
        return '易孕期'
      }
      return ''
    },
    openEditor(field) {
      this.editorField = field
      this.editorTitle = ({ symptoms: '症状', basal_temp: '基础体温', weight_kg: '体重' }[field]) || ''
      this.editorValue = this.form[field] ? `${this.form[field]}` : ''
      this.showEditor = true
    },
    setFlow(level) {
      this.form = Object.assign({}, this.form, { flow_level: level })
      this.queueSave()
      const opt = this.flowOptions.find(x => x.level === level)
      if (opt) Toast(`${level}级：${opt.text}`)
    },
    setPain(level) {
      this.form = Object.assign({}, this.form, { pain_level: level })
      this.queueSave()
      const opt = this.painOptions.find(x => x.level === level)
      if (opt) Toast(`${level}级：${opt.text}`)
    },
    selectMood(value) {
      this.form = Object.assign({}, this.form, { mood: value })
      this.queueSave()
    },
    toggleHabit(key) {
      this.form = Object.assign({}, this.form, { [key]: !this.form[key] })
      this.queueSave()
    },
    goBreastFeed() {
      this.$router.push('/mobile/functions/breastfeed')
    },
    goTodo() {
      this.$router.push('/mobile/functions/todo')
    },
    confirmEditor() {
      if (!this.editorField) return
      this.form = Object.assign({}, this.form, { [this.editorField]: this.editorValue })
      this.showEditor = false
      this.queueSave()
    },
    queueSave() {
      if (this.saveTimer) clearTimeout(this.saveTimer)
      this.saveTimer = setTimeout(() => {
        this.saveTimer = null
        this.saveLog(true)
      }, 400)
    },
    getRangePosClass(dateStr, key) {
      const day = this.daysData.find(x => x.date === dateStr)
      const has = day && day.status && day.status.includes(key)
      if (!has) return ''
      const prevDate = moment(dateStr).add(-1, 'day').format('YYYY-MM-DD')
      const nextDate = moment(dateStr).add(1, 'day').format('YYYY-MM-DD')
      const prev = this.daysData.find(x => x.date === prevDate)
      const next = this.daysData.find(x => x.date === nextDate)
      const hasPrev = prev && prev.status && prev.status.includes(key)
      const hasNext = next && next.status && next.status.includes(key)
      if (hasPrev && hasNext) return 'mid'
      if (!hasPrev && hasNext) return 'start'
      if (hasPrev && !hasNext) return 'end'
      return 'single'
    },
    dayClass(d) {
      const cls = []
      if (!d.date) return 'day empty'
      if (this.isFutureInCurrentMonth(d.date)) cls.push('future')
      if (d.status && d.status.includes('period')) cls.push('period', this.getRangePosClass(d.date, 'period'))
      if (d.status && d.status.includes('predicted_period')) cls.push('pred', this.getRangePosClass(d.date, 'predicted_period'))
      if (d.status && d.status.includes('fertile')) cls.push('fertile', this.getRangePosClass(d.date, 'fertile'))
      if (d.status && d.status.includes('ovulation')) cls.push('ovu')
      if (d.date === this.selectedDate) cls.push('selected')
      return ['day', ...cls].join(' ')
    },
    async selectDay(d) {
      if (!d.date) return
      this.selectedDate = d.date
      if (this.isFutureInCurrentMonth(d.date)) {
        this.form = this.getDefaultForm()
        return
      }
      const inMonth = this.daysData.find(x => x.date === d.date)
      const log = (inMonth && inMonth.log) || d.log
      if (log) {
        this.form = Object.assign(this.getDefaultForm(), log)
        return
      }

      this.form = this.getDefaultForm()
      try {
        const res = await getPeriodLogReq({ date: d.date })
        if (res.code === 200 && res.data) {
          const day = inMonth || { date: d.date, status: [], log: null }
          day.log = res.data
          if (!inMonth) this.daysData.push(day)
          if (res.data.is_period) {
            const status = Array.isArray(day.status) ? day.status.slice() : []
            if (!status.includes('period')) status.push('period')
            day.status = status
          }
          this.form = Object.assign(this.getDefaultForm(), res.data)
        }
      } catch (e) {
        void e
      }
    },
    async load() {
      try {
        const month = this.curMonth.format('YYYY-MM')
        const res = await getPeriodOverviewReq({ month })
        if (res.code === 200) {
          this.daysData = res.data.days || []
          this.extraData = {
            predict_next_ovulation: res.data.predict_next_ovulation,
            predict_next_period_start: res.data.predict_next_period_start
          }
          const sel = this.daysData.find(x => x.date === this.selectedDate)
          if (sel) this.selectDay(sel)
          this.$nextTick(() => this.onScroll())
        } else {
          Toast.fail(res.msg || '加载失败')
        }
      } catch (e) {
        Toast.fail('加载失败')
      }
    },
    async fetchSettings() {
      try {
        const res = await getPeriodSettingsReq()
        if (res.code === 200 && res.data) {
          this.settings = res.data
        }
      } catch (e) {
        void e
      }
    },
    async saveSettings() {
      try {
        const res = await savePeriodSettingsReq({ cycle_length: this.settings.cycle_length, period_length: this.settings.period_length })
        if (res.code === 200) {
          Toast.success('已保存')
          this.load()
        } else {
          Toast.fail(res.msg || '保存失败')
        }
      } catch (e) {
        Toast.fail('保存失败')
      }
    },
    async saveLog(silent) {
      try {
        const payload = Object.assign({}, this.form, { date: this.selectedDate })
        const prev = this.daysData.find(x => x.date === this.selectedDate)
        const prevIsPeriod = prev && prev.log ? !!prev.log.is_period : false
        const res = await savePeriodLogReq(payload)
        if (res.code === 200) {
          if (!silent) Toast.success('已保存')
          if (prev) {
            prev.log = res.data
          } else {
            this.daysData.push({ date: this.selectedDate, status: [], log: res.data })
          }
          const day = this.daysData.find(x => x.date === this.selectedDate)
          if (day) {
            const status = Array.isArray(day.status) ? day.status.slice() : []
            const next = status.filter(s => s !== 'period')
            if (res.data && res.data.is_period) next.push('period')
            day.status = Array.from(new Set(next))
          }
          const nextIsPeriod = !!(res.data && res.data.is_period)
          if (prevIsPeriod !== nextIsPeriod) this.load()
        } else if (!silent) {
          Toast.fail(res.msg || '保存失败')
        }
      } catch (e) {
        if (!silent) Toast.fail('保存失败')
      }
    }
  }
}
</script>

<style scoped>
.mobile-period{min-height:100vh;background:#f6f7f9}
.calendar-wrap{background:#fff;padding-bottom:6px;position:relative}
.calendar-header{display:flex;align-items:center;justify-content:center;padding:10px 0 6px}
.nav-icon{color:#111}
.calendar-wrap{background:#fff;padding-bottom:6px;position:sticky;top:46px;z-index:10}
.calendar-wrap{background:#fff;padding-bottom:6px;position:sticky;top:46px;z-index:10}
.calendar-body{padding-top:2px}
.weekday-row{display:grid;grid-template-columns:repeat(7,1fr);gap:10px;padding:0 14px 6px}
.grid-area{position:relative;overflow:hidden}
.grid-pad{position:relative;height:100%;padding:0 14px 12px}
.day-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:10px}
.month-grid{position:absolute;top:0;left:0;right:0}
.week-grid{position:absolute;top:0;left:0;right:0}
.weekday{color:#666;text-align:center;font-size:14px}
.day{height:42px;border-radius:12px;background:#fff;border:1px solid #f1f2f4;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
.day.selected{box-shadow:0 0 0 1px #ff5a75 inset;background:#fff}
.day.future{opacity:.35}
.day.future.selected{opacity:1}
.day.period{background:#fff;border-color:#f1f2f4}
.day.pred{background:#ffeef3;border-color:#ffeef3}
.day.period.start,.day.pred.start,.day.fertile.start{border-top-right-radius:6px;border-bottom-right-radius:6px}
.day.period{background:#fff;border-color:#f1f2f4}
.day.pred{background:#ffeef3;border-color:#ffeef3}
.day.fertile{background:#ede9ff;border-color:#ede9ff}
.day.ovu .day-num{background:#e6dcff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center}
.day-inner{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.day-num{font-size:15px;color:#111;line-height:16px}
.day.ovu .day-num{background:#e6dcff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center}
.day-inner{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.day-num{font-size:15px;color:#111;line-height:16px}
.day-num.today{color:#ff5a75}
.sex-heart{position:absolute;top:4px;left:50%;transform:translateX(-50%);color:#ff7aa2;font-size:12px;line-height:12px}
.today-drop{width:28px;height:28px;background:#ff5a75;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center}
.today-drop-text{transform:rotate(45deg);color:#fff;font-size:12px;font-weight:700;line-height:12px}
.period-drop{width:28px;height:28px;background:#ff8aa1;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center}
.period-drop-text{transform:rotate(45deg);color:#fff;font-size:12px;font-weight:700;line-height:12px}
.day-tag{font-size:10px;line-height:12px;color:#6a4cf4;transform:scale(.92);white-space:nowrap}
.predict{padding:10px 14px 0;color:#333}
.predict-text{font-size:16px;font-weight:500}
.legend{display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:#666;padding:8px 0 12px;align-items:center}
.legend-item{display:flex;align-items:center;gap:4px}
.legend-spacer{flex:1}
.legend-arrow{color:#c0c5cd}
.legend-dot{display:inline-block;width:8px;height:8px;border-radius:50%}
.dot-period{background:#ff8aa1}
.dot-pred{background:#ffd0dc}
.dot-fertile{background:#b8a6ff}
.dot-ovu{background:#7d5cf6}
.card{background:#fff;margin:12px 12px 0;border-radius:14px;padding:12px}
.card-title{font-weight:800;font-size:22px;margin-bottom:6px}
.card-sub{font-size:12px;color:#9aa0a6;font-weight:500;margin-left:6px}
.card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.period-status{display:flex;align-items:center;gap:8px;margin:2px 0 10px}
.period-dot{width:10px;height:10px;border-radius:50%;background:#d7dbe2;display:inline-block}
.period-dot.on{background:#ff5a75}
.period-text{color:#333;font-size:14px}
.card-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0}
.row-label{color:#333;font-size:18px}
.row-desc{margin-left:8px;color:#9aa0a6;font-size:12px;font-weight:400}
.row-values{display:flex;align-items:center;gap:10px}
.flow{width:14px;height:14px;border-radius:50%;background:#d7dbe2}
.flow.active{background:#ff5a75}
.pain{width:18px;height:18px;display:flex;align-items:center;justify-content:center}
.pain-icon{width:16px;height:16px;display:block;background:#c0c5cd;-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M13 2L3 14h7l-1 8 12-14h-7l-1-6z'/%3E%3C/svg%3E");-webkit-mask-repeat:no-repeat;-webkit-mask-position:center;-webkit-mask-size:contain;mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M13 2L3 14h7l-1 8 12-14h-7l-1-6z'/%3E%3C/svg%3E");mask-repeat:no-repeat;mask-position:center;mask-size:contain}
.pain.active .pain-icon{background:#ff5a75}
.plus{color:#9aa0a6}
.list{width:100%}
.list-item{display:flex;align-items:center;justify-content:space-between;padding:12px 0}
.divider{height:1px;background:#f2f3f5}
.li-left{display:flex;align-items:center;gap:10px;min-width:90px}
.li-ico{width:28px;height:28px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700}
.ico-sex{background:#b78bff}
.ico-symptom{background:#65c7ff}
.ico-temp{background:#63d0c3}
.ico-weight{background:#9aa0ff}
.ico-mood{background:#ffd48a;color:#6b4e00}
.ico-habit{background:#ffd0dc;color:#7a2a3a}
.ico-feed{background:#92e2d8;color:#134e4a}
.ico-todo{background:#b9c0ff;color:#1f2a8a}
.li-text{font-size:18px;color:#222}
.li-right{display:flex;align-items:center;gap:10px;justify-content:flex-end;flex:1}
.li-value{color:#9aa0a6;font-size:14px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mini-tag{margin-left:8px;background:#e6f6ef;color:#26a269;border-radius:10px;padding:2px 8px;font-size:12px;line-height:16px}
.mood-options{gap:12px}
.mood-opt{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;opacity:.5;width:54px}
.mood-opt.active{opacity:1}
.mood-emoji{font-size:20px;line-height:22px}
.mood-label{font-size:12px;color:#666;white-space:nowrap}
.habit-options{gap:10px}
.habit-opt{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;opacity:.5;width:54px}
.habit-opt.active{opacity:1}
.habit-emoji{font-size:20px;line-height:22px}
.habit-label{font-size:12px;color:#666;white-space:nowrap}
.dialog-body{padding:10px}
.future-tip{padding:18px 12px 0;text-align:center}
.future-title{font-size:18px;font-weight:700;color:#111}
.future-sub{margin-top:6px;font-size:14px;color:#9aa0a6}
.glossary{padding:10px 16px 14px}
.glossary-item{padding:10px 0}
.glossary-title{font-size:16px;font-weight:700;color:#111}
.glossary-text{margin-top:6px;font-size:13px;line-height:18px;color:#666}
</style>

<template>
  <div class="mobile-body-metrics-edit">
    <van-nav-bar
      :title="isEdit ? '修改生长记录' : '添加生长记录'"
      left-arrow
      right-text="保存"
      fixed
      placeholder
      @click-left="onClickLeft"
      @click-right="save"
    />

    <van-cell-group inset class="form-group">
      <van-field v-model="form.height_cm" label="身高" type="number" input-align="right" placeholder="请填写">
        <template #right-icon>
          <span class="unit">cm</span>
        </template>
      </van-field>
      <van-field v-model="form.weight_kg" label="体重" type="number" input-align="right" placeholder="请填写">
        <template #right-icon>
          <span class="unit">kg</span>
        </template>
      </van-field>
      <van-field v-model="form.head_circumference_cm" label="头围" type="number" input-align="right" placeholder="请填写">
        <template #right-icon>
          <span class="unit">cm</span>
        </template>
      </van-field>
      <van-field
        readonly
        clickable
        :value="formatDateCN(form.measure_date)"
        label="日期"
        input-align="right"
        placeholder="请选择"
        @click="showDatePicker = true"
      />
    </van-cell-group>

    <div class="uploader-card">
      <div class="uploader-title">上传宝宝照片</div>
      <van-uploader v-model="fileList" :max-count="1" />
    </div>

    <div v-if="isEdit" class="actions">
      <van-button round block type="danger" plain class="delete-btn" @click="remove">删除</van-button>
    </div>

    <van-popup v-model="showDatePicker" position="bottom">
      <van-datetime-picker
        v-model="formDate"
        type="date"
        title="选择日期"
        @confirm="onConfirmDate"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script>
import moment from 'moment'
import { Dialog, Toast } from 'vant'
import { addGrowthRecordReq, deleteGrowthRecordReq, getGrowthRecordDetailReq, updateGrowthRecordReq } from '@/api/baby'

export default {
  name: 'MobileBodyMetricsEdit',
  props: {
    mode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      record: null,
      formDate: new Date(),
      showDatePicker: false,
      fileList: [],
      originalPhoto: '',
      form: {
        measure_date: '',
        height_cm: '',
        weight_kg: '',
        head_circumference_cm: ''
      }
    }
  },
  computed: {
    recordId() {
      return this.$route.params.id
    },
    isEdit() {
      return this.mode !== 'add' && !!this.recordId
    }
  },
  mounted() {
    if (this.isEdit) {
      this.load()
    } else {
      this.initAdd()
    }
  },
  methods: {
    onClickLeft() {
      this.$router.push('/mobile/functions/bodymetrics')
    },
    formatDateCN(dateStr) {
      if (!dateStr) return ''
      return moment(dateStr).format('YYYY年M月D日')
    },
    onConfirmDate(value) {
      this.form.measure_date = moment(value).format('YYYY-MM-DD')
      this.showDatePicker = false
    },
    initAdd() {
      this.record = null
      this.form.measure_date = moment().format('YYYY-MM-DD')
      this.form.height_cm = ''
      this.form.weight_kg = ''
      this.form.head_circumference_cm = ''
      this.originalPhoto = ''
      this.fileList = []
      this.formDate = new Date()
    },
    async load() {
      this.loading = true
      try {
        const res = await getGrowthRecordDetailReq(this.recordId)
        if (res.code !== 200) {
          Toast.fail(res.msg || '加载失败')
          return
        }
        const data = res.data || {}
        this.record = data
        this.form.measure_date = data.measure_date || ''
        this.form.height_cm = data.height_cm === null || data.height_cm === undefined ? '' : `${data.height_cm}`
        this.form.weight_kg = data.weight_kg === null || data.weight_kg === undefined ? '' : `${data.weight_kg}`
        this.form.head_circumference_cm = data.head_circumference_cm === null || data.head_circumference_cm === undefined ? '' : `${data.head_circumference_cm}`
        this.originalPhoto = data.photo || ''
        this.fileList = this.originalPhoto ? [{ url: this.originalPhoto }] : []
        if (this.form.measure_date) {
          this.formDate = moment(this.form.measure_date, 'YYYY-MM-DD').toDate()
        }
      } catch (e) {
        Toast.fail('加载失败')
      } finally {
        this.loading = false
      }
    },
    async save() {
      if (this.loading) return
      if (!this.form.measure_date) {
        Toast('请选择日期')
        return
      }
      if (!this.form.height_cm && !this.form.weight_kg && !this.form.head_circumference_cm) {
        Toast('至少填写一项')
        return
      }

      const formData = new FormData()
      formData.append('measure_date', this.form.measure_date)
      formData.append('height_cm', this.form.height_cm || '')
      formData.append('weight_kg', this.form.weight_kg || '')
      formData.append('head_circumference_cm', this.form.head_circumference_cm || '')

      const hasNewFile = this.fileList.length > 0 && this.fileList[0].file
      if (hasNewFile) {
        formData.append('photo', this.fileList[0].file)
      } else if (this.isEdit && this.originalPhoto && this.fileList.length === 0) {
        formData.append('remove_photo', '1')
      }

      this.loading = true
      try {
        const res = this.isEdit ? await updateGrowthRecordReq(this.recordId, formData) : await addGrowthRecordReq(formData)
        if (res.code === 200) {
          Toast.success('保存成功')
          this.$router.push('/mobile/functions/bodymetrics')
        } else {
          Toast.fail(res.msg || '保存失败')
        }
      } catch (e) {
        Toast.fail('保存失败')
      } finally {
        this.loading = false
      }
    },
    remove() {
      Dialog.confirm({
        title: '提示',
        message: '确认删除该记录吗？'
      }).then(async() => {
        this.loading = true
        try {
          const res = await deleteGrowthRecordReq(this.recordId)
          if (res.code === 200) {
            Toast.success('删除成功')
            this.$router.push('/mobile/functions/bodymetrics')
          } else {
            Toast.fail(res.msg || '删除失败')
          }
        } catch (e) {
          Toast.fail('删除失败')
        } finally {
          this.loading = false
        }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.mobile-body-metrics-edit {
  min-height: 100vh;
  background: #f7f8fa;
}

.form-group {
  margin-top: 10px;
}

.uploader-card {
  margin: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
}

.uploader-title {
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
}

.unit {
  color: #999;
  font-size: 12px;
}

.actions {
  padding: 10px 12px 24px;
}

.delete-btn {
  border-color: #ff6b81;
  color: #ff6b81;
}
</style>

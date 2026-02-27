<template>
  <div class="mobile-me">
    <div class="user-profile">
      <van-image
        round
        width="5rem"
        height="5rem"
        src="https://img.yzcdn.cn/vant/cat.jpeg"
      />
      <div class="username">Admin</div>
    </div>

    <div v-if="babyInfo.id" class="baby-card-wrapper" @click="openEditPopup">
      <div class="baby-card-inner">
        <div class="baby-card-left">
          <van-image
            round
            width="40"
            height="40"
            fit="cover"
            :src="babyInfo.image || 'https://img.yzcdn.cn/vant/cat.jpeg'"
          />
        </div>
        <div class="baby-card-center">
          <span class="status-tag">{{ babyInfo.status || '育儿中' }}</span>
          <span class="baby-name">{{ babyInfo.name || '宝宝' }}</span>
        </div>
        <div class="baby-card-right">
          <span class="baby-age-text">{{ babyAge }}</span>
          <van-icon name="edit" color="#969799" />
        </div>
      </div>
    </div>
    <div v-else class="baby-card-wrapper" @click="openEditPopup">
      <div class="baby-card-inner">
        <span>点击添加宝宝信息</span>
        <van-icon name="add-o" />
      </div>
    </div>

    <van-cell-group title="我的服务" inset style="margin-top: 12px;">
      <van-cell title="个人资料" is-link icon="user-o" />
      <van-cell title="系统设置" is-link icon="setting-o" />
      <van-cell title="退出登录" is-link icon="revoke" @click="logout" />
    </van-cell-group>

    <!-- Edit Popup -->
    <van-popup v-model="showEditPopup" position="bottom" round :style="{ height: '90%' }">
      <div class="popup-content">
        <div class="popup-header">
          <van-icon name="arrow-left" size="20" @click="showEditPopup = false" />
          <span class="popup-title-text">宝宝信息</span>
          <span />
        </div>

        <van-form @submit="onSaveBabyInfo">
          <div class="avatar-upload-container">
            <van-uploader v-model="fileList" :max-count="1" :after-read="afterRead">
              <div class="avatar-wrapper">
                <van-image
                  round
                  width="80"
                  height="80"
                  fit="cover"
                  :src="fileList.length ? fileList[0].content || fileList[0].url : 'https://img.yzcdn.cn/vant/cat.jpeg'"
                />
                <div class="camera-icon"><van-icon name="photograph" /></div>
              </div>
            </van-uploader>
          </div>

          <van-cell-group inset>
            <van-cell title="当前状态" :value="babyInfo.status || '已出生'" is-link />
            <van-field
              v-model="editForm.name"
              name="name"
              label="宝宝昵称"
              placeholder="请输入昵称"
              input-align="right"
              :rules="[{ required: true, message: '请填写昵称' }]"
            />
            <van-field
              readonly
              clickable
              name="birthday"
              :value="editForm.birthday"
              label="宝宝生日"
              placeholder="点击选择日期"
              input-align="right"
              :rules="[{ required: true, message: '请选择日期' }]"
              @click="showCalendar = true"
            />
            <van-field
              readonly
              clickable
              name="gender"
              :value="formatGender(editForm.gender)"
              label="宝宝性别"
              placeholder="点击选择性别"
              input-align="right"
              @click="showGenderPicker = true"
            />
            <van-field
              readonly
              clickable
              name="birth_week"
              :value="editForm.birth_week + '周'"
              label="出生孕周"
              placeholder="点击选择孕周"
              input-align="right"
              @click="showWeekPicker = true"
            />

            <van-cell center title="开启敏宝特护模式" label="您将收到更多关于敏宝特护的内容">
              <template #right-icon>
                <van-switch v-model="editForm.is_sensitive" size="24" />
              </template>
            </van-cell>

            <van-field
              v-model="editForm.birth_weight"
              name="birth_weight"
              label="出生体重kg"
              placeholder="选填"
              type="number"
              input-align="right"
            />
            <van-field
              v-model="editForm.birth_height"
              name="birth_height"
              label="出生身高cm"
              placeholder="选填"
              type="number"
              input-align="right"
            />
            <van-field
              readonly
              clickable
              name="is_only_child"
              :value="editForm.is_only_child ? '是' : '否'"
              label="独生子女"
              placeholder="点击选择"
              input-align="right"
              @click="showOnlyChildPicker = true"
            />
          </van-cell-group>

          <div style="margin: 30px 16px;">
            <van-button round block type="danger" color="#FF6B6B" native-type="submit">
              保存
            </van-button>
          </div>
        </van-form>
      </div>

      <!-- Pickers -->
      <van-calendar v-model="showCalendar" :min-date="minDate" :max-date="maxDate" color="#FF6B6B" @confirm="onConfirmDate" />

      <van-popup v-model="showWeekPicker" position="bottom">
        <van-picker
          show-toolbar
          :columns="weekColumns"
          @confirm="onConfirmWeek"
          @cancel="showWeekPicker = false"
        />
      </van-popup>

      <van-popup v-model="showGenderPicker" position="bottom">
        <van-picker
          show-toolbar
          :columns="['小王子', '小公主']"
          @confirm="onConfirmGender"
          @cancel="showGenderPicker = false"
        />
      </van-popup>

      <van-popup v-model="showOnlyChildPicker" position="bottom">
        <van-picker
          show-toolbar
          :columns="onlyChildColumns"
          @confirm="onConfirmOnlyChild"
          @cancel="showOnlyChildPicker = false"
        />
      </van-popup>

    </van-popup>
  </div>
</template>

<script>
import { getBabyInfoReq, updateBabyInfoReq } from '@/api/baby'

export default {
  data() {
    return {
      babyInfo: {},
      showEditPopup: false,
      editForm: {
        name: '',
        birthday: '',
        gender: 'F',
        birth_weight: 3000,
        birth_height: 50,
        birth_week: 40,
        is_sensitive: false,
        is_only_child: false
      },
      fileList: [],
      showCalendar: false,
      showWeekPicker: false,
      showGenderPicker: false,
      showOnlyChildPicker: false,
      weekColumns: Array.from({ length: 42 }, (_, i) => `${i + 1}周`),
      onlyChildColumns: ['是', '否'],
      minDate: new Date(2010, 0, 1),
      maxDate: new Date()
    }
  },
  computed: {
    babyAge() {
      if (!this.babyInfo || !this.babyInfo.birthday) return ''
      const birth = new Date(this.babyInfo.birthday)
      const now = new Date()
      let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
      if (now.getDate() < birth.getDate()) months--
      if (months < 0) return '未出生'
      const years = Math.floor(months / 12)
      const m = months % 12
      if (years > 0) return `${years}岁${m}个月`
      return `${m}个月`
    }
  },
  mounted() {
    this.fetchBabyInfo()
  },
  methods: {
    async fetchBabyInfo() {
      try {
        const res = await getBabyInfoReq()
        if (res.data) {
          this.babyInfo = res.data
        }
      } catch (error) {
        console.error(error)
      }
    },
    openEditPopup() {
      if (this.babyInfo && this.babyInfo.name) {
        this.editForm = { ...this.babyInfo }
      }
      if (!this.editForm.gender) this.editForm.gender = 'F'
      // Ensure defaults for required fields if they are missing
      if (!this.editForm.birth_weight) this.editForm.birth_weight = 3000
      if (!this.editForm.birth_height) this.editForm.birth_height = 50
      if (this.editForm.birth_week === undefined) this.editForm.birth_week = 40
      if (this.editForm.is_sensitive === undefined) this.editForm.is_sensitive = false
      if (this.editForm.is_only_child === undefined) this.editForm.is_only_child = false

      this.fileList = []
      if (this.babyInfo && this.babyInfo.image) {
        // Construct full URL if needed, assuming absolute URL from backend or relative
        // If relative starting with /media, we might need to adjust based on environment
        // For now, use as is if it works
        this.fileList.push({
          url: this.babyInfo.image,
          isImage: true,
          name: 'current_image'
        })
      }

      this.showEditPopup = true
    },
    afterRead(file) {
      // console.log(file)
    },
    onConfirmDate(date) {
      // Format date to YYYY-MM-DD
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      this.editForm.birthday = `${year}-${month}-${day}`
      this.showCalendar = false
    },
    onConfirmWeek(value) {
      this.editForm.birth_week = parseInt(value)
      this.showWeekPicker = false
    },
    onConfirmGender(value) {
      this.editForm.gender = value === '小王子' ? 'M' : 'F'
      this.showGenderPicker = false
    },
    onConfirmOnlyChild(value) {
      this.editForm.is_only_child = value === '是'
      this.showOnlyChildPicker = false
    },
    async onSaveBabyInfo() {
      const formData = new FormData()
      formData.append('name', this.editForm.name)
      formData.append('birthday', this.editForm.birthday)
      formData.append('gender', this.editForm.gender)
      formData.append('birth_weight', this.editForm.birth_weight)
      formData.append('birth_height', this.editForm.birth_height)
      formData.append('birth_week', this.editForm.birth_week)
      formData.append('is_sensitive', this.editForm.is_sensitive)
      formData.append('is_only_child', this.editForm.is_only_child)

      if (this.fileList.length > 0 && this.fileList[0].file) {
        formData.append('image', this.fileList[0].file)
      }

      try {
        await updateBabyInfoReq(formData)
        this.showEditPopup = false
        this.fetchBabyInfo()
        this.$toast.success('修改成功')
      } catch (error) {
        this.$toast.fail('修改失败')
      }
    },
    formatGender(val) {
      if (val === 'M') return '小王子'
      if (val === 'F') return '小公主'
      return '未知'
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>

<style scoped>
.mobile-me {
  padding-top: 20px;
  padding-bottom: 20px;
  background-color: #f7f8fa;
  min-height: 100vh;
}
.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}
.username {
  margin-top: 10px;
  font-weight: bold;
  font-size: 18px;
}
.popup-content {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
}
.popup-title-text {
  flex: 1;
  text-align: center;
}
.avatar-upload-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}
.avatar-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
}
.camera-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #FF6B6B;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}
.baby-card-wrapper {
  margin: 12px 16px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.baby-card-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.baby-card-left {
  margin-right: 12px;
}
.baby-card-center {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.status-tag {
  font-size: 12px;
  color: #666;
}
.baby-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.baby-card-right {
  display: flex;
  align-items: center;
  color: #999;
}
.baby-age-text {
  margin-right: 8px;
  font-size: 14px;
}
</style>

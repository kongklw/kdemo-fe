<template>
  <div class="mobile-album">
    <!-- 1. Header Section -->
    <div class="album-header">
      <div class="header-top">
        <van-icon name="arrow-left" size="24" color="#333" class="back-btn" @click="$router.back()" />
        <van-button size="small" round color="#fff" text-color="#333" class="invite-btn">邀请亲友</van-button>
      </div>
      <div class="header-profile">
        <van-image
          round
          width="80"
          height="80"
          :src="babyInfo.image || defaultAvatar"
          fit="cover"
          class="avatar"
        />
        <div class="name">{{ babyInfo.name || '宝宝' }}</div>
        <div v-if="currentAge" class="age">{{ currentAge }}</div>
      </div>
    </div>

    <!-- 2. Navigation Grid -->
    <div class="nav-section">
      <van-grid :column-num="5" :border="false">
        <van-grid-item icon="photo-o" text="云相册" />
        <van-grid-item icon="star-o" text="大事记" />
        <van-grid-item icon="clock-o" text="时光回忆" />
        <van-grid-item icon="gift-o" text="一键拜年" />
        <van-grid-item icon="bar-chart-o" text="身高体重" />
      </van-grid>
    </div>

    <!-- 3 & 4. Timeline List -->
    <van-pull-refresh v-model="refreshing" style="min-height: 60vh;" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="timeline-container">
          <div v-for="(item, index) in list" :key="index" class="timeline-row">
            <!-- Date Column -->
            <div class="date-col">
              <div class="day">{{ item.happened_at | parseDay }}</div>
              <div class="month-year">
                <span>{{ item.happened_at | parseMonth }}月</span>
                <span v-if="!isCurrentYear(item.happened_at)" class="year">{{ item.happened_at | parseYear }}</span>
              </div>
            </div>

            <!-- Content Column -->
            <div class="content-col">
              <div v-if="item.age_description" class="age-line">
                <span class="age-tag">{{ item.age_description }}</span>
              </div>

              <div class="content-body">
                <div v-if="item.content" class="content-text">{{ item.content }}</div>

                <div v-if="item.tags && item.tags.length" class="content-tags">
                  <van-tag
                    v-for="tag in item.tags"
                    :key="tag"
                    round
                    color="#F0F2F5"
                    text-color="#1989FA"
                    style="margin-right: 6px; margin-bottom: 6px;"
                  >
                    <van-icon name="flag-o" style="margin-right: 2px" />
                    {{ tag }}
                  </van-tag>
                </div>

                <div v-if="item.photos && item.photos.length" class="content-images">
                  <!-- Single Image -->
                  <van-image
                    v-if="item.photos.length === 1"
                    width="100%"
                    height="200"
                    fit="cover"
                    :src="item.photos[0].image"
                    radius="8"
                    @click="previewImage(item.photos[0].image, item.photos)"
                  />
                  <!-- Multiple Images Grid -->
                  <div v-else class="image-grid">
                    <van-image
                      v-for="photo in item.photos"
                      :key="photo.id"
                      width="32%"
                      height="100"
                      fit="cover"
                      :src="photo.image"
                      radius="4"
                      style="margin-bottom: 4px;"
                      @click="previewImage(photo.image, item.photos)"
                    />
                  </div>
                </div>
              </div>

              <div class="content-footer">
                <div class="visibility-tag">
                  <van-icon name="eye-o" /> {{ formatVisibility(item.visibility) }}
                </div>
                <van-popover
                  v-model="item.showPopover"
                  trigger="click"
                  placement="left"
                  :actions="[{ text: '删除', icon: 'delete' }]"
                  @select="onSelectAction($event, item.id)"
                >
                  <template #reference>
                    <van-icon name="ellipsis" class="more-btn" />
                  </template>
                </van-popover>
              </div>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 5. Floating Action Button -->
    <div class="fab-btn" @click="openAddDialog">
      <div class="fab-icon"><van-icon name="plus" /></div>
      <div class="fab-text">记照片</div>
    </div>

    <!-- Add Record Popup (Keep functionality) -->
    <van-popup
      v-model="showAddDialog"
      position="bottom"
      :style="{ height: '100%' }"
    >
      <van-nav-bar
        title="记录照片"
        left-text="取消"
        right-text="发布"
        left-arrow
        @click-left="showAddDialog = false"
        @click-right="onAddSave"
      />
      <div class="form-content">
        <van-form ref="addForm">
          <van-field name="uploader" label="照片">
            <template #input>
              <van-uploader v-model="fileList" multiple :max-count="9" :after-read="onRead" />
            </template>
          </van-field>
          <van-field
            v-model="form.content"
            rows="3"
            autosize
            label="内容"
            type="textarea"
            placeholder="这一刻的想法..."
          />
          <van-field
            readonly
            clickable
            name="datetimePicker"
            :value="form.happened_at"
            label="时间"
            placeholder="点击选择时间"
            @click="showDatePicker = true"
          />
          <van-popup v-model="showDatePicker" position="bottom">
            <van-datetime-picker
              type="datetime"
              :value="currentDate"
              @confirm="onConfirmDate"
              @cancel="showDatePicker = false"
            />
          </van-popup>

          <van-field name="radio" label="谁可见">
            <template #input>
              <van-radio-group v-model="form.visibility" direction="horizontal">
                <van-radio name="public">公开</van-radio>
                <van-radio name="relatives">亲友</van-radio>
                <van-radio name="private">仅自己</van-radio>
              </van-radio-group>
            </template>
          </van-field>

          <van-field label="标签">
            <template #input>
              <div class="tags-input">
                <van-tag
                  v-for="(tag, index) in form.tags"
                  :key="index"
                  closeable
                  size="medium"
                  type="primary"
                  style="margin-right: 8px; margin-bottom: 8px;"
                  @close="removeTag(index)"
                >
                  {{ tag }}
                </van-tag>

                <van-tag
                  v-if="!form.tags.includes('宝宝第一次')"
                  plain
                  type="primary"
                  size="medium"
                  style="margin-right: 8px; margin-bottom: 8px;"
                  @click="addBabyFirstTag"
                >
                  宝宝第一次 <van-icon name="plus" />
                </van-tag>

                <van-tag
                  plain
                  type="default"
                  size="medium"
                  style="margin-right: 8px; margin-bottom: 8px;"
                  @click="showTagDialog = true"
                >
                  添加标签 <van-icon name="plus" />
                </van-tag>
              </div>
            </template>
          </van-field>

          <!-- Tag Input Dialog -->
          <van-dialog v-model="showTagDialog" title="添加标签" show-cancel-button @confirm="onConfirmTag">
            <van-field v-model="newTag" placeholder="请输入标签内容" />
          </van-dialog>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { getBabyAlbumsReq, addBabyAlbumReq, deleteBabyAlbumReq, getBabyInfoReq } from '@/api/baby'
import { parseTime } from '@/utils'
import { ImagePreview, Toast, Dialog } from 'vant'
import EXIF from 'exif-js'

export default {
  name: 'MobileAlbum',
  filters: {
    parseDay(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.getDate()
    },
    parseMonth(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return (date.getMonth() + 1)
    },
    parseYear(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.getFullYear()
    }
  },
  data() {
    return {
      babyInfo: {},
      defaultAvatar: 'https://img.yzcdn.cn/vant/cat.jpeg', // Placeholder
      list: [],
      loading: false,
      finished: false,
      refreshing: false,
      showAddDialog: false,
      showDatePicker: false,
      showTagDialog: false,
      newTag: '',
      currentDate: new Date(),
      fileList: [],
      form: {
        content: '',
        happened_at: parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}'),
        visibility: 'relatives',
        tags: []
      },
      commonTags: ['第一次', '生日', '旅行', '日常', '生病', '打疫苗', '玩耍']
    }
  },
  computed: {
    currentAge() {
      if (!this.babyInfo.birthday) return ''
      const birth = new Date(this.babyInfo.birthday)
      const now = new Date()

      let years = now.getFullYear() - birth.getFullYear()
      let months = now.getMonth() - birth.getMonth()
      let days = now.getDate() - birth.getDate()

      if (days < 0) {
        months--
        // approximate days in previous month
        days += 30
      }
      if (months < 0) {
        years--
        months += 12
      }

      let age = ''
      if (years > 0) age += years + '岁'
      if (months > 0) age += months + '个月'
      if (years === 0 && months === 0) age += days + '天'

      return age || '出生当天'
    }
  },
  created() {
    this.getBabyInfo()
  },
  methods: {
    getBabyInfo() {
      getBabyInfoReq().then(res => {
        if (res.data) {
          // If it's a list (unlikely based on backend), take first. If object, use it directly.
          this.babyInfo = Array.isArray(res.data) ? (res.data[0] || {}) : res.data
        }
      })
    },
    isCurrentYear(dateStr) {
      if (!dateStr) return true
      return new Date(dateStr).getFullYear() === new Date().getFullYear()
    },
    onLoad() {
      if (this.refreshing) {
        this.list = []
        this.refreshing = false
      }

      getBabyAlbumsReq().then(res => {
        this.list = res.data.map(item => ({
          ...item,
          showPopover: false // for menu
        }))
        this.finished = true
        this.loading = false
      }).catch(() => {
        this.loading = false
        this.finished = true
      })
    },
    onRefresh() {
      this.finished = false
      this.loading = true
      this.onLoad()
    },
    openAddDialog() {
      this.form = {
        content: '',
        happened_at: parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}'),
        visibility: 'relatives',
        tags: []
      }
      this.currentDate = new Date()
      this.fileList = []
      this.showAddDialog = true
    },
    onConfirmDate(value) {
      this.form.happened_at = parseTime(value, '{y}-{m}-{d} {h}:{i}:{s}')
      this.showDatePicker = false
    },
    onRead(file) {
      const files = Array.isArray(file) ? file : [file]
      if (files.length === 0) return

      const firstFile = files[0].file
      const self = this
      EXIF.getData(firstFile, function() {
        const dateStr = EXIF.getTag(this, 'DateTimeOriginal')
        if (dateStr) {
          // Format: "YYYY:MM:DD HH:MM:SS" -> "YYYY-MM-DD HH:mm:ss"
          // Note: IOS sometimes uses different format or none.
          // Standard EXIF is "YYYY:MM:DD HH:MM:SS"
          // Actually replace first two colons with dashes: YYYY-MM-DD
          // The string is "2023:01:01 12:00:00"
          // substring(0, 10) is "2023:01:01" -> replace : with -
          const datePart = dateStr.substring(0, 10).replace(/:/g, '-')
          const timePart = dateStr.substring(11, 19)
          const finalStr = `${datePart} ${timePart}`

          self.form.happened_at = finalStr
          self.currentDate = new Date(finalStr.replace(/-/g, '/')) // Safari/IOS needs / for date parsing

          Toast('已根据照片自动设置时间')
        }
      })
    },
    addBabyFirstTag() {
      if (!this.form.tags.includes('宝宝第一次')) {
        this.form.tags.push('宝宝第一次')
      }
    },
    removeTag(index) {
      this.form.tags.splice(index, 1)
    },
    onConfirmTag() {
      if (this.newTag) {
        if (!this.form.tags.includes(this.newTag)) {
          this.form.tags.push(this.newTag)
        }
        this.newTag = ''
      }
    },
    onAddSave() {
      if (this.fileList.length === 0 && !this.form.content) {
        Toast('请至少填写内容或上传照片')
        return
      }

      Toast.loading({
        message: '发布中...',
        forbidClick: true
      })

      const formData = new FormData()
      formData.append('content', this.form.content)
      formData.append('happened_at', this.form.happened_at)
      formData.append('visibility', this.form.visibility)

      if (this.form.tags && this.form.tags.length > 0) {
        formData.append('tags', JSON.stringify(this.form.tags))
      }

      this.fileList.forEach(file => {
        formData.append('images', file.file)
      })

      addBabyAlbumReq(formData).then(() => {
        Toast.success('发布成功')
        this.showAddDialog = false
        this.onRefresh()
      }).catch(() => {
        Toast.fail('发布失败')
      })
    },
    previewImage(current, photos) {
      const images = photos.map(p => p.image)
      ImagePreview({
        images,
        startPosition: images.indexOf(current)
      })
    },
    onSelectAction(action, id) {
      if (action.text === '删除') {
        this.handleDelete(id)
      }
    },
    handleDelete(id) {
      Dialog.confirm({
        title: '提示',
        message: '确定删除这条记录吗？'
      })
        .then(() => {
          deleteBabyAlbumReq(id).then(() => {
            Toast.success('删除成功')
            this.onRefresh()
          })
        })
        .catch(() => {
          // on cancel
        })
    },
    formatVisibility(val) {
      const map = {
        'public': '公开',
        'relatives': '亲友',
        'private': '仅自己'
      }
      return map[val] || val
    }
  }
}
</script>

<style scoped>
.mobile-album {
    background: #fff;
    min-height: 100vh;
    padding-bottom: 80px; /* space for FAB */
}

/* Header */
.album-header {
    background: linear-gradient(to right, #ffe4e6, #fff0f5);
    padding: 20px;
    text-align: center;
}
.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}
.back-btn {
    font-weight: bold;
}
.header-profile {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.header-profile .avatar {
    margin-bottom: 10px;
    border: 2px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.header-profile .name {
    font-size: 20px;
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
}
.header-profile .age {
    font-size: 14px;
    color: #666;
    background: rgba(255,255,255,0.6);
    padding: 2px 10px;
    border-radius: 12px;
}
.invite-btn {
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

/* Nav */
.nav-section {
    margin-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
}

/* Timeline */
.timeline-container {
    padding: 10px 20px;
}
.timeline-row {
    display: flex;
    margin-bottom: 30px;
}
.date-col {
    width: 50px;
    text-align: left;
    margin-right: 15px;
    flex-shrink: 0;
}
.date-col .day {
    font-size: 28px;
    font-weight: bold;
    line-height: 1;
    color: #333;
}
.date-col .month-year {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
}
.content-col {
    flex: 1;
}
.age-line {
    margin-bottom: 8px;
}
.age-tag {
    color: #999;
    font-size: 13px;
}
.content-body {
    margin-bottom: 10px;
}
.content-text {
    font-size: 16px;
    color: #333;
    line-height: 1.6;
    margin-bottom: 8px;
    white-space: pre-wrap;
}
.tags-row {
    margin-bottom: 8px;
}
.image-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}
.content-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #ccc;
    font-size: 12px;
}
.more-btn {
    font-size: 20px;
    padding: 5px;
}

/* FAB */
.fab-btn {
    position: fixed;
    bottom: 30px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(to bottom right, #ff9a9e, #fad0c4);
    box-shadow: 0 4px 15px rgba(255, 154, 158, 0.4);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;
    z-index: 999;
}
.fab-icon {
    font-size: 24px;
    line-height: 1;
}
.fab-text {
    font-size: 10px;
    margin-top: 2px;
}

/* Form */
.form-content {
    padding-top: 10px;
}
.tags-input {
    display: flex;
    flex-wrap: wrap;
}
</style>

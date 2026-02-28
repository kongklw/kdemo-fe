<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        + 记录照片
      </el-button>
    </div>

    <div class="timeline-container">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in list"
          :key="index"
          :timestamp="activity.happened_at | parseTime('{y}-{m}-{d} {h}:{i}')"
          placement="top"
        >
          <el-card>
            <h4>{{ activity.content }}</h4>
            <div v-if="activity.tags && activity.tags.length > 0" style="margin-bottom: 10px;">
              <el-tag v-for="tag in activity.tags" :key="tag" size="small" style="margin-right: 5px;">{{ tag }}</el-tag>
            </div>
            <div v-if="activity.photos && activity.photos.length > 0" class="photos-container">
              <el-image
                v-for="photo in activity.photos"
                :key="photo.id"
                style="width: 100px; height: 100px; margin-right: 10px; margin-bottom: 10px;"
                :src="photo.image"
                :preview-src-list="activity.photos.map(p => p.image)"
                fit="cover"
              />
            </div>
            <div style="margin-top: 10px; color: #999; font-size: 12px;">
              <span style="margin-right: 10px;">{{ activity.visibility }}</span>
              <el-button type="text" icon="el-icon-delete" style="color: #f56c6c;" @click="handleDelete(activity.id)">删除</el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <div v-if="list.length === 0" style="text-align: center; color: #999; margin-top: 50px;">
        暂无记录，快去添加吧
      </div>
    </div>

    <el-dialog title="记录照片" :visible.sync="dialogFormVisible" width="90%" :close-on-click-modal="false">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="80px" style="width: 100%;">
        <el-form-item label="照片" prop="photos">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleRemove"
            :file-list="fileList"
            multiple
          >
            <i class="el-icon-plus" />
          </el-upload>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="temp.content" type="textarea" :rows="4" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="时间" prop="happened_at">
          <el-date-picker
            v-model="temp.happened_at"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%;"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="谁可见" prop="visibility">
          <el-radio-group v-model="temp.visibility">
            <el-radio label="public">公开</el-radio>
            <el-radio label="relatives">亲友</el-radio>
            <el-radio label="private">仅自己</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="temp.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入标签"
            style="width: 100%"
          >
            <el-option
              v-for="item in tagOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="loading" @click="createData">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getBabyAlbumsReq, addBabyAlbumReq, deleteBabyAlbumReq } from '@/api/baby'
import { parseTime } from '@/utils'

export default {
  name: 'BabyAlbum',
  filters: {
    parseTime
  },
  data() {
    return {
      list: [],
      listLoading: true,
      dialogFormVisible: false,
      loading: false,
      temp: {
        content: '',
        happened_at: '',
        visibility: 'relatives',
        tags: []
      },
      fileList: [],
      tagOptions: [
        { value: '第一次', label: '第一次' },
        { value: '生日', label: '生日' },
        { value: '旅行', label: '旅行' },
        { value: '日常', label: '日常' }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getBabyAlbumsReq().then(response => {
        this.list = response.data
        this.listLoading = false
      })
    },
    handleCreate() {
      this.temp = {
        content: '',
        happened_at: parseTime(new Date()),
        visibility: 'relatives',
        tags: []
      }
      this.fileList = []
      this.dialogFormVisible = true
    },
    handleFileChange(file, fileList) {
      this.fileList = fileList
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    createData() {
      this.loading = true
      const formData = new FormData()
      formData.append('content', this.temp.content)
      formData.append('happened_at', this.temp.happened_at)
      formData.append('visibility', this.temp.visibility)

      // Handle tags - ensure it's sent as a way backend understands
      // Since backend expects JSON string or list, but FormData converts everything to string
      // We can append tags one by one or as a JSON string
      if (this.temp.tags && this.temp.tags.length > 0) {
        // Send as JSON string to be safe with the backend logic I wrote
        // "['tag1', 'tag2']"
        // Or I can change backend to handle getlist('tags')
        // My backend logic:
        // if tags.startswith('['): data['tags'] = json.loads(tags)
        // else: data['tags'] = [t.strip() for t in tags.split(',') if t.strip()]

        // Let's send as JSON string
        formData.append('tags', JSON.stringify(this.temp.tags))
      }

      this.fileList.forEach(file => {
        // file.raw is the actual File object
        formData.append('images', file.raw)
      })

      addBabyAlbumReq(formData).then(response => {
        this.dialogFormVisible = false
        this.loading = false
        this.$notify({
          title: 'Success',
          message: 'Created Successfully',
          type: 'success',
          duration: 2000
        })
        this.getList()
      }).catch(() => {
        this.loading = false
      })
    },
    handleDelete(id) {
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteBabyAlbumReq(id).then(() => {
          this.$notify({
            title: 'Success',
            message: 'Deleted Successfully',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      })
    }
  }
}
</script>

<style scoped>
.timeline-container {
  padding: 20px;
}
.photos-container {
  display: flex;
  flex-wrap: wrap;
}
</style>

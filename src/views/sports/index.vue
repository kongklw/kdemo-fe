<template>
  <div class="app-container">
    <el-row>
      <el-button type="primary" @click="dialogFormVisible = true">Add Sport</el-button>

    </el-row>

    <el-dialog title="Add Sport Form" :visible.sync="dialogFormVisible" destroy-on-close="true">
      <el-form :model="form">
        <el-form-item label="Sport Name" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="country" :label-width="formLabelWidth">
          <el-input v-model="form.country" autocomplete="off" />
          <!-- <el-select v-model="form.country" placeholder="">
                        <el-option label="区域一" value="shanghai"></el-option>
                        <el-option label="区域二" value="beijing"></el-option>
                    </el-select> -->
        </el-form-item>
        <el-form-item label="Popularity" :label-width="formLabelWidth">

          <div class="block">
            <el-rate v-model="form.popularity" />
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="createAddSport">确 定</el-button>
      </div>
    </el-dialog>

    <el-table :data="tableData" style="width: 100%" :row-class-name="tableRowClassName">
      <el-table-column prop="name" label="Sport Name" width="180" />
      <el-table-column prop="country" label="Country" width="180" />
      <el-table-column prop="popularity" label="Popularity">
        <template slot-scope="scope">
          <div class="block">
            <el-rate v-model="scope.row.popularity" />
            <!-- <el-rate value={{ scope.row.popularity }}></el-rate> -->
          </div>
          <!-- <el-button size="mini" type="warning" @click="jump(scope.row.id)">查看</el-button>
                    <el-button size="mini" type="success"
                        @click="acceptActivity(scope.$index, scope.row.id)">同意</el-button>
                    <el-button size="mini" type="danger"
                        @click="refuseActivity(scope.$index, scope.row.id)">拒绝</el-button> -->
        </template>

      </el-table-column>

    </el-table>

  </div>
</template>

<script>

import { addSport, sportList } from '@/api/sport'

export default {
  data() {
    return {
      dialogFormVisible: false,
      form: {
        name: '',
        country: '',
        popularity: 0
      },

      tableData: [],
      formLabelWidth: '120px'
    }
  },
  created() {
    this.showSportList()
  },
  methods: {
    showSportList() {
      sportList().then(res => {
        console.log(res)
        if (res.code === 200) {
          this.tableData = res.data
        }
      })
    },

    tableRowClassName({ row, rowIndex }) {
      if (rowIndex === 1) {
        return 'warning-row'
      } else if (rowIndex === 3) {
        return 'success-row'
      }
      return ''
    },

    createAddSport() {
      const data = { ...this.form }

      addSport(data).then(res => {
        if (res.code === 200) {
          // 重新展示table list
          this.showSportList()
          this.dialogFormVisible = false
        }
      })
    }

  }

}
</script>

<style>
.el-table .warning-row {
    background: oldlace;
}

.el-table .success-row {
    background: #f0f9eb;
}
</style>

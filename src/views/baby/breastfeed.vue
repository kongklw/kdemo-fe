<template>
  <div class="app-container">

    <el-table :data="tableData" border style="width: 100%">
      <el-table-column fixed label="日期" width="150">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <el-link type="primary" @click="handleLinkClick(scope.row)"><span style="margin-left: 10px">{{ scope.row.date }}</span></el-link>

        </template>
      </el-table-column>

      <el-table-column prop="total_volumn" label="总奶量" width="120" />

      <el-table-column label="事项" width="500">
        <template slot-scope="scope">
          <!-- <label for="">{{items }}</label> -->

          <el-label>AD&nbsp;&nbsp;&nbsp;&nbsp; <el-tag :type="scope.row.items.ad ? 'success' : 'danger'">
            {{ scope.row.ad == true ? "Yes" : "No" }}</el-tag> </el-label>&nbsp;&nbsp;&nbsp;&nbsp;
          <label for="">钙 <el-tag :type="scope.row.items.calcium ? 'success' : 'danger'"> {{ scope.row.calcium == true
            ? "Yes" : "No" }}</el-tag> </label>
          <label for="">益生菌 <el-tag :type="scope.row.items.probiotics ? 'success' : 'danger'"> {{ scope.row.items.probiotics == true
            ? "Yes" : "No" }}</el-tag> </label>
          <label for="">大便 <el-tag :type="scope.row.items.stool ? 'success' : 'danger'"> {{ scope.row.items.stool == true
            ? "Yes" : "No" }}</el-tag> </label>

        </template>
      </el-table-column>

      <el-table-column fixed="right" label="操作" width="100">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="handleClick(scope.row)">查看</el-button>
          <el-button type="text" size="small">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<style>
.el-table .warning-row {
    background: oldlace;
}

.el-table .success-row {
    background: #f0f9eb;
}
</style>

<script>

export default {

  data() {
    return {
      activeNames: ['1'],
      tableData: [{
        date: '2016-05-02',
        total_volumn: '800',

        items: { 'id': 1, 'ad': true, 'calcium': false, 'probiotics': true, 'stool': true }

      }, {
        date: '2016-05-04',
        total_volumn: '800',
        items: { 'id': 1, 'ad': true, 'calcium': false, 'probiotics': true, 'stool': false }
      }, {
        date: '2016-05-01',
        total_volumn: '800',
        items: { 'id': 1, 'ad': true, 'calcium': false, 'probiotics': true, 'stool': true }
      }]

    }
  },

  created() {

  },

  methods: {
    handleLinkClick(row) {
      console.log('click the link and data is ', row)
      this.$router.push({
        name: 'Details',
        query: {
          date: row.date
        }
      })
    },

    handleClick(row) {
      console.log(row)
    }
  }

}
</script>

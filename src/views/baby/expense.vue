<template>
    <div class="dashboard-editor-container">

        <!-- 查询form -->
        <div>
            <el-form :rules="rules" :inline="true" :model="formInline" ref="formInline" class="demo-form-inline">
                <el-form-item label="月份" prop="monthrange" required>

                    <el-date-picker v-model="formInline.monthrange" type="monthrange" align="right" unlink-panels
                        range-separator="至" start-placeholder="开始月份" end-placeholder="结束月份"
                        :picker-options="pickerOptions" value-format="yyyy-MM-dd">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="物品名称" prop="name">
                    <el-input v-model="formInline.name" placeholder="例如 尿不湿"></el-input>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="onSubmit('formInline')">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="dialogFormVisible = true">添加记录</el-button>
                </el-form-item>
            </el-form>




        </div>
        <div>

            <el-button @click="clearFilter">清除所有过滤器</el-button>
            <el-table ref="filterTable" :data="tableData" style="width: 100%">
                <el-table-column prop="date" label="消费日期" sortable width="180" column-key="date">
                </el-table-column>
                <el-table-column prop="name" label="物品名称" width="180">
                </el-table-column>
                <el-table-column prop="amount" label="金额" :formatter="formatter">
                </el-table-column>
                <el-table-column prop="tag" label="标签" width="100"
                    :filters="[{ text: '家', value: '家' }, { text: '公司', value: '公司' }]" :filter-method="filterTag"
                    filter-placement="bottom-end">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.tag === '家' ? 'primary' : 'success'" disable-transitions>{{
                            scope.row.tag }}</el-tag>
                    </template>
                </el-table-column>

            </el-table>
            <el-pagination background layout="prev, pager, next" :total="pageInfo.totalPage" :page-sizes="pageInfo.pageSizes"
                :page-size="pageSize" @current-change="handleCurrentChange" :current-page.sync="pageInfo.currentPage">
            </el-pagination>
        </div>
        <!-- modal 框 -->
        <div>
            <el-dialog title="购买记录" :visible.sync="dialogFormVisible" width="80%" destroy-on-close>
                <el-form :model="expenseForm" :label-width="formLabelWidth">
                    <el-form-item label="购买日期" required>
                        <el-date-picker v-model="expenseForm.order_time" type="date" placeholder="选择日期" align="left"
                            value-format="yyyy-MM-dd" style="width: 100%;" editable="false" />
                    </el-form-item>
                    <el-form-item label="名称" :label-width="formLabelWidth">
                        <el-input v-model="expenseForm.name" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="金额" :label-width="formLabelWidth">
                        <el-input v-model="expenseForm.amount" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="标签" :label-width="formLabelWidth">
                        <el-input v-model="expenseForm.tag" autocomplete="off" />
                    </el-form-item>
                </el-form>

                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addExpenseEvent">确 定</el-button>
                </div>
            </el-dialog>
        </div>



    </div>
</template>



<script>
import {
    addExpenseReq, showExpenseListReq
} from '@/api/baby'

export default {
    name: 'BabyExpense',
    components: {

    },

    data() {
        return {
            expenseForm: {
                order_time: '',
                name: '',
                amount: 0,
                tag: '',
            },
            dialogFormVisible: false,
            formLabelWidth: '80px',
            pageSizes: "[20, 50,100]",
            pageInfo: {  
                totalPage: 100,
                currentPage: 1,
                pageSize: "20",
            },
            // totalPage: 100,
            // currentPage: 1,
            // pageSizes: "[20, 50,100]",
            // pageSize: "20",
            formInline: {
                monthrange: '',
                name: '',
            },
            tableData: [{
                date: '2016-05-02',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1518 弄',
                tag: '家'
            }, {
                date: '2016-05-04',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1517 弄',
                tag: '公司'
            }, {
                date: '2016-05-01',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1519 弄',
                tag: '家'
            }, {
                date: '2016-05-03',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1516 弄',
                tag: '公司'
            }],

            pickerOptions: {
                shortcuts: [{
                    text: '本月',
                    onClick(picker) {
                        picker.$emit('pick', [new Date(), new Date()]);
                    }
                }, {
                    text: '今年至今',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date(new Date().getFullYear(), 0);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '近2个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setMonth(start.getMonth() - 2);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '近3个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setMonth(start.getMonth() - 3);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '近6个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setMonth(start.getMonth() - 6);
                        picker.$emit('pick', [start, end]);
                    }
                },
                {
                    text: '近一年',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setMonth(start.getMonth() - 12);
                        picker.$emit('pick', [start, end]);
                    }
                }]
            },

            rules: {

                monthrange: [
                    { required: true, message: '请选择查询起止月份', trigger: 'change' }
                ],
                // name: [
                //     { required: true, message: '请输入活动名称', trigger: 'blur' },
                //     { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
                // ],
            }

        }
    },
    mounted() {

    },

    created() {

    },

    destroyed() {

    },

    methods: {
        onSubmit(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    alert('submit!');
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
            console.log('submit!');
            console.log(this.formInline)
        },

        addExpenseEvent() {
            addExpenseReq(data).then((res) => {
                console.log('res')
                if (res.code === 200) {
                    this.tableData = res.data

                }

            })
        },

        handleCurrentChange(val) {
            console.log(`当前页: ${val}`);
        },


        clearFilter() {
            this.$refs.filterTable.clearFilter();
        },
        formatter(row, column) {
            return row.amount;
        },
        filterTag(value, row) {
            return row.tag === value;
        },
        // filterHandler(value, row, column) {
        //     const property = column['property'];
        //     return row[property] === value;
        // }
    }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
    padding: 32px;
    background-color: rgb(240, 242, 245);
    position: relative;

    .github-corner {
        position: absolute;
        top: 0px;
        border: 0;
        right: 0;
    }

    .chart-wrapper {
        background: #fff;
        padding: 16px 16px 0;
        margin-bottom: 32px;
    }
}

@media (max-width: 1024px) {
    .chart-wrapper {
        padding: 8px;
    }
}
</style>
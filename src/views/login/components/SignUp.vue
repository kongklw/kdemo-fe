<template>
  <div class="social-signup-container">
    <el-form ref="ruleForm" :model="ruleForm" status-icon :rules="rules" label-width="100px" class="demo-ruleForm">

      <el-form-item required label="用户名" prop="username">
        <el-input v-model="ruleForm.username" autocomplete="off" />
      </el-form-item>

      <el-form-item required label="密码" prop="password">
        <el-input v-model="ruleForm.password" type="password" autocomplete="off" />
      </el-form-item>

      <el-form-item required label="确认密码" prop="checkPass">
        <el-input v-model="ruleForm.checkPass" type="password" autocomplete="off" />
      </el-form-item>

      <el-form-item required label="手机号" prop="phone">
        <el-input v-model.number="ruleForm.phone" />
      </el-form-item>

      <el-form-item required label="邮箱" prop="email">
        <el-input v-model="ruleForm.email" />
      </el-form-item>

      <el-form-item>

        <el-button type="primary" @click="handleSignIn('ruleForm')">注册</el-button>
        <!-- <el-button type="primary" @click="submitForm('ruleForm')">注册</el-button> -->
        <el-button @click="resetForm('ruleForm')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { signin } from '@/api/user'

export default {
  name: 'SignUp',

  props: {
    parentSignUpDialog: Boolean
  },

  data() {
    var checkName = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('用户名不能为空'))
      } else {
        if (this.ruleForm.checkName !== '') {
          this.$refs.ruleForm.validateField('checkName')
        }
        callback()
      }
    }
    var checkEmail = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('邮箱不能为空'))
      } else {
        if (this.ruleForm.checkEmail !== '') {
          this.$refs.ruleForm.validateField('checkEmail')
        }
        callback()
      }
    }
    var checkPhone = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('手机号不能为空'))
      }
      setTimeout(() => {
        if (!Number.isInteger(value)) {
          callback(new Error('请输入手机号'))
        } else {
          if (value < 18) {
            callback(new Error('必须年满18岁'))
          } else {
            callback()
          }
        }
      }, 1000)
    }
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.ruleForm.checkPass !== '') {
          this.$refs.ruleForm.validateField('checkPass')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.ruleForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: ''
      },
      ruleForm: {
        username: '',
        password: '',
        checkPass: '',
        phone: '',
        email: ''
      },
      rules: {
        usename: [
          { validator: checkName, trigger: 'blur' }
        ],
        pass: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass2, trigger: 'blur' }
        ],
        phone: [
          { validator: checkPhone, trigger: 'blur' }
        ],
        email: [
          { validator: checkEmail, trigger: 'blur' }
        ]

      }
    }
  },

  methods: {
    handleLogin() {
      this.$store.dispatch('user/login', this.loginForm)
        .then(() => {
          this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
        })
        .catch(() => {

        })
    },

    handleSignIn(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          console.log('已经通过验证')
          console.log(this.ruleForm)
          const data = { ...this.ruleForm }

          signin(data).then(res => {
            console.log('res data', res)
            if (res.code === 200) {
              console.log('已经注册成功')
              // 关闭dialog对话框
              this.$emit('updateSignUpDialog', false)

              // 进行登录先给登录需要的数据form 进行赋值
              this.loginForm.username = this.ruleForm.username
              this.loginForm.password = this.ruleForm.password
              // 登录
              this.handleLogin()
            }
          })

          // this.loading = true
          // this.$store.dispatch('user/login', this.loginForm)
          //   .then(() => {
          //     this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
          //     this.loading = false
          //   })
          //   .catch(() => {
          //     this.loading = false
          //   })
        } else {
          console.log('注册信息有误,请检查!!')
          return false
        }
      })
    },

    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          alert('submit!')
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }

  }
}
</script>

<style lang="scss" scoped>
.social-signup-container {
  margin: 20px 0;

}
</style>

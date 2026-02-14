<template>
  <div class="sign-up-container">
    <el-form
      ref="ruleForm"
      :model="ruleForm"
      :rules="rules"
      label-position="top"
      class="sign-up-form"
    >
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="ruleForm.phone"
          placeholder="请输入手机号"
        >
          <i slot="prefix" class="el-icon-mobile-phone input-icon" />
        </el-input>
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input
          v-model="ruleForm.password"
          type="password"
          placeholder="请输入密码"
          autocomplete="off"
          show-password
        >
          <svg-icon slot="prefix" icon-class="password" class="input-icon" />
        </el-input>
      </el-form-item>

      <div class="form-actions">
        <el-button type="primary" class="submit-btn" :loading="loading" @click="handleSignIn('ruleForm')">立即注册</el-button>
      </div>
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
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        callback()
      }
    }

    const validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入手机号'))
      } else {
        const reg = /^1[3-9]\d{9}$/
        if (!reg.test(value)) {
          callback(new Error('请输入正确的手机号'))
        } else {
          callback()
        }
      }
    }

    return {
      loading: false,
      ruleForm: {
        username: '',
        password: '',
        phone: ''
      },
      rules: {
        password: [{ validator: validatePass, trigger: 'blur', required: true }],
        phone: [{ validator: validatePhone, trigger: 'blur', required: true }]
      }
    }
  },
  methods: {
    handleSignIn(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading = true
          // 自动生成随机用户名: 用户_手机号后4位_随机字符串
          const randomStr = Math.random().toString(36).substring(2, 6)
          const phoneSuffix = this.ruleForm.phone.slice(-4)
          this.ruleForm.username = `用户_${phoneSuffix}_${randomStr}`

          const data = { ...this.ruleForm }

          signin(data).then(res => {
            this.loading = false
            if (res.code === 200) {
              this.$message.success('注册成功，正在登录...')
              this.$emit('updateSignUpDialog', false)

              // 自动登录
              const loginData = {
                username: this.ruleForm.username,
                password: this.ruleForm.password
              }
              this.$store.dispatch('user/login', loginData)
                .then(() => {
                  this.$router.push('/')
                })
                .catch(() => {
                  // 登录失败不用做特殊处理，停留在当前页即可
                })
            }
          }).catch(() => {
            this.loading = false
          })
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
.sign-up-container {
  padding: 10px 10px 20px;
}

.sign-up-form {
  ::v-deep .el-form-item {
    margin-bottom: 22px;
  }

  ::v-deep .el-form-item__label {
    font-weight: 500;
    padding-bottom: 4px;
    line-height: 20px;
    font-size: 14px;
    color: #606266;
  }

  ::v-deep .el-input__inner {
    height: 44px;
    line-height: 44px;
    border-radius: 8px;
    border: 1px solid #dcdfe6;
    &:focus {
      border-color: #409EFF;
    }
  }

  .input-icon {
    font-size: 18px;
    margin-left: 2px;
    vertical-align: middle;
    color: #909399;
  }
}

.form-actions {
  margin-top: 35px;

  .submit-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
    letter-spacing: 4px;
    border-radius: 22px;
    background: linear-gradient(90deg, #409EFF 0%, #36a3f7 100%);
    border: none;
    box-shadow: 0 4px 10px rgba(64, 158, 255, 0.3);

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(1px);
    }
  }
}
</style>

<template>
  <div class="config-content">
    <a-form-model ref="ruleForm" :model="formData" :rules="rules">
      <div class="flex flex-between item-center">
        <div class="bold">企业微信配置</div>
        <a href="https://developer.work.weixin.qq.com/document/path/90665" target="_blank">帮助</a>
      </div>
      <a-form-model-item ref="corpid" label="企业ID" prop="corpid">
        <a-input v-model="formData.corpid" placeholder="请输入企业ID" />
      </a-form-model-item>

      <a-form-model-item ref="corpsecret" label="应用凭证Secret" prop="corpsecret">
        <a-input v-model="formData.corpsecret" placeholder="请输入应用凭证密钥" />
      </a-form-model-item>

      <a-form-model-item label="群聊id(用于骑手申请通知)">
        <a-input v-model="formData.verifyChatid" placeholder="请输入群聊id" />
      </a-form-model-item>

      <a-form-model-item>
        <a-button type="primary" size="large" :loading="loading" @click="submit">提交保存</a-button>
      </a-form-model-item>

      <a-form-model-item label="创建群聊 生成群ID">
        <div class="fo-12">请提交上述配置后，在创建如下配置，并提交群聊id</div>
        <a-row :gutter="20">
          <a-col :span="12">
            <div>群名称</div>
            <a-input v-model="createPost.name" placeholder="请输入群名称" />
          </a-col>
          <a-col :span="12">
            <div>群所有者(userid)</div>
            <a-input v-model="createPost.owner" placeholder="请输入群所有者(userid)" />
          </a-col>

          <a-col :span="8">
            <div>群成员1(userid)</div>
            <a-input v-model="createPost.userlist[0]" placeholder="请输入群成员1(userid)" />
          </a-col>
          <a-col :span="8">
            <div>群成员2(userid)</div>
            <a-input v-model="createPost.userlist[1]" placeholder="请输入群成员2(userid)" />
          </a-col>
          <a-col :span="8">
            <div>群成员3(userid)</div>
            <a-input v-model="createPost.userlist[2]" placeholder="请输入群成员3(userid)" />
          </a-col>
        </a-row>
        <a-button size="large" type="primary" @click="createAppchat">生成群ID</a-button>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  data() {
    return {
      createPost: {
        name: '骑手审核群',
        owner: '',
        userlist: ['', '', '']
      },
      formData: {
        corpid: '',
        corpsecret: '',
        verifyChatid: ''
      },
      rules: {
        corpid: [{ required: true, message: '企业ID必填', trigger: 'blur' }],
        corpsecret: [{ required: true, message: '应用凭证密钥必填', trigger: 'blur' }]
      },
      loading: false
    };
  },
  mounted() {
    this.getauth();
  },
  methods: {
    async getauth() {
      const result = await (this as any).$api.adminCorwxGet();
      if (result.code === 200) {
        this.formData = result.data;
      }
    },
    async createAppchat() {
      const result = await (this as any).$api.corwxAppchatCreate(this.createPost);
      if (result.code === 200) {
        this.formData.verifyChatid = result.data;
      }
    },
    submit() {
      (this.$refs as any).ruleForm.validate(async (valid: boolean) => {
        if (valid) {
          this.loading = true;
          const result = await (this as any).$api.adminCorwxPost(this.formData);
          this.loading = false;
          if (result.code === 200) {
            (this as any).$message.success(result.msg);
          }
        } else {
          return false;
        }
      });
    }
  }
});
</script>
<style lang="less" scoped>
.config-content {
  width: 500px;
  margin: auto;
  padding-top: 80px;
}
</style>

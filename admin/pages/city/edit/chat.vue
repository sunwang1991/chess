<template>
  <div class="home-container">
    <a-page-header :title="title + '生成群聊'" @back="() => $router.go(-1)"> </a-page-header>
    <div class="edit-content">
      <a-form-model ref="ruleForm" :model="formData" :rules="rules">
        <a-form-model-item label="群拥有者(userid)" prop="cityName">
          <a-input v-model="formData.owner" placeholder="请输入群所有者(userid)" />
        </a-form-model-item>
        <a-form-model-item label="成员2(userid)" prop="cityName">
          <a-input v-model="formData.userid2" placeholder="请输入成员2(userid)" />
        </a-form-model-item>
        <a-form-model-item label="成员3(userid)" prop="cityName">
          <a-input v-model="formData.userid3" placeholder="请输入成员3(userid)" />
        </a-form-model-item>

        <a-form-model-item>
          <a-button type="primary" size="large" :loading="loading" @click="submit"
            >提交保存</a-button
          >
        </a-form-model-item>
      </a-form-model>
    </div>
  </div>
</template>
<script lang="ts">
import EditMixin from '@/plugins/mixins/edit-mixin.vue';
export default EditMixin.extend({
  layout: 'global',
  data() {
    return {
      formData: {
        cityNo: '',
        owner: '',
        userid2: '',
        userid3: ''
      },
      rules: {
        cityNo: [{ required: true, message: '城市必填', trigger: 'blur' }],
        owner: [{ required: true, message: '拥有者必填', trigger: 'blur' }],
        userid2: [{ required: true, message: '用户2必填', trigger: 'blur' }],
        userid3: [{ required: true, message: '用户3必填', trigger: 'blur' }]
      },
      fixdBack: true
    };
  },
  computed: {
    method(): string {
      return 'cityCreateChat';
    },
    title(): string {
      return this.$route.query.title as string;
    }
  },
  mounted() {
    const query = this.$route.query;

    this.formData.cityNo = query.cityNo as string;
  },
  methods: {}
});
</script>

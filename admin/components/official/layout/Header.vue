<template>
  <div class="header flex flex-between item-center">
    <div class="flex flex-start item-center">
      <Logo />
      <div class="fo-20 ml-12 bold">{{ title }}</div>
    </div>
    <div class="flex flex-end item-center">
      <img
        class="mr-20 pointer"
        src="@/assets/images/sqbanner.png"
        height="60px"
        @click="linkClick"
      />
      <Avatar />
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Logo from '@/components/Logo.vue';
import Avatar from '@/components/user/Avatar.vue';
export default Vue.extend({
  components: {
    Logo,
    Avatar
  },
  data() {
    return {
      title: document.title
    };
  },
  methods: {
    linkClick() {
      window.open('https://gitee.com/landalfyao/ddrun/wikis/pages');
    }
  }
});
</script>
<style lang="less" scoped>
.header {
  min-width: 1200px;
  width: 100vw;
  background-color: #ffffff;
  height: 60px;
  padding: 0 20px;
  //   border-bottom: 1px solid #e1e1e1;
}
</style>

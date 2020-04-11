<template>
  <div id="app">
    <span class='text'>ABCDEFG</span>
    <router-view/>
  </div>
</template>

<script>
/* eslint-disable */
import { mapGetters } from 'vuex'

const getters = { // 模拟实现mapGetters
  a: () => 1,
  b: () => 2
}

function fn (keys) { // 模拟实现mapGetters
  const data = {}
  keys.forEach(key => {
    if (getters.hasOwnProperty(key)) {
      data[key] = getters[key]
    }
  })
  return data
}
export default {
  computed: {
    ...mapGetters(['test']),
    ...fn(['a', 'b', 'c'])// 模拟实现mapGetters
  },
  mounted () {
    // this.$store.dispatch('setTest', 12).then(() => {
    //   console.log(this.test)
    // })
    console.log(this.a, this.b, this.c)// 模拟实现mapGetters
  }
}
document.addEventListener('DOMContentLoaded', () => { // 需要刷新
  const html = document.querySelector('html')
  let fontSize = window.innerWidth / 10
  fontSize = fontSize > 50 ? 50 : fontSize
  html.style.fontSize = fontSize + 'px'
})
</script>

<style lang="scss" scoped>
  @import "./assets/styles/global";
  .text {
    font-family: 'Days One';  /**css中@fonr-face定义的font-family的名字 */
    font-size: px2rem(20);    /*font-size: 1rem;*/
    color: aqua;
  }
</style>

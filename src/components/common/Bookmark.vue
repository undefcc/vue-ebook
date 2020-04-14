<template>
    <div class="bookmark" ref="bookmark" :style="style"></div>
</template>

<script>
import { px2rem } from '../../utils/utils'
//   import { realPx } from '@/utils/utils'
  export default {
      props: {
          width: Number,
          height: Number, // 实际高度 - 三角形高度
          color: String
      },
      computed: {
          style () {
            if (this.color) {
                return { borderColor: `${this.color} ${this.color} transparent ${this.color}` }
            } else {
                return {}
            }
          }
      },
      methods: {
          refresh () {
              if (this.height && this.width) {
                this.$refs.bookmark.style.borderWidth =
                `${px2rem(this.height - 5)}rem ${px2rem(this.width / 2)}rem ${px2rem(5)}rem ${px2rem(this.width / 2)}rem`
              }
          }
      },
      mounted () {
          this.refresh()
      }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .bookmark{ // 靠一个点发散的border来实现三角形
    width: 0;
    height: 0;
    border-width: px2rem(50) px2rem(10) px2rem(10) px2rem(10);// 边线border
    border-style: solid;
    border-color: white white transparent white;// 挖边线
  }
</style>

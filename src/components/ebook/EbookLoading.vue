<template>
  <div class="ebook-loading">
    <div class="ebook-loading-wrapper">
      <div class="ebook-loading-item" v-for="(item, index) in data" :key="index">
        <div class="ebook-loading-line-wrapper" v-for="(subItem, subIndex) in item" :key="subIndex">
          <div class="ebook-loading-line" ref="line"></div>
          <div class="ebook-loading-mask" ref="mask"></div>
        </div>
      </div>
      <div class="ebook-loading-center"></div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import { px2rem } from '@/utils/utils'

  export default {
    data () {
        return {
            data: [
                [{}, {}, {}],
                [{}, {}, {}]
            ],
            maskWidth: [
                { value: 0 },
                { value: 0 },
                { value: 0 },
                { value: 0 },
                { value: 0 },
                { value: 0 }
            ],
            lineWidth: [
                { value: 16 },
                { value: 16 },
                { value: 16 },
                { value: 16 },
                { value: 16 },
                { value: 16 }
            ],
            add: true,
            end: false
        }
    },
    mounted () {
      this.task = setInterval(() => {
        this.$refs.mask.forEach((item, index) => {
          const mask = this.$refs.mask[index]// 总共6个mask
          const line = this.$refs.line[index]// 总共6个line
          const maskWidth = this.maskWidth[index]// 本轮mask宽度
          const lineWidth = this.lineWidth[index]// 本轮line宽度
          if (index === 0) { // 若为第一个条条，直接进行增减
            if (this.add && maskWidth.value < 16) {
              maskWidth.value++
              lineWidth.value--
            } else if (!this.add && lineWidth.value < 16) {
              maskWidth.value--
              lineWidth.value++
            }
          } else { // 若非第一个条条，检查他上一个条条的值是否走过一半，再进行增减
            if (this.add && maskWidth.value < 16) { // 还没加满则继续加
              const preMaskWidth = this.maskWidth[index - 1]
              if (preMaskWidth.value >= 8) {
                maskWidth.value++
                lineWidth.value--
              }
            } else if (!this.add && lineWidth.value < 16) { // 加满则停止
              const preLineWidth = this.lineWidth[index - 1]
              if (preLineWidth.value >= 8) {
                maskWidth.value--
                lineWidth.value++
              }
            }
          }
          mask.style.width = `${px2rem(maskWidth.value)}rem`// 宽度转为rem
          mask.style.flex = `0 0 ${px2rem(maskWidth.value)}rem`// 改变flex
          line.style.width = `${px2rem(lineWidth.value)}rem`// 宽度转为rem
          line.style.flex = `0 0 ${px2rem(lineWidth.value)}rem`// 改变flex
          if (index === this.maskWidth.length - 1) { // 若满了/空了则this.end改为true
            if (this.add) {
              if (maskWidth.value === 16) {
                this.end = true
              }
            } else {
              if (maskWidth.value === 0) {
                this.end = true
              }
            }
          }
          if (this.end) { // 若this.end改为true了，则切换this.add（空了则开始增加动画，满了则执行减少动画）
            this.add = !this.add
            this.end = false// 若this.add切换完了，证明动画开始反向了，此时this.end要改回false了
          }
        })
      }, 20)
    }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";

  .ebook-loading {
    position: relative;
    z-index: 500;
    width: px2rem(63);
    height: px2rem(40);
    background: transparent;
    border: px2rem(1.5) solid #d7d7d7;
    border-radius: px2rem(3);
    .ebook-loading-wrapper {
      display: flex;
      width: 100%;
      height: 100%;
      .ebook-loading-item {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: px2rem(7) 0;
        box-sizing: border-box;
        .ebook-loading-line-wrapper {
          flex: 1;
          padding: 0 px2rem(7);
          box-sizing: border-box;
          @include left;
          .ebook-loading-mask {
            flex: 0 0 px2rem(16);// 0 0 px2rem(6)
            width: px2rem(16);// px2rem(6)
            height: px2rem(1.5);
          }
          .ebook-loading-line {
            flex: 0 0 0;// px2rem(10)
            width: 0;// px2rem(10)
            height: px2rem(1.5);
            background: #d7d7d7;
          }
        }
      }
      .ebook-loading-center {
        position: absolute;
        left: 50%;
        top: 0;
        width: px2rem(1.5);
        height: 100%;
        background: #d7d7d7;
      }
    }
  }
</style>

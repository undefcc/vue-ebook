<template>
  <div class="ebook" ref="ebook">
    <ebook-title></ebook-title>
    <ebook-reader></ebook-reader>
    <ebook-menu></ebook-menu>
    <ebook-bookmark></ebook-bookmark>
  </div>
</template>

<script>
import EbookReader from '../../components/ebook/EbookReader'
import EbookTitle from '../../components/ebook/EbookTitle'
import EbookMenu from '../../components/ebook/EbookMenu'
import EbookBookmark from '../../components/ebook/EbookBookmark'
import { ebookMixin } from '../../utils/mixin'
import { getReadTime, saveReadTime } from '../../utils/localStorage'

export default {
  mixins: [ebookMixin],
  components: {
    EbookReader,
    EbookTitle,
    EbookMenu,
    EbookBookmark
  },
  watch: {
    offsetY (v) {
      if (!this.menuVisible && this.bookAvailable) { // 菜单栏显示时 && 处理分页时
        if (v > 0) {
          this.move(v)
        } else if (v === 0) {
          this.restore()
        }
      }
    }
  },
  methods: {
      move (v) {
        this.$refs.ebook.style.top = v + 'px'
      },
      restore () {
        this.$refs.ebook.style.top = 0
        this.$refs.ebook.style.transition = 'all .2s linear' // css添加过渡效果

        // 回弹完成后清除该动画效果
        // 解决弹回以后，再下拉会卡顿（此时css有动画属性了，下拉时top值每改一次，都要执行0.2s动画）
        setTimeout(() => {
            this.$refs.ebook.style.transition = ''
        }, 200)
      },
      startLoopReadTime () {
        let readTime = getReadTime(this.fileName)
        if (!readTime) {
            readTime = 0
        }
        this.task = setInterval(() => {
            readTime++
            if (readTime % 30 === 0) {
                saveReadTime(this.fileName, readTime)
            }
        }, 1000)
      }
  },
  mounted () {
      this.startLoopReadTime()
  },
  beforeDestroy () {
      if (this.task) {
          clearInterval(this.task)
      }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .ebook{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>

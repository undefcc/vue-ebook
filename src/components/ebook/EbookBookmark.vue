<template>
  <div class="ebook-bookmark" ref="bookmark">
    <div class="ebook-bookmark-text-wrapper"><!--文字部分-->
      <div class="ebook-bookmark-down-wrapper"><span class="icon-down" ref="iconDown"></span></div>
      <div class="ebook-bookmark-text">{{text}}</div>
    </div>
    <div class="ebook-bookmark-icon-wrapper">
      <!--标签部分-->
      <bookmark :color="color" :width="15" :height="35" :style="isFixed ? fixedStyle : {}"></bookmark>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
//   import { px2rem } from '@/utils/utils'
  import Bookmark from '../common/Bookmark'
  import { realPx, px2rem } from '../../utils/utils'
  import { ebookMixin } from '../../utils/mixin'
import { getBookmark, saveBookmark } from '../../utils/localStorage'

  const BLUE = '#346cbc'
  const WHITE = '#fff'
  export default {
    mixins: [ebookMixin],
    components: {
        Bookmark
    },
    computed: {
      height () {
        return realPx(35)// 等于书签高度——吸附
      },
      threshold () {
        return realPx(55)
      },
      fixedStyle () {
        return {
          position: 'fixed',
          top: 0,
          right: `${px2rem(15)}rem`,
          zIndex: 100
        }
      }
    },
    watch: {
      offsetY (v) {
        if (!this.bookAvailable || this.menuVisible || this.settingVisible > 0) {
          return
        }
        if (v >= this.height && v <= this.threshold) {
          this.beforeThreshold(v)
        } else if (v >= this.threshold) {
          this.afterThreshold(v)
        } else if (v > 0 && v < this.height) {
          this.beforeHeight()
        } else if (v === 0) {
          this.restore()
        }
      },
      isBookmark (v) {
        this.isFixed = v
        if (v) {
          this.color = BLUE
        } else {
          this.color = WHITE
        }
      }
    },
    methods: {
      addBookmark () {
        this.bookmark = getBookmark(this.fileName)
        if (!this.bookmark) {
          this.bookmark = []
        }
        const currentLocation = this.currentBook.rendition.currentLocation()
        const cfibase = currentLocation.start.cfi.replace(/!.*/, '')// 正则表达式获取感叹号前面的内容
        // console.log(cfibase)
        const cfistart = currentLocation.start.cfi.replace(/.*!/, '').replace(/\)$/, '')// 正则表达式获取感叹号后面的内容
        // console.log(cfistart)
        const cfiend = currentLocation.end.cfi.replace(/.*!/, '').replace(/\)$/, '')// 正则表达式获取感叹号后面的内容
        // console.log(cfiend)
        const cfiRange = `${cfibase}!,${cfistart},${cfiend})`// 专属格式
        // console.log(cfiRange)
        this.currentBook.getRange(cfiRange).then(range => {
          const text = range.toString().replace(/\s\s/g, '')// 去掉多余空格，获取到本页文本
          // console.log(text)
          this.bookmark.push({
            cfi: currentLocation.start.cfi,
            text: text
          })
          saveBookmark(this.fileName, this.bookmark)
        })
      },
      removeBookmark () {
        const currentLocation = this.currentBook.rendition.currentLocation()
        const cfi = currentLocation.start.cfi
        // console.log(cfi)
        this.bookmark = getBookmark(this.fileName)
        if (this.bookmark) {
          saveBookmark(this.fileName, this.bookmark.filter(item => item.cfi !== cfi))// 去除当前cfi
          this.setIsBookmark(false)
        }
      },
      restore () {
        // 状态4，归位
        setTimeout(() => {
          this.$refs.bookmark.style.top = `${-this.height}`
          this.$refs.iconDown.style.transform = 'rotate(0deg)'
        }, 200)
        if (this.isFixed) {
          this.setIsBookmark(true)
          this.addBookmark()
        } else {
          this.setIsBookmark(false)
          this.removeBookmark()
        }
      },
      beforeHeight () {
        // console.log('状态1, 未到书签高度')
        if (this.isBookmark) {
          this.text = this.$t('book.pulldownDeleteMark')
          this.color = BLUE
          this.isFixed = true
        } else {
          this.text = this.$t('book.pulldownAddMark')
          this.color = WHITE
          this.isFixed = false
        }
      },
      beforeThreshold (v) {
        // console.log('状态2, 已到高度，未到零界') //本来本组件与index一同下移整个在下移，此时本组件在上移，使得看起来脱离了index
        this.$refs.bookmark.style.top = `${-v}px`
        this.beforeHeight()
        const iconDown = this.$refs.iconDown
        if (iconDown.style.transform === 'rotate(180deg)') {
          iconDown.style.transform = 'rotate(0deg)'
        }
        this.isFixed = false
      },
      afterThreshold (v) {
        // console.log('状态3, 到达以及超过零界[添加书签]')
        this.$refs.bookmark.style.top = `${-v}px`
        if (this.isBookmark) {
          this.text = this.$t('book.releaseDeleteMark')
          this.color = WHITE
          this.isFixed = false
        } else {
          this.text = this.$t('book.releaseAddMark')
          this.color = BLUE
          this.isFixed = true
        }
        const iconDown = this.$refs.iconDown
        if (iconDown.style.transform === '' || iconDown.style.transform === 'rotate(0deg)') {
          iconDown.style.transform = 'rotate(180deg)'
        }
      }
    },
    data () {
      return {
        text: '',
        color: WHITE,
        isFixed: false
      }
    },
    mounted () {
      // console.log('aaa', this.$refs.iconDown.offsetWidth)
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .ebook-bookmark {
    position: absolute;
    top: px2rem(-35);
    left: 0;
    z-index: 100;
    width: 100%;
    height: px2rem(35);
    .ebook-bookmark-text-wrapper {
      position: absolute;
      right: px2rem(45);
      bottom: 0;
      display: flex;
      .ebook-bookmark-down-wrapper {
        font-size: px2rem(14);
        color: white;
        transition: all .2s linear;// 箭头旋转的动画
        @include center;
        .icon-down {
          transition: all .2s linear;
        }
      }
      .ebook-bookmark-text {
        font-size: px2rem(14);
        color: white;
      }
    }
    .ebook-bookmark-icon-wrapper {
      position: absolute;
      right: 0;
      bottom: 0;
      margin-right: px2rem(15);
    }
  }
</style>

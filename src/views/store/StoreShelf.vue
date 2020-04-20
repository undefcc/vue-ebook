<template>
  <div class="store-shelf">
      <shelf-title :title="$t('shelf.title')"></shelf-title>
      <scroll class="store-shelf-scroll-wrapper" :top="0" :bottom="scrollBottom" @onScroll="onScroll" ref="scroll">
          <shelf-search></shelf-search>
          <shelf-list :data="shelfList"></shelf-list>
      </scroll>
      <shelf-footer></shelf-footer>
  </div>
</template>

<script>
import ShelfTitle from '../../components/shelf/ShelfTitle'
import Scroll from '../../components/common/Scroll'
import ShelfSearch from '../../components/shelf/ShelfSearch'
import shelfList from '../../components/shelf/ShelfList'
import ShelfFooter from '../../components/shelf/ShelfFooter'
import { storeShelfMixin } from '../../utils/mixin'
// import { shelf } from '../../api/store'
// import { appendAddToShelf } from '../../utils/store'
// import { getBookShelf, saveBookShelf } from '../../utils/localStorage'

export default {
    mixins: [storeShelfMixin],
    components: {
        ShelfTitle,
        Scroll,
        ShelfSearch,
        shelfList,
        ShelfFooter
    },
    data () {
        return {
            scrollBottom: 0
        }
    },
    methods: {
        onScroll (offsetY) {
            this.setOffsetY(offsetY)
        }
    },
    mounted () {
        this.getShelfList()
        this.setShelfCategory([])
        this.setCurrentType(1)
    },
    watch: {
        isEditMode (v) {
            this.scrollBottom = v ? 48 : 0
            this.$nextTick(() => { // 页面完成后再更新滚动条（点击编辑时会触发DOM操作，在进行DOM操作时刷新滚动条会出错）
                this.$refs.scroll.refresh()
            })
        }
    }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .store-shelf {
      position: relative;
      z-index: 100;
      width: 100%;
      height: 100%;
      background-color: #fff;
      .store-shelf-scroll-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 101;
      }
  }
</style>

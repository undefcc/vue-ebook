<template>
  <div class="store-category">
      <shelf-title :title="shelfCategory.title"></shelf-title>
      <scroll class="store-category-scroll-wrapper" :top="0" :bottom="scrollBottom" @onScroll="onScroll" ref="scroll" v-if="ifShowList">
          <shelf-list :top="42" :data="shelfCategory.itemList"></shelf-list>
      </scroll>
      <div class="store-shelf-empty-view" v-else>
          {{$t('shelf.groupNone')}}
      </div>
      <shelf-footer></shelf-footer>
  </div>
</template>

<script>
import ShelfTitle from '../../components/shelf/ShelfTitle'
import Scroll from '../../components/common/Scroll'
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
        this.getCategoryList(this.$route.query.title)
        this.setCurrentType(2)
    },
    computed: {
        ifShowList () {
            return this.shelfCategory.itemList && this.shelfCategory.itemList.length > 0
        }
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
  .store-category {
      position: relative;
      z-index: 100;
      width: 100%;
      height: 100%;
      background-color: #fff;
      .store-category-scroll-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 101;
      }
      .store-shelf-empty-view {
          position: absolute;
          height: 100%;
          width: 100%;
          font-size: px2rem(14);
          color: #666;
          @include center
      }
  }
</style>

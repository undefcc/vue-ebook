<template>
    <div class="shelf-list" :style="{top: shelfListTop}">
    <transition-group name="list" tag="div" id="shelf-list">
        <div class="shelf-list-item-wrapper" v-for="item in data" :key="item.id">
            <shelf-item :data="item" :style="{'height': itemHeight}"></shelf-item>
            <div class="shelf-list-title-wrapper">
                <span class="shelf-list-title title-small">{{item.title}}</span>
            </div>
        </div>
    </transition-group>
    </div>
</template>

<script>
import { storeShelfMixin } from '../../utils/mixin'
import ShelfItem from './ShelfItem'
import { realPx, px2rem } from '../../utils/utils'

export default {
    mixins: [storeShelfMixin],
    props: {
        top: {
            type: Number,
            default: 94
        },
        data: Array
    },
    components: {
        ShelfItem
    },
    computed: {
        itemHeight () {
            return ((window.innerWidth - realPx(120)) / 3) / 250 * 350 + 'px'// 图书尺寸250*350 ----> h = w * 350 / 250
        },
        shelfListTop () {
            // console.log('change', this.top)
            return px2rem(this.top) + 'rem'
        }
    }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .shelf-list {
      position: absolute;
      z-index: 100;
      width: 100%;
      #shelf-list {
          display: flex;
          flex-flow: row wrap;// 可以换行（否则图片都在一行）
          width: 100%;
          padding: 0 px2rem(15);
          box-sizing: border-box;
        .shelf-list-item-wrapper {
            flex: 0 0 33.33%;
            width: 33.33%;
            padding: px2rem(15);
            box-sizing: border-box;
            &.list-leave-active { // 给需要移动的元素加（transition-group内第一层）
                display: none;
            }
            &.list-move {
                transition: transform .5s; // 给需要移动的元素加（transition-group内第一层）
            }
        }
        .shelf-list-title-wrapper {
            margin-top: px2rem(10);
        }
      }
  }
</style>

<template>
  <div class="store-home">
      <search-bar></search-bar>
      <scroll :top="scrollTop" @onScroll="onScroll" ref="scroll"><!-- 42+52=94 -->
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
        <div>11111111111111111111111</div>
      </scroll>
      <flap-card :data="random"></flap-card>
  </div>
</template>

<script>
import searchBar from '../../components/home/SearchBar'
import Scroll from '../../components/common/Scroll'
import FlapCard from '../../components/home/FlapCard'
import { storeHomeMixin } from '../../utils/mixin'
import { home } from '../../api/store'

export default {
    mixins: [storeHomeMixin],
    components: {
        searchBar,
        Scroll,
        FlapCard
    },
    methods: {
        onScroll (offsetY) {
            // console.log(offsetY)
            this.setOffsetY(offsetY)// 接受Y轴滚动，传给Vuex
            if (offsetY > 0) {
                this.scrollTop = 54
            } else {
                this.scrollTop = 94
            }
            this.$refs.scroll.refresh()
        }
    },
    data () {
        return {
            scrollTop: 94,
            random: null
        }
    },
    mounted () {
        home().then(res => {
            // console.log(res)
            if (res && res.status === 200) {
                const data = res.data
                // console.log(data.random)
                const randomIndex = Math.floor(Math.random() * data.random.length)
                this.random = data.random[randomIndex]
                // console.log(this.random)
            }
        })
    }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .store-home {
      width: 100%;
      height: 100%;
  }
</style>

<template>
  <div class="store-home">
      <search-bar></search-bar>
      <scroll :top="scrollTop" @onScroll="onScroll" ref="scroll"><!-- 42+52=94 -->
        <div class="banner-wrapper">
            <div class="banner-img" :style="{'backgroundImage': `url('${banner}')`}" ></div>
        </div>
        <guess-you-like :data="guessYouLike"></guess-you-like>
        <recommend :data="recommend" class="recommend"></recommend>
        <featured :data="featured" :titleText="$t('home.featured')" :btnText="$t('home.seeAll')" class="featured"></featured>
        <div class="category-list-wrapper" v-for="(item, index) in categoryList" :key="index">
            <category-book :data="item"></category-book>
        </div>
        <category class="categories" :data="categories"></category>
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
import guessYouLike from '../../components/home/GuessYouLike'
import Recommend from '../../components/home/Recommend'
import Featured from '../../components/home/Featured'
import categoryBook from '../../components/home/CategoryBook'
import category from '../../components/home/Category'

export default {
    mixins: [storeHomeMixin],
    components: {
        searchBar,
        Scroll,
        FlapCard,
        guessYouLike,
        Recommend,
        Featured,
        categoryBook,
        category
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
            random: null,
            banner: '',
            guessYouLike: null,
            recommend: null,
            featured: null,
            categoryList: null,
            categories: null
        }
    },
    mounted () {
        home().then(res => {
            // console.log(res)
            if (res && res.status === 200) {
                const data = res.data
                // console.log(data.banner)
                // console.log(data.random)
                const randomIndex = Math.floor(Math.random() * data.random.length)
                this.random = data.random[randomIndex]
                // console.log(this.random)
                this.banner = data.banner
                this.guessYouLike = data.guessYouLike
                this.recommend = data.recommend
                this.featured = data.featured
                this.categoryList = data.categoryList// 二维数组，两个div
                this.categories = data.categories
                // console.log(JSON.stringify(this.categories))
                // console.log(this.categoryList)
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
      .banner-wrapper {
          width: 100%;
          padding: px2rem(10);
          box-sizing: border-box;
          .banner-img {
              width: 100%;
              height: px2rem(150);
              background-repeat:no-repeat;
              background-position:100% 100%
          }
      }
      .recommend {
          margin-top: px2rem(20);
      }
      .featured {
          margin-top: px2rem(20);
      }
      .category-list-wrapper {
          margin-top: px2rem(20);
      }
      .categories {
          margin-top: px2rem(20);
      }
  }
</style>

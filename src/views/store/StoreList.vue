<template>
  <div class="book-list-wrapper">
    <detail-title :title="title"
                  :showShelf="true"
                  @back="back"
                  ref="title"></detail-title>
    <scroll class="book-list-scroll-wrapper"
            :top="42"
            @onScroll="onScroll"
            ref="scroll">
      <featured :data="value" :titleText="titleText ? titleText : getCategoryText(key)" :btnText="''" v-for="(value, key, index) in list"
                :key="index"></featured>
    </scroll>
  </div>
</template>

<script>
  import DetailTitle from '../../components/detail/DetaiTitle'
  import Scroll from '../../components/common/Scroll'
  import Featured from '../../components/home/Featured'
  import { realPx } from '../../utils/utils'
  import { list } from '../../api/store'
  import { categoryList, categoryText } from '../../utils/store'

  export default {
    components: {
      DetailTitle,
      Scroll,
      Featured
    },
    computed: {
      title () {
        if (this.list) {
          return this.total && this.$t('home.allBook').replace('$1', this.totalNumber)
        } else {
          return null
        }
      },
      totalNumber () {
        let num = 0
        Object.keys(this.list).forEach(key => {
          num += this.list[key].length
        })
        return num
      }
    },
    data () {
      return {
        list: null,
        total: null
      }
    },
    methods: {
      getCategoryText (key) {
        return `${categoryText(categoryList[key], this)}(${this.list[key].length})`
      },
      back () {
        this.$router.go(-1)
      },
      onScroll (offsetY) {
        if (offsetY > realPx(42)) {
          this.$refs.title.showShadow()
        } else {
          this.$refs.title.hideShadow()
        }
      },
      getList () {
        list().then(response => {
          this.list = response.data.data// list对象中包含以种类名命名的数组
          this.total = response.data.total
          const category = this.$route.query.category
          const keyword = this.$route.query.keyword
          if (category) { // 显示某类目的所有图书（mixin中showBookDetail方法）
            const key = Object.keys(this.list).filter(item => item === category)[0]// list种类名与当前种类名相同的第一个数组（某一类的所有图书数组）
            const data = this.list[key]
            this.list = {}
            this.list[key] = data
          } else if (keyword) { // 搜索功能被调用（searchBar中search方法）
            Object.keys(this.list).filter(key => {
              this.list[key] = this.list[key].filter(book => book.fileName.indexOf(keyword) >= 0)// 种类名作为键值，遍历list对象，找到每个类别中要查找的书
              return this.list[key].length > 0
            })
          }
        })
      }
    },
    created () {
      this.getList()
      this.titleText = this.$route.query.categoryText
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";

  .book-list-wrapper {
    width: 100%;
    height: 100%;
    background: white;
  }
</style>

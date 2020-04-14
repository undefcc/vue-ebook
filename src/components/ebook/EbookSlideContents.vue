<template>
    <div class="ebook-slide-contents">
        <div class="slide-contents-search-wrapper">
            <div class="slide-contents-search-input-wrapper">
                <div class="slide-contente-search-icon"><span class="icon-search"></span></div>
                <input  type="text"
                        v-model="searchText"
                        class="slide-contents-search-input"
                        :placeholder="$t('book.searchHint')"
                        @keyup.enter.exact="search()"
                        @click="showSearchPage()">
            </div>
            <div class="slide-contents-search-cancel" v-if="searchVisible" @click="hideSearchPage()">{{$t('book.cancel')}}</div>
        </div>
        <div class="slide-contents-book-wrapper" v-show="!searchVisible">
            <div class="slide-contents-book-img-wrapper">
                <img :src="cover" class="slide-contents-book-img">
            </div>
            <div class="slide-contents-book-info-wrapper">
                <div class="slide-contents-book-title">{{metadata.title}}</div>
                <div class="slide-contents-book-author">{{metadata.creator}}</div>
            </div>
            <div class="slide-contents-book-progress-wrapper">
                <div class="slide-contents-book-progress">
                    <span class="progress">{{progress + '%'}}</span>
                    <span class="progress-text">{{$t('book.haveRead2')}}</span>
                </div>
                <div class="slide-contents-book-time">{{getReadTimeText()}}</div>
            </div>
        </div>
        <scroll class="slide-contents-list"
                :top="156"
                :bottom="48"
                v-show="!searchVisible"
                ref="scroll">
            <div class="slide-contents-item" v-for="(item, index) in navigation" :key="index">
                <span class="slide-contents-item-label"
                :style="contentItemStyle(item)"
                :class="{'selected': section === index}"
                @click="displayContent(item.href)"
                >
                    {{item.label}}
                </span>
                <span class="slide-contents-item-page">{{}}</span>
            </div>
        </scroll>
        <scroll class="slide-search-list"
                :top="66"
                :bottom="48"
                v-show="searchVisible">
            <div class="slide-search-item"
                v-for="(item, index) in searchList"
                :key="index"
                v-html="item.excerpt"
                @click="displayContent(item.cfi, true)">
            </div>
        </scroll>
    </div>
</template>

<script>
// [slide-contents-list] top = (36+20+10) + 90 = 156
// [slide-search-list]   top = 36 + 20 + 10 =66
import { ebookMixin } from '../../utils/mixin'
import Scroll from '../common/Scroll'
import { px2rem } from '../../utils/utils'

export default {
    mixins: [ebookMixin],
    data () {
        return {
            currentTab: 1,
            searchVisible: false,
            searchList: null,
            searchText: ''
        }
    },
    components: {
        Scroll
    },
    methods: {
        search () {
            if (this.searchText && this.searchText.length > 0) {
                this.doSearch(this.searchText).then(list => {
                    this.searchList = list
                    this.searchList.map(item => {
                        item.excerpt = item.excerpt.replace(this.searchText, `<span class="content-search-text">${this.searchText}</span>`)
                        return item
                    })
                })
            }
        },
        doSearch (q) {
            return Promise.all(
                this.currentBook.spine.spineItems.map(
                    section => section.load(this.currentBook.load.bind(this.currentBook)// section获取每章文本信息（将book对象作上下文传入）
                )
                .then(section.find.bind(section, q))// find方法查找section章节的q在哪（map方法遍历了每个章节）
                .finally(section.unload.bind(section)))// 异步执行完成后释放内存（加载一个html可能会占用1M的空间，所以记得释放）
            ).then(results => Promise.resolve([].concat.apply([], results)))// 对结果进行Promise处理（多维数组转一位数组）
            // results本来是二维数组，进过[].concat.apply([], results) （apply方法将数组变成参数逐一传递，实现降维度；而concat只能连接两个一维数组，二位数组无法降维；）
        },
        displayContent (target, highlight = false) {
            this.display(target, () => {
                this.hideTitleAndMenu()
                if (highlight) {
                    this.currentBook.rendition.annotations.highlight(target)
                }
            })
        },
        selectTab (key) { this.currentTab = key },
        showSearchPage () {
            this.searchVisible = true
        },
        hideSearchPage () {
            this.searchVisible = false
            this.searchText = ''
            this.searchList = null
        },
        contentItemStyle (item) {
            return {
                marginLeft: `${px2rem(item.level * 15)}rem`
            }
        }
    },
    mounted () {
        // console.log(this.currentBook.spine.spineItems)// section 与目录内容相似，但负责管理每个章节的文本内容
    }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .ebook-slide-contents{
    width:100%;
    font-size: 0;// 解决代码换行造成的页面内容换行
    .slide-contents-search-wrapper {
        display: flex;
        width: 100%;
        height: px2rem(36);
        margin: px2rem(20) 0 px2rem(10) 0;
        padding: 0 px2rem(15);
        box-sizing: border-box;
        .slide-contents-search-input-wrapper {
            flex: 1;
            @include center;
            .slide-contente-search-icon {
                flex: 0 0 px2rem(28);
                font-size: px2rem(12);
                @include center;
            }
            .slide-contents-search-input {
                flex: 1;
                width: 100%;
                @include center;
                font-size: px2rem(14);
                background: transparent;
                border: none;
                &:focus {outline: none;}
            }
        }
        .slide-contents-search-cancel {
            flex: 0 0 px2rem(50);
            font-size: px2rem(14);
            @include right;
        }
    }
    .slide-contents-book-wrapper {
        display: flex;
        width: 100%;
        height: px2rem(90);
        padding: px2rem(10) px2rem(15) px2rem(20) px2rem(15);
        box-sizing: border-box;
        .slide-contents-book-img-wrapper {
            flex: 0 0 px2rem(45);
            .slide-contents-book-img {
                width: px2rem(45);
                height: px2rem(60);
            }
        }
        .slide-contents-book-info-wrapper {
            flex: 1;
            padding: 0 px2rem(10);
            .slide-contents-book-title {
                // 375*0.85 - 2*15 - 2*10 - 45 - 70 = 153.75
                width: px2rem(153.75);
                font-size: px2rem(14);
                line-height: px2rem(14);
                @include ellipsisMulti(3);
            }
            .slide-contents-book-author {
                width: px2rem(153.75);
                margin-top: px2rem(5);
                font-size: px2rem(12);
                @include ellipsis;
            }
        }
        .slide-contents-book-progress-wrapper {
            flex: 0 0 px2rem(70);
            display: flex;
            flex-direction: column;
            align-self: center;
            .slide-contents-book-progress {
                .progress {
                    font-size: px2rem(14);
                }
                .progress-text {
                    font-size: px2rem(12);
                }
            }
            .slide-contents-book-time {
                margin-top: px2rem(5);
                font-size: px2rem(12);
            }
        }
    }
    .slide-contents-list {
        padding: 0 px2rem(15);
        box-sizing: border-box;
        .slide-contents-item {
            padding: px2rem(20) 0;
            box-sizing: border-box;
            display: flex;
            .slide-contents-item-label {
                flex: 1;
                font-size: px2rem(14);
                line-height: px2rem(16);
                @include ellipsis
            }
            .slide-contents-item-page {}
        }
    }
    .slide-search-list {
        width: 100%;
        padding: 0 px2rem(15);
        box-sizing: border-box;
        .slide-search-item {
            font-size: px2rem(14);
            line-height: px2rem(16);
            padding: border-box;
        }
    }
  }
</style>

import { mapGetters, mapActions } from 'vuex'
import { themeList, addCss, removeAllCss, getReadTimeByMinute } from './book'
import { saveLocation, getBookmark } from './localStorage'

export const ebookMixin = {
    computed: {
        ...mapGetters([
            'fileName',
            'menuVisible',
            'settingVisible',
            'defaultFontSize',
            'defaultFontFamily',
            'fontFamilyVisible',
            'defaultTheme',
            'bookAvailable',
            'progress',
            'section',
            'isPaginating',
            'currentBook',
            'navigation',
            'cover',
            'metadata',
            'paginate',
            'pagelist',
            'offsetY',
            'isBookmark',
            'speakingIconBottom'
        ]),
        themeList () {
            return themeList(this)
        }
    },
    methods: {
        ...mapActions([
            'setFileName',
            'setMenuVisible',
            'setSettingVisible',
            'setDefaultFontSize',
            'setDefaultFontFamily',
            'setFontFamilyVisible',
            'setDefaultTheme',
            'setBookAvailable',
            'setProgress',
            'setSection',
            'setIsPaginating',
            'setCurrentBook',
            'setNavigation',
            'setCover',
            'setMetadata',
            'setPaginate',
            'setPagelist',
            'setOffsetY',
            'setIsBookmark',
            'setSpeakingIconBottom'
        ]),
        initGlobalStyle () {
            removeAllCss()
            switch (this.defaultTheme) {
                case 'Default':
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
                    break
                case 'Eye':
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_eye.css`)
                    break
                case 'Gold':
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_gold.css`)
                    break
                case 'Night':
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_night.css`)
                    break
                default:
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
            }
        },
        refreshLocation () {
            const currentLocation = this.currentBook.rendition.currentLocation()// 当前位置信息
            const startCfi = currentLocation.start.cfi// 当前位置信息
            if (currentLocation && currentLocation.start) {
                const progress = this.currentBook.locations.percentageFromCfi(currentLocation.start.cfi)// 根据当前位置信息获取进度百分比
                this.setProgress(Math.floor(progress * 100))// 更新进度条
                this.setSection(currentLocation.start.index)// 更新当前章节
                saveLocation(this.fileName, startCfi)// 存储当前位置信息
                const bookmark = getBookmark(this.fileName)
                // console.log(bookmark)// 打印bookmark数组，该数组存放 加了标签的页面的cfi
                if (bookmark) {
                    if (bookmark.some(item => item.cfi === startCfi)) {
                        this.setIsBookmark(true)
                    } else {
                        this.setIsBookmark(false)
                    }
                } else {
                    this.setIsBookmark(false)
                }
            }
        },
        display (target, callback) {
            if (target) {
                this.currentBook.rendition.display(target).then(() => this.refreshLocation())
                if (callback) callback()
            } else {
                this.currentBook.rendition.display().then(() => this.refreshLocation())
                if (callback) callback()
            }
        },
        hideTitleAndMenu () {
            // this.$store.dispatch('setMenuVisible', false)
            this.setMenuVisible(false)
            this.setSettingVisible(-1)
            this.setFontFamilyVisible(false)
        },
        getReadTimeText () {
            return this.$t('book.haveRead').replace('$1', getReadTimeByMinute(this.fileName))
        }
    }
}

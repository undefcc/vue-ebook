import { mapGetters, mapActions } from 'vuex'
import { themeList, addCss, removeAllCss, getReadTimeByMinute } from './book'
import { saveLocation, getBookmark, getBookShelf, saveBookShelf } from './localStorage'
import { gotoBookDetail, appendAddToShelf, computedId, removeAddFromShelf } from './store'
import { shelf } from '../api/store'

export const storeShelfMixin = {
    computed: {
        ...mapGetters([
            'isEditMode',
            'shelfList',
            'shelfSelected',
            'shelfTitleVisible',
            'offsetY',
            'shelfCategory',
            'currentType'
        ])
    },
    methods: {
        ...mapActions([
            'setIsEditMode',
            'setShelfList',
            'setShelfSelected',
            'setShelfTitleVisible',
            'setOffsetY',
            'setShelfCategory',
            'setCurrentType'
        ]),
        showBookDetail (book) {
            gotoBookDetail(this, book)
        },
        getCategoryList (title) {
            this.getShelfList().then(() => {
                const categoryList = this.shelfList.filter(book => book.type === 2 && book.title === title)[0]
                this.setShelfCategory(categoryList)
            })
        },
        getShelfList () {
            let shelfList = getBookShelf()
            if (!shelfList) {
                shelf().then(res => {
                    if (res.status === 200 && res.data && res.data.bookList) {
                        shelfList = appendAddToShelf(res.data.bookList)
                        saveBookShelf(shelfList)
                        return this.setShelfList(shelfList)// 返回Promise对象，getCategoryList()可以.then
                    }
                })
            } else {
                return this.setShelfList(shelfList)
            }
        },
        moveOutOfGroup (cb) {
            this.setShelfList(this.shelfList.map(book => {
              if (book.type === 2 && book.itemList) {
                book.itemList = book.itemList.filter(subBook => !subBook.selected)
              }
              return book
            })).then(() => {
              let list = removeAddFromShelf(this.shelfList)
              list = [].concat(list, ...this.shelfSelected)
              list = appendAddToShelf(list)
              list = computedId(list)
              this.setShelfList(list).then(() => {
                this.simpleToast(this.$t('shelf.moveBookOutSuccess'))
                if (cb) cb()
              })
            })
        }
    }
}

export const storeHomeMixin = {
    computed: {
        ...mapGetters([
            'offsetY',
            'hotSearchOffsetY',
            'flapCardVisible'
        ])
    },
    methods: {
        ...mapActions([
            'setOffsetY',
            'setHotSearchOffsetY',
            'setFlapCardVisible'
        ]),
        showBookDetail (book) {
            gotoBookDetail(this, book)
        }
    }
}

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
        },
        getSectionName () {
          if (this.section) {
            const section = this.currentBook.section(this.section)
            if (section && section.href && this.currentBook && this.currentBook.navigation) {
              // return this.currentBook.navigation.get(section.href).label
              return this.navigation[this.section].label
            }
          }
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

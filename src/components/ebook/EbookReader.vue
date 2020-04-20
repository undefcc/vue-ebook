<template>
    <div class="ebook-reader">
        <div id="read"></div>
        <div class="ebook-reader-mask"
        @click="onMaskClick"
        @touchmove="move"
        @touchend="moveEnd"
        @mousedown.left="onMouseEnter"
        @mousemove.left="onMouseMove"
        @mouseup.left="onMouseEnd"></div>
    </div>
</template>

<script>
import Epub from 'epubjs'
import { ebookMixin } from '../../utils/mixin'
import { getFontFamily, saveFontFamily, getFontSize, saveFontSize, saveTheme, getTheme, getLocation } from '../../utils/localStorage'
import { flatten } from '../../utils/book'
import { getLocalForage } from '../../utils/localForage'
global.ePub = Epub

export default {
  mixins: [ebookMixin],
  methods: {
    onMouseEnter (e) {
        this.mouseState = 1
        this.mouseStartTime = e.timeStamp
        e.preventDefault()
        e.stopPropagation()
    },
    onMouseMove (e) {
        if (this.mouseState === 1) {
            this.mouseState = 2
        } else if (this.mouseState === 2) {
            // 与手机端类似，除了e.changedTouches[0].clientY变为e.clientY
            let offsetY = 0
            if (this.firstOffsetY) {
                offsetY = e.clientY - this.firstOffsetY
                this.setOffsetY(offsetY)
                e.preventDefault()
                e.stopPropagation()
            } else {
                this.firstOffsetY = e.clientY
            }
        }
        e.preventDefault()
        e.stopPropagation()
    },
    onMouseEnd (e) {
        if (this.mouseState === 2) {
            // 与手机端类似,多了this.mouseState = 3
            this.setOffsetY(0)
            this.firstOffsetY = null
            this.mouseState = 3
        } else {
            this.mouseState = 4
        }
        const time = e.timeStamp - this.mouseStartTime
        if (time < 100) { this.mouseState = 4 }
        e.preventDefault()
        e.stopPropagation()
    },
    move (e) {
        // console.log('move', e)
        let offsetY = 0
        if (this.firstOffsetY) {
            offsetY = e.changedTouches[0].clientY - this.firstOffsetY// 当前的Y - 初始的Y
            this.setOffsetY(offsetY)// 偏移量-->vuex-->index.hljs-value
            e.preventDefault()
            e.stopPropagation()
        } else {
            this.firstOffsetY = e.changedTouches[0].clientY// 第一个点击的触控点的Y（@touchstart来实现也可以，更精确）
        }
    },
    moveEnd (e) { // 重置
        // console.log('end', e)
        this.setOffsetY(0)
        this.firstOffsetY = null// 0也可以，null下次下拉会重新赋值
    },
    onMaskClick (e) {
        // console.log(e)
        // console.log(mouseState)
        if (this.mouseState && (this.mouseState === 2 || this.mouseState === 3)) { return }
        const offsetX = e.offsetX
        const width = window.innerWidth
        if (offsetX > 0 && offsetX < width * 0.3) {
            this.prevPage()
        } else if (offsetX > 0 && offsetX > width * 0.7) {
            this.nextPage()
        } else {
            this.toggleTitleAndMenu()
        }
    },
    prevPage () {
      if (this.rendition) {
        this.rendition.prev().then(() => this.refreshLocation())
        this.hideTitleAndMenu()
      }
    },
    nextPage () {
      if (this.rendition) {
        this.rendition.next().then(() => this.refreshLocation())
        this.hideTitleAndMenu()
      }
    },
    toggleTitleAndMenu () {
        // this.$store.dispatch('setMenuVisible', !this.menuVisible)
        if (this.menuVisible) {
            this.setSettingVisible(-1)// 菜单隐藏时，设置面板也隐藏
            this.setFontFamilyVisible(false)
        }
        this.setMenuVisible(!this.menuVisible)
    },
    initFontFamily () {
        const font = getFontFamily(this.fileName)// localStorage
        if (!font) {
            saveFontFamily(this.fileName, this.defaultFontFamily)
        } else {
            this.setDefaultFontFamily(font)
            this.rendition.themes.font(font)
        }
    },
    initFontSize () {
        const fontSize = getFontSize(this.fileName)// localStorage
        if (!fontSize) {
            saveFontSize(this.fileName, this.defaultFontSize)
        } else {
            this.setDefaultFontSize(fontSize)
            this.rendition.themes.fontSize(fontSize)
        }
    },
    initTheme () {
        let defaultTheme = getTheme(this.fileName)// localStorage
        if (!defaultTheme) {
            defaultTheme = this.themeList[0].name
            saveTheme(this.fileName, defaultTheme)
        }
        this.setDefaultTheme(defaultTheme)
        this.themeList.forEach(theme => { // 注入 iframe
            this.rendition.themes.register(theme.name, theme.style)
        })
        this.rendition.themes.select(this.defaultTheme)
    },
    initRendition () {
        this.rendition = this.book.renderTo('read', {
            width: innerWidth,
            height: innerHeight,
            methods: 'default' // 添加一个方法来适配微信
        })
        const location = getLocation(this.fileName)
        this.display(location, () => {
            this.initTheme()
            this.initFontFamily()
            this.initFontSize()
            this.initGlobalStyle()
        })
        // this.rendition.display().then(() => { // 初始化时对localStorage中的数据进行处理
        //     this.refreshLocation()
        // })
        this.rendition.hooks.content.register(contents => { // 注入字体文件
          Promise.all([
            contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/daysOne.css`),
            contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/cabin.css`),
            contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/montserrat.css`),
            contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/fonts/tangerine.css`)
          ]).then(() => {
            // console.log('字体加载完毕')
            if (this.$route.query.navigation) {
                this.display(this.$route.query.navigation)
            } else {
                const location = getLocation(this.fileName)
                if (location) {
                this.display(location)
                } else {
                this.display()
                }
            }
          })
      })
    },
    initGesture () {
        this.rendition.on('touchstart', event => {
            this.touchStartX = event.changedTouches[0].clientX
            this.touchStartTime = event.timeStamp
        })
        this.rendition.on('touchend', event => {
            const offsetX = event.changedTouches[0].clientX - this.touchStartX
            const time = event.timeStamp - this.touchStartTime
            // console.log(offsetX, time)
            if (time < 500 && offsetX > 40) {
                this.prevPage()
            } else if (time < 500 && offsetX < -40) {
                this.nextPage()
            } else {
                this.toggleTitleAndMenu()
            }
            event.preventDefault()// 禁用事件默认方法调用
            event.stopPropagation()// 禁止传播
        })
    },
    parseBook () {
        this.book.loaded.cover.then(cover => {
            this.book.archive.createUrl(cover).then(url => { // 返回blob链接
                this.setCover(url)
            })
        })
        this.book.loaded.metadata.then(metadata => {
            this.setMetadata(metadata)
        })
        this.book.loaded.navigation.then(nav => {
            const navItem = flatten(nav.toc)
            function find (item, level = 0) {
                return !item.parent
                ? level : find(navItem.filter(parentItem => parentItem.id === item.parent)[0], ++level)// 递归（每找一层父元素，level++）
            }
            navItem.forEach(item => {
                item.level = find(item)
            })
            // console.log(navItem)
            this.setNavigation(navItem)// 传给vuex
        })
    },
    initEpub (url) {
      this.book = new Epub(url)
      // console.log(this.book)
      this.setCurrentBook(this.book)
      this.initRendition()
      this.initGesture()
      this.parseBook()
      this.book.ready.then(() => {
          return this.book.locations.generate(
              750 * (window.innerWidth / 375) * (getFontSize(this.fileName) / 16)
          ) // 16 375是标准值（可能存在图片，精确分页不行，做进度条也有误差但还过得去，不影响使用）
      }).then(locations => {
          // console.log(locations)
          this.setBookAvailable(true)
          this.refreshLocation()// 分页完成后再调用一次，否则进度为null
      })
    }
  },
  mounted () {
    const books = this.$route.params.fileName.split('|')
    const fileName = books[1]
    getLocalForage(fileName, (err, blob) => {
        if (!err && blob) {
            // console.log('找到离线缓存电子书', fileName)
            this.setFileName(books.join('/')).then(() => {
                this.initEpub(blob)
            })
        } else {
            // console.log('无离线缓存，将在线获取电子书')
            // this.$store.dispatch('setFileName', fileName)
            this.setFileName(books.join('/')).then(() => {
            const url = process.env.VUE_APP_EPUB_URL + '/' + this.fileName + '.epub' // nginx 资源地址
            // console.log(url)
            this.initEpub(url)
            })
        }
    })
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
    @import "../../assets/styles/global";
    .ebook-reader {
        width: 100%;
        height: 100%;
        overflow: hidden;
        .ebook-reader-mask {
            position: absolute;
            z-index: 150;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
    }
</style>

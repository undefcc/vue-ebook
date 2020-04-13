<template>
    <div class="ebook-reader">
        <div id="read"></div>
    </div>
</template>

<script>
import Epub from 'epubjs'
import { ebookMixin } from '../../utils/mixin'
import { getFontFamily, saveFontFamily, getFontSize, saveFontSize, saveTheme, getTheme, getLocation } from '../../utils/localStorage'
global.ePub = Epub

export default {
  mixins: [ebookMixin],
  methods: {
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
    hideTitleAndMenu () {
        // this.$store.dispatch('setMenuVisible', false)
        this.setMenuVisible(false)
        this.setSettingVisible(-1)
        this.setFontFamilyVisible(false)
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
    initEpub () {
      const url = process.env.VUE_APP_RES_URL + '/epub/' + this.fileName + '.epub' // nginx 资源地址
      // console.log(url)
      this.book = new Epub(url)
      // console.log(this.book)
      this.setCurrentBook(this.book)
      this.initRendition()
      this.initGesture()
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
    const fileName = this.$route.params.fileName.split('|').join('/')
    // this.$store.dispatch('setFileName', fileName)
    this.setFileName(fileName).then(() => {
      this.initEpub()
    })
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
    @import "../../assets/styles/global";
</style>

import { getReadTime } from './localStorage'

export const FONT_SIZE_LIST = [
    { fontSize: '12px' },
    { fontSize: '14px' },
    { fontSize: '16px' },
    { fontSize: '18px' },
    { fontSize: '20px' },
    { fontSize: '22px' },
    { fontSize: '24px' }
]

export const FONT_FAMILY = [
    { font: 'Default' },
    { font: 'Cabin' },
    { font: 'Days One' },
    { font: 'Montserrat' },
    { font: 'Tangerine' }
]
/* eslint-disable */
export function themeList (vue) {
    return [
    {
      alias: vue.$t('book.themeDefault'),
      name: 'Default',
      style: {
        body: {
          'color': '#4c5059',
          'background': '#cecece'
        },
        img: {
          'width': '100%'
        },
        '.epubjs-hl': {
          'fill': 'red', 'fill-opacity': '0.3', 'mix-blend-mode': 'multiply'
        }
      }
    },
    {
      alias: vue.$t('book.themeGold'),
      name: 'Gold',
      style: {
        body: {
          'color': '#5c5b56',
          'background': '#c6c2b6'
        },
        img: {
          'width': '100%'
        },
        '.epubjs-hl': {
          'fill': 'red', 'fill-opacity': '0.3', 'mix-blend-mode': 'multiply'
        }
      }
    },
    {
      alias: vue.$t('book.themeEye'),
      name: 'Eye',
      style: {
        body: {
          'color': '#404c42',
          'background': '#a9c1a9'
        },
        img: {
          'width': '100%'
        },
        '.epubjs-hl': {
          'fill': 'red', 'fill-opacity': '0.3', 'mix-blend-mode': 'multiply'
        }
      }
    },
    {
      alias: vue.$t('book.themeNight'),
      name: 'Night',
      style: {
        body: {
          'color': '#cecece',
          'background': '#000000'
        },
        img: {
          'width': '100%'
        },
        '.epubjs-hl': {
          'fill': 'red', 'fill-opacity': '0.3', 'mix-blend-mode': 'multiply'
        }
      }
    }
  ]
}

export function addCss (href) {
    const link = document.createElement('link')
    link.setAttribute('rel', 'stylesheet')
    link.setAttribute('type', 'text/css')
    link.setAttribute('href', href)
    document.getElementsByTagName('head')[0].appendChild(link)
}

export function removeCss (href) {
    const links = document.getElementsByTagName('link')
    for (let i = links.length; i >= 0; i--) { // 若links还存在length才进行操作，可能每趟循环会删一个
        const link = links[i]
        if( link && link.getAttribute('href') && link.getAttribute('href') === href ) {
            link.parentNode.removeChild(link)
        }
    }
}

export function removeAllCss () {
    removeCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
    removeCss(`${process.env.VUE_APP_RES_URL}/theme/theme_eye.css`)
    removeCss(`${process.env.VUE_APP_RES_URL}/theme/theme_gold.css`)
    removeCss(`${process.env.VUE_APP_RES_URL}/theme/theme_night.css`)
}

export function getReadTimeByMinute (fileName) {
    const readTime = getReadTime(fileName)
    if (!readTime) {
        return 0
    } else {
        return Math.ceil(readTime / 60)
    }
}

export function flatten (array) {
    // return array.map(item => [].concat(item, ...item.subitems))// 只能2级
    const arr2d = array.map(item => [].concat(item, ...flatten(item.subitems)))// 多级（转成二维数组）
    return [].concat(...arr2d)// 二维转一维
}
<template>
    <div class="shelf-footer" v-show="isEditMode">
        <div class="shelf-footer-tab-wrapper" v-for="item in tabs" :key="item.index" @click="onTabClick(item)">
            <div class="shelf-footer-tab" :class="{'is-selected': isSelected}">
                <div class="icon-private tab-icon" v-if="item.index === 1 && !isPrivate"></div>
                <div class="icon-private-see tab-icon" v-if="item.index === 1 && isPrivate"></div>
                <div class="icon-download tab-icon" v-if="item.index === 2 && !isDownload"></div>
                <div class="icon-download-remove tab-icon" v-if="item.index === 2 && isDownload"></div>
                <div class="icon-move tab-icon" v-if="item.index === 3"></div>
                <div class="icon-shelf tab-icon" v-if="item.index === 4"></div>
                <div class="tab-text" :class="{'remove-text': item.index === 4}">{{label(item)}}</div>
            </div>
        </div>
    </div>
</template>

<script>
import { storeShelfMixin } from '../../utils/mixin'
import { saveBookShelf, removeLocalStorage } from '../../utils/localStorage'
import { download } from '../../api/store'
import { removeLocalForage } from '../../utils/localForage'

export default {
    mixins: [storeShelfMixin],
    data () {
        return {
            popupMenu: null
        }
    },
    methods: {
        async downloadSelectedBook () {
            for (let i = 0; i < this.shelfSelected.length; i++) {
                 await this.downloadBook(this.shelfSelected[i]).then(book => {
                    book.cache = true
                })
            }
            this.onComplete()
        },
        downloadBook (book) {
            // console.log(book)
            let text = ''
            const toast = this.toast({
                text: text
            })
            toast.continueShow()
            return new Promise((resolve, reject) => {
                download(book, book => {
                    // console.log('下载完毕')
                    toast.hide()// toast.hide()后面再simpleToast()有问题，用creatAPI的remove方法销毁
                    resolve(book)// Promise对象（回到调用者的then中）
                }, reject, progressEvent => {
                    // 下载进度
                    // console.log(progressEvent)
                    // 进度计算
                    const progress = Math.floor(progressEvent.loaded / progressEvent.total * 100) + '%'
                    text = this.$t('shelf.progressDownload').replace('$1', `${book.fileName}.epub(${progress})`)
                    // console.log(text)
                    toast.updateText(text)
                })
            })
        },
        removeSelectedBook () {
            Promise.all(this.shelfSelected.map(book => this.removeBook(book)))// Promise.all一次性返回所有处理完的结果
                   .then(books => {
                        books.map(book => {
                            book.cache = false
                        })
                        saveBookShelf(this.shelfList)// 更新LocalStorage
                        this.simpleToast(this.$t('shelf.removeDownloadSuccess'))// 删除成功
                        this.onComplete()
                   })
        },
        removeBook (book) {
            return new Promise((resolve, reject) => {
                removeLocalStorage(`${book.categoryText}/${book.fileName}-info`)// 删除相关阅读信息
                removeLocalForage(`${book.fileName}`)// 删除电子书（可以再带两个参数resolve,reject，下面resovle(book)不写）
                resolve(book)// 处理完后调用（传给调用本Promise对象的方法的then）
            })
        },
        hidePopup () {
            this.popupMenu.hide()
        },
        onComplete () {
            this.hidePopup()
            this.setIsEditMode(false)
            saveBookShelf(this.shelfList)// shelfSelected是shelfList的引用（两者联动变化）
        },
        setPrivate () {
            let isPrivate
            if (this.isPrivate) {
                isPrivate = false
            } else {
                isPrivate = true
            }
            this.shelfSelected.forEach(book => {
                book.private = isPrivate
            })
            this.onComplete()
            if (isPrivate) {
                this.simpleToast(this.$t('shelf.setPrivateSuccess'))
            } else {
                this.simpleToast(this.$t('shelf.closePrivateSuccess'))
            }
        },
        async setDownload () {
            if (this.isDownload) {
                this.removeSelectedBook()
            } else {
                await this.downloadSelectedBook()// 异步，所以使得和simpleToast()同时执行（还没下完就关了，采用async+await解决[内部仍然异步，但会执行完本行后再继续下一行代码]）
                saveBookShelf(this.shelfList)
                this.simpleToast(this.$t('shelf.setDownloadSuccess'))// （打印空白，因为上一个值toast.hide()还没销毁[create-api机制问题]，改成toast.remove()）
            }
        },
        removeSelected () {
            this.shelfSelected.forEach(selected => {
               this.setShelfList(this.shelfList.filter(book => book !== selected))
            })
            this.setShelfSelected([])
            this.onComplete()
        },
        showPrivate () {
            // this.toast({ text: 'hello toast!' }).show()
            this.popupMenu = this.popup({
                title: this.isPrivate ? this.$t('shelf.closePrivateTitle') : this.$t('shelf.setPrivateTitle'),
                btn: [
                    {
                        text: this.isPrivate ? this.$t('shelf.close') : this.$t('shelf.open'),
                        click: () => {
                            this.setPrivate()
                        }
                    },
                    {
                        text: this.$t('shelf.cancel'),
                        click: () => {
                            // this.toast({ text: '正在取消...' }).show()
                            this.hidePopup()
                        }
                    }
                ]
            }).show()
        },
        showDonwload () {
            this.popupMenu = this.popup({
                title: this.isDownload ? this.$t('shelf.removeDownloadTitle') : this.$t('shelf.setDownloadTitle'),
                btn: [
                    {
                        text: this.isDownload ? this.$t('shelf.delete') : this.$t('shelf.download'),
                        click: () => {
                            this.setDownload()
                        }
                    },
                    {
                        text: this.$t('shelf.cancel'),
                        click: () => {
                            // this.toast({ text: '正在取消...' }).show()
                            this.hidePopup()
                        }
                    }
                ]
            }).show()
        },
        showRemove () {
            let title
            if (this.shelfSelected.length === 1) {
                title = this.$t('shelf.removeBookTitle').replace('$1', `《${this.shelfSelected[0].title}》`)
            } else {
                title = this.$t('shelf.removeBookTitle').replace('$1', this.$t('shelf.selectedBooks'))
            }
            this.popupMenu = this.popup({
                title: title,
                btn: [
                    {
                        text: this.$t('shelf.removeBook'),
                        type: 'danger',
                        click: () => {
                            this.removeSelected()
                        }
                    },
                    {
                        text: this.$t('shelf.cancel'),
                        click: () => {
                            // this.toast({ text: '正在取消...' }).show()
                            this.hidePopup()
                        }
                    }
                ]
            }).show()
        },
        onTabClick (item) {
            if (!this.isSelected) { // 没选中图书不能点菜单
                return
            }
            switch (item.index) {
                case 1:
                    this.showPrivate()
                    break
                case 2:
                    this.showDonwload()
                    break
                case 3:
                    this.dialog().show()
                    break
                case 4:
                    this.showRemove()
                    break
                default:
                    break
            }
        },
        label (item) {
            switch (item.index) {
                case 1:
                    return this.isPrivate ? item.label2 : item.label
                case 2:
                    return this.isDownload ? item.label2 : item.label
                default:
                    return item.label
            }
        }
    },
    computed: {
        isSelected () {
            return this.shelfSelected && this.shelfSelected.length > 0
        },
        tabs () {
            return [
                {
                    label: this.$t('shelf.private'),
                    label2: this.$t('shelf.noPrivate'),
                    index: 1
                },
                {
                    label: this.$t('shelf.download'),
                    label2: this.$t('shelf.delete'),
                    index: 2
                },
                {
                    label: this.$t('shelf.move'),
                    index: 3
                },
                {
                    label: this.$t('shelf.remove'),
                    index: 4
                }
            ]
        },
        isPrivate () {
            if (!this.isSelected) {
                return false
            } else {
                return this.shelfSelected.every(item => item.private)
            }
        },
        isDownload () {
            if (!this.isSelected) {
                return false
            } else {
                return this.shelfSelected.every(item => item.cache)
            }
        }
    }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .shelf-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      z-index: 120;
      display: flex;
      height: px2rem(48);
      width: 100%;
      background-color: #fff;
      border: px2rem(1) solid #ccc;
      .shelf-footer-tab-wrapper {
          flex: 1;
          width: 25%;
          height: 100%;
          .shelf-footer-tab {
              width: 100%;
              height: 100%;
              @include columnCenter;
              opacity: .5;
              &.is-selected {
                opacity: 1;
              }
              .tab-icon {
                  font-size: px2rem(20);
                  color: #666;
              }
              .tab-text {
                  margin-top: px2rem(5);
                  font-size: px2rem(12);
                  color: #666;
                  &.remove-text {
                      color: $color-pink;
                  }
              }
              .icon-shelf {
                  color: $color-pink;
              }
          }
      }
  }
</style>

<template>
<transition name="fade">
  <div class="shelf-title" v-show="shelfTitleVisible" :class="{'hide-shadow': ifHideShadow}">
      <div class="shelf-title-text-wrapper">
          <span class="shelf-title-text">{{title}}</span>
          <span class="shelf-title-sub-text" v-show="isEditMode">{{selectedText}}</span>
      </div>
      <div class="shelf-title-btn-wrapper shelf-title-left" v-if="showClear">
          <span class="shelf-title-btn-text" @click="clearCache">{{$t('shelf.clearCache')}}</span>
      </div>
      <div class="shelf-title-btn-wrapper shelf-title-right" v-if="showEdit">
          <span class="shelf-title-btn-text" @click="onEditClick">{{isEditMode ? $t('shelf.cancel') : $t('shelf.edit')}}</span>
      </div>
      <div class="shelf-title-btn-wrapper shelf-title-left" v-if="showBack">
          <span class="icon-back" @click="back"></span>
      </div>
      <div class="shelf-title-btn-wrapper" :class="{'shelf-title-left': changeGroupLeft,'shelf-title-right': changeGroupRight}" @click="changeGroup" v-if="showChangeGroup">
        <span class="shelf-title-btn-text">{{$t('shelf.editGroup')}}</span>
      </div>
  </div>
</transition>
</template>

<script>
import { storeShelfMixin } from '../../utils/mixin'
import { clearLocalStorage, saveBookShelf } from '../../utils/localStorage'
import { clearLocalForage } from '../../utils/localForage'

export default {
    mixins: [storeShelfMixin],
    props: {
        title: {
            type: String
        },
        ifShowBack: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            ifHideShadow: true
        }
    },
    computed: {
        emptyCotagory () {
            return !this.shelfCategory || !this.shelfCategory.itemList || this.shelfCategory.itemList.length === 0
        },
        showEdit () {
            return this.currentType === 1 || !this.emptyCotagory
        },
        showClear () {
            return this.currentType === 1
        },
        showBack () {
            return this.currentType === 2 && !this.isEditMode
        },
        showChangeGroup () {
            return this.currentType === 2 && (this.isEditMode || this.emptyCotagory)
        },
        changeGroupLeft () {
            return !this.emptyCotagory
        },
        changeGroupRight () {
            return this.emptyCotagory
        },
        selectedText () {
            const selectedNum = this.shelfSelected.length
            return selectedNum <= 0
            ? this.$t('shelf.selectBook') : (
                selectedNum === 1
                ? this.$t('shelf.haveSelectedBook').replace('$1', selectedNum) : this.$t('shelf.haveSelectedBooks').replace('$1', selectedNum)
            )
        },
        popupCancelBtn () {
            return this.createPopupBtn(this.$t('shelf.cancel'), () => { this.hidePopup() })
        }
    },
    methods: {
        onCompelete () {
          this.hidePopup()
          this.setShelfList(this.shelfList.filter(book => book.id !== this.shelfCategory.id)).then(() => {
              saveBookShelf(this.shelfList)
              this.$router.go(-1)
              this.setIsEditMode(false)
          })
        },
        back () {
            this.$router.go(-1)
            this.setIsEditMode(false)
        },
        onEditClick () {
            if (!this.isEditMode) {
                this.setShelfSelected([])
                this.shelfList.forEach(item => {
                    item.selected = false
                    if (item.itemList) {
                        item.itemList.forEach(subItem => {
                            subItem.selected = false
                        })
                    }
                })
            }
            this.setIsEditMode(!this.isEditMode)
        },
        clearCache () {
            clearLocalStorage()
            clearLocalForage()
            this.setShelfList([])
            this.setShelfSelected([])
            this.getShelfList()
            this.simpleToast(this.$t('shelf.clearCacheSuccess'))
        },
        changeGroupName () {
            this.hidePopup()
            this.dialog({
                showNewGroup: true,
                groupName: this.shelfCategory.title
            }).show()
        },
        createPopupBtn (text, onClick, type = 'normal') {
            return {
                text: text,
                type: type,
                click: onClick
            }
        },
        hidePopup () {
            this.popupMenu.hide()
        },
        deleteGroup () {
            // 把书搬出
            if (!this.emptyCotagory) {
                this.setShelfSelected(this.shelfCategory.itemList)// 全选
                this.moveOutOfGroup(this.onCompelete)
            } else {
                this.onCompelete()
            }
            // 删除分组
        },
        showDeleteGroup () {
            this.hidePopup()
                setTimeout(() => {
                this.popupMenu = this.popup({
                    title: this.$t('shelf.deleteGroupTitle'),
                    btn: [
                        this.createPopupBtn(this.$t('shelf.confirm'), () => { this.deleteGroup() }, 'danger'),
                        this.popupCancelBtn
                    ]
                }).show()
            }, 200)
        },
        changeGroup () {
            // console.log('changeGroup...')
            this.popupMenu = this.popup({
                btn: [
                    this.createPopupBtn(this.$t('shelf.editGroupName'), () => { this.changeGroupName() }),
                    this.createPopupBtn(this.$t('shelf.deleteGroup'), () => { this.showDeleteGroup() }, 'danger'),
                    this.popupCancelBtn
                ]
            }).show()
        }
    },
    watch: {
        offsetY (v) {
            if (v > 0) {
                this.ifHideShadow = false
            } else {
                this.ifHideShadow = true
            }
        }
    }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  .shelf-title {
      position: relative;
      z-index: 130;
      width: 100%;
      height: px2rem(42);
      background-color: #fff;
      box-shadow: 0 px2rem(2) px2rem(2) 0 rgba($color: #000000, $alpha: .1);
      &.hide-shadow {
          box-shadow: none;
      }
      .shelf-title-text-wrapper{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: px2rem(42);
        @include columnCenter;
        .shelf-title-text {
            font-size: px2rem(16);
            line-height: px2rem(20);
            font-weight: bold;
            color: #333;
        }
        .shelf-title-sub-text {
            font-size: px2rem(10);
            color: #333;
        }
      }
      .shelf-title-btn-wrapper{
          position: absolute;
          top: 0;
          box-sizing: border-box;
          height: 100%;
          .shelf-title-btn-text {
              font-size: px2rem(14);
              color: #aaa;
          }
          &.shelf-title-left {
              left: 0;
              padding-left: px2rem(15);
              .icon-back {
                  font-size: px2rem(20);
                  color: #666;
              }
          }
          &.shelf-title-right {
              right: 0;
              padding-right: px2rem(15);
          }
      }
  }
</style>

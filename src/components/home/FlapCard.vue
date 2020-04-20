<template>
  <div class="flap-card-wrapper" v-show="flapCardVisible">
      <div class="flap-card-bg" :class="{'animation': runFlapCardAnimation}" v-show="runFlapCardAnimation">
          <div class="flap-card" v-for="(item, index) in flapCardList" :key="index" :style="{zIndex: item.zIndex}">
              <div class="flap-card-circle">
                  <div class="flap-card-semi-circle flap-card-semi-circle-left"
                  :style="semiCircleStyle(item, 'left')" ref="left"></div>
                  <div class="flap-card-semi-circle flap-card-semi-circle-right"
                  :style="semiCircleStyle(item, 'right')" ref="right"></div>
              </div>
          </div>
          <div class="point-wrapper">
              <div class="point" :class="{'animation': runPointAnimation}" v-for="item in pointList" :key="item"></div>
          </div>
      </div>
      <div class="book-card" :class="{'animation': runBookCardAnimation}" v-if="ifShowBookCard">
        <div class="book-card-wrapper">
            <div class="img-wrapper">
                <img class="img" :src="data ? data.cover : ''">
            </div>
            <div class="content-wrapper">
                <div class="title">{{data ? data.title : ''}}</div>
                <div class="author sub-title-medium">{{data ? data.author : ''}}</div>
                <div class="category">{{categoryText()}}</div>
            </div>
            <div class="read-btn" @click.stop="showBookDetail(data)">{{$t('home.readNow')}}</div>
        </div>
      </div>
      <div class="close-btn-wrapper" @click="close"><div class="icon-close"></div></div>
  </div>
</template>

<script>
import { storeHomeMixin } from '../../utils/mixin'
import { flapCardList, categoryText } from '../../utils/store'

export default {
    mixins: [storeHomeMixin],
    props: {
        data: Object
    },
    data () {
        return {
            pointList: null,
            flapCardList,
            front: 0,
            back: 1,
            intervalTime: 25,
            pointTime: 750,
            firstShowTime: 300,
            stopTime: 2500,
            runPointAnimation: false,
            runFlapCardAnimation: false,
            runBookCardAnimation: false,
            ifShowBookCard: false,
            ifShowFlapCard: true,
            ifShowPoint: true
        }
    },
    watch: {
        flapCardVisible (v) {
            if (v) {
                this.runAnimation()
            }
        }
    },
    methods: {
        close () {
            this.setFlapCardVisible(false)
            this.stopAnimation()
        },
        reset () {
            this.front = 0
            this.back = 1
            this.flapCardList.forEach((item, index) => {
                item.zIndex = 100 - index
                item._g = item.g
                item.rotateDegree = 0
                this.rotate(index, 'front')
                this.rotate(index, 'back')
            })
            this.runBookCardAnimation = false
            this.runFlapCardAnimation = false
            this.runPointAnimation = false
            this.ifShowBookCard = false
        },
        stopAnimation () {
            this.runFlapCardAnimation = false
            if (this.task) { clearInterval(this.task) }
            if (this.timeout) { clearTimeout(this.timeout) }
            if (this.timeout2) { clearTimeout(this.timeout2) }
            this.reset()
        },
        runAnimation () {
            this.runFlapCardAnimation = true
            this.timeout = setTimeout(() => { // 等待弹出动画
                this.startFlapCardAnimation()
                this.startPointAnimation()
            }, 300)
            this.timeout2 = setTimeout(() => {
                this.stopAnimation()
                this.runBookCardAnimation = true
                this.ifShowBookCard = true
            }, 2500)
        },
        semiCircleStyle (item, dir) { // 动态构造每一层的左右样式
            return {
                backgroundColor: `rgb(${item.r}, ${item.g}, ${item.b})`,
                backgroundSize: item.backgroundSize,
                backgroundImage: dir === 'left' ? item.imgLeft : item.imgRight
            }
        },
        rotate (index, type) {
            // 默认中轴转动，在样式中transform-origin: left/right/center设置转动轴
            // 默认正反两面都显示，在样式中backface-visibility: hidden;设置转到背面后隐藏（本层转到90度后交给下层旋转）
            const item = this.flapCardList[index]// 获取属性值
            let dom
            if (type === 'front') { // 正面翻过去的动画
                dom = this.$refs.right[index]// 获取右半边
            } else { // 反面反过来的动画
                dom = this.$refs.left[index]// 获取左半边
            }
            dom.style.transform = `rotateY(${item.rotateDegree}deg)`// 旋转到当前度数
            dom.style.backgroundColor = `rgb(${item.r}, ${item._g}, ${item.b})`// 根据g的副本改动，即_g
        },
        prepare () { // 让第二层预转动半圈
            const backFlapCard = this.flapCardList[this.back]// 获取正面第二层的信息
            backFlapCard.rotateDegree = 180// 先转到180（保证左半边保持与右半边同一起点）
            backFlapCard._g -= 5 * 18// 先加深（预备变浅）
            this.rotate(this.back, 'back')
        },
        flapCardRotate () {
            const frontFlapCard = this.flapCardList[this.front]// 获取正面第一层的信息
            const backFlapCard = this.flapCardList[this.back]// 获取正面第二层的信息
            frontFlapCard.rotateDegree += 10 // 旋转
            frontFlapCard._g -= 5// 加深
            backFlapCard.rotateDegree -= 10 // 旋转
            backFlapCard._g += 5// 变浅
            if (frontFlapCard.rotateDegree === 90 && backFlapCard.rotateDegree === 90) {
                backFlapCard.zIndex += 2 // 盖过上一层的z-index（+1只等于上一层）
            }
            this.rotate(this.front, 'front')
            this.rotate(this.back, 'back')
            if (frontFlapCard.rotateDegree === 180 && backFlapCard.rotateDegree === 0) { // 上层转到180度，下层转回0度时
                this.next() // 进入下一轮翻页
            }
        },
        next () {
            const frontFlapCard = this.flapCardList[this.front]// 获取正面第一层的信息
            const backFlapCard = this.flapCardList[this.back]// 获取正面第二层的信息
            /* 归位 */
            frontFlapCard.rotateDegree = 0
            backFlapCard.rotateDegree = 0
            frontFlapCard._g = frontFlapCard.g
            backFlapCard._g = backFlapCard.g
            this.rotate(this.front, 'front')
            this.rotate(this.back, 'back')
            /* 指向下一层 */
            this.front++
            this.back++
            const len = this.flapCardList.length
            if (this.front >= len) {
                this.front = 0
            }
            if (this.back >= len) {
                this.back = 0
            }
            /* 整理zIndex值 */
            this.flapCardList.forEach((item, index) => {
                item.zIndex = 100 - ((index - this.front + len) % len)// 100->96; 99->100; 98->99; 97->98; 96->97
            })
            /* 新指向的两层执行prepare */
            this.prepare()
        },
        startFlapCardAnimation () {
            this.prepare()
            this.task = setInterval(() => {
                this.flapCardRotate()
            }, this.intervalTime)
        },
        startPointAnimation () {
            this.runPointAnimation = true
            setTimeout(() => {
                this.runPointAnimation = false
            }, 750)
        },
        categoryText () {
            if (this.data) { // 初始时没数据也会调用一次，有数据后又调用一次所以要判断
                categoryText(this.data.category, this)
            }
        }
    },
    created () {
        this.pointList = []
        for (let i = 0; i < 18; i++) {
            this.pointList.push(`point${i}`)
        }
    }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";
  @import "../../assets/styles/flapCard";
  .flap-card-wrapper {
      z-index: 1000;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, .6);
      @include center;
      @include absCenter;
      .flap-card-bg {
          position: relative;
          width: px2rem(64);
          height: px2rem(64);
          border-radius: px2rem(5);
          background: white;
          transform: scale(0);
          opacity: 0;
          &.animation {
              animation: flap-card-move .3s ease-in both;
          }
          @keyframes flap-card-move {
            0% {
                transform: scale(0);
                opacity: 0;
            }
            50% {
                transform: scale(1.2);
                opacity: 1;
            }
            75% {
                transform: scale(.9);
                opacity: 1;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
          }
          .flap-card { //重叠的圆
              width: px2rem(48);
              height: px2rem(48);
              @include absCenter;
              .flap-card-circle { // 包裹两个圆
                  display: flex;
                  width: 100%;
                  height: 100%;
                  .flap-card-semi-circle { // 控制圆的布局
                      flex: 0 0 50%;
                      width: 50%;
                      height: 100%;
                      background: orange;
                      background-repeat: no-repeat;
                      backface-visibility: hidden;
                  }
                  .flap-card-semi-circle-left { // 左半圆
                      border-radius: px2rem(24) 0 0 px2rem(24);
                      background-position: center right;
                      transform-origin: right;
                  }
                  .flap-card-semi-circle-right { // 右半圆
                      border-radius: 0 px2rem(24) px2rem(24) 0;
                      background-position: center left;
                      transform-origin: left;
                  }
              }
          }
          .point-wrapper {
              z-index: 150;
              @include absCenter;
              .point {
                  border-radius: 50%;
                  @include absCenter;
                  &.animation {
                      @for $i from 1 to length($moves) {
                          &:nth-child(#{$i}) {
                              @include move($i)
                          }
                      }
                  }
              }
          }
      }
      .book-card {
        position: relative;
        width: 65%;
        // height: 70%;
        box-sizing: border-box;
        border-radius: px2rem(15);
        background: white;
        &.animation {
            animation: scale $bookShowTime ease-in both;
            @keyframes scale {
            0% {
                transform: scale(0);
                opacity: 0;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
            }
        }
        .book-card-wrapper {
            width: 100%;
            height: 100%;
            margin-bottom: px2rem(30);
            @include columnTop;
            .img-wrapper {
                width: 100%;
                margin-top: px2rem(20);
                @include center;
                .img {
                width: px2rem(90);
                height: px2rem(130);
                }
            }
            .content-wrapper {
                padding: 0 px2rem(20);
                margin-top: px2rem(20);
                margin-bottom: px2rem(20);
                .title {
                    color: #333;
                    font-weight: bold;
                    font-size: px2rem(18);
                    line-height: px2rem(20);
                    max-height: px2rem(40);
                    text-align: center;
                    @include ellipsisMulti(2)
                }
                .author {
                    margin-top: px2rem(10);
                    text-align: center;
                    font-size: px2rem(12);
                }
                .category {
                    color: #999;
                    font-size: px2rem(14);
                    margin-top: px2rem(10);
                    text-align: center;
                }
            }
            .read-btn {
                position: absolute;
                bottom: 0;
                left: 0;
                z-index: 1100;
                width: 100%;
                border-radius: 0 0 px2rem(15) px2rem(15);
                padding: px2rem(15) 0;
                text-align: center;
                color: white;
                font-size: px2rem(14);
                background: $color-blue;
            }
          }
        }
      .close-btn-wrapper {
          position: absolute;
          left: 0;
          bottom: px2rem(30);
          z-index: 1100;
          width: 100%;
          @include center;
          .icon-close {
              width: px2rem(45);
              height: px2rem(45);
              font-size: px2rem(25);
              border-radius: 50%;
              background-color: #333;
              color: white;
              @include center
          }
      }
  }
</style>

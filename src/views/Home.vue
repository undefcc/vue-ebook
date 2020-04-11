<template>
  <div class='home'>
    <span class="icon-bookmark"></span>
    <!-- <div id="read"></div> -->
  </div>
</template>

<script>
import Epub from 'epubjs'
global.ePub = Epub

export default {
  name: 'home'
  // mounted () {
  //   this.book = new Epub('/2017_Book_InterdisciplinaryPerspectivesO.epub')
  //   // console.log(this.book)
  //   this.book.renderTo('read', {
  //     width: window.innerWidth,
  //     height: window.innerHeight
  //   }).display()
  // }
}
</script>

/* eslint-disable */
import localForage from 'localforage'

export function setLocalForage(key, data, cb, cb2) { // NoSQL提供要key
  localForage.setItem(key, data).then((value) => {
    if (cb) cb(value)// success
  }).catch(function(err) {
    if (cb2) cb2(err)// fail
  })
}

export function getLocalForage(key, cb) { // 类似nodejs，通过回调操作
  localForage.getItem(key, (err, value) => {
    cb(err, value)
  })
}

export function removeLocalForage(key, cb, cb2) { // 根据key删
  localForage.removeItem(key).then(function() {
    if (cb) cb()
  }).catch(function(err) {
    if (cb2) cb2(err)
  })
}

export function clearLocalForage(cb, cb2) { // 清空LocalForage
  localForage.clear().then(function() {
    cb()
  }).catch(function(err) {
    cb2(err)
  })
}

export function lengthLocalForage(cb) { // 遍历indexDB长度，有多少Key
  localForage.length().then(
    numberOfKeys => {
      if (cb) cb(numberOfKeys)
      // console.log(numberOfKeys)
    }).catch(function(err) {
    // console.log(err)
    if (err) {}
  })
}

export function iteratorLocalForage() { // 遍历有多少元素，每个元素key value是什么
  localForage.iterate(function(value, key, iterationNumber) {
    // console.log([key, value])
  }).then(function() {
    // console.log('Iteration has completed')
  }).catch(function(err) {
    // console.log(err)
    if (err) {}
  })
}

export function support() { // 判断浏览器是否支持indexDB数据库（Chrome、Safari、安卓、微信都支持）
  const indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || null
  if (indexedDB) {
    return true
  } else {
    return false
  }
}

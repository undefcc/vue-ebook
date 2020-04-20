import axios from 'axios'
import { setLocalForage } from '../utils/localForage'

export function flatList () {
  return axios({
    method: 'get',
    url: `${process.env.VUE_APP_BOOK_URL}/book/flat-list`
  })
}

export function home () {
    return axios({
        method: 'get',
        url: `${process.env.VUE_APP_BASE_URL}/book/home`
    })
}

export function detail (book) { // 暂时调用线上地址
    return axios({
        method: 'get',
        url: `${process.env.VUE_APP_BOOK_URL}/book/detail`,
        params: {
            fileName: book.fileName
        }
    })
}

export function list () {
    return axios({
        method: 'get',
        url: `${process.env.VUE_APP_BASE_URL}/book/list`
    })
}

export function shelf () {
    return axios({
        method: 'get',
        url: `${process.env.VUE_APP_BASE_URL}/book/shelf`
    })
}

export function download (book, onSuccess, onError, onProgress) {
    if (!onProgress) {
        onProgress = onError// 若第四个参数不存在，第三个作第四个，第三个赋为空
        onError = null
    }
    return axios.create({ // create方法会返回axios实例
        baseURL: process.env.VUE_APP_EPUB_URL,
        method: 'get',
        responseType: 'blob',
        timeout: 180 * 1000, // 3分钟
        onDownloadProgress: progressEvent => { // axios监听下载进度
            if (onProgress) onProgress(progressEvent)
        }
    }).get(`${book.categoryText}/${book.fileName}.epub`)
      .then(res => {
          // console.log(res)
          const blob = new Blob([res.data])
          setLocalForage(book.fileName, blob, () => { // 书名作Key，blob对象作参数，回调
              if (onSuccess) onSuccess(book)// 执行成功回调
          }, err => {
              if (onError) onError(err)// 执行错误回调
          })
      })
      .catch(err => {
        if (onSuccess) onSuccess(err)// 执行错误回调
      })
}

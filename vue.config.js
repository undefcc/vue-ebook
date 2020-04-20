/*
function mock (app, url, data) {
    app.get(url, (req, res) => {
        res.json(data)
    })
}

const homeData = require('./src/mock/bookHome')
const shelfData = require('./src/mock/bookShelf')
const listData = require('./src/mock/bookList')
const flatListData = require('./src/mock/bookFlatList')
*/

module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? './' : '/',//环境变量process.env配置路径
    
    devServer: {
        /*
        before (app) {
            mock(app, '/book/home', homeData)
            mock(app, '/book/shelf', shelfData)
            mock(app, '/book/list', listData)
            mock(app, '/book/flat-list', flatListData)
        }
        */
    },
    configureWebpack: {
        performance: {
            hints: 'warning',
            maxAssetSize: 524288,
            maxEntrypointSize: 524288// 512 * 1024
        }
    }
}
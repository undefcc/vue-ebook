/* eslint-disable */
const book = {
    state: {
        test: 1
    },
    mutations: {
        'SET_TEST': (state, newTest) => { // 第一个参数一般为state，第二个一般是 值或有返回值的方法
        state.test = newTest
        }
    },
    actions: {
        setTest: ({ commit, state }, newTest) => { // commit调用方法，state获取原有值
        // console.log(state.test, newTest)// 修改调用参数，会记录上一次的值和新修改的值
        return commit('SET_TEST', newTest)// 返回promise对象（异步链式.then）
        }
    },
    modules: {

    }
}

export default book
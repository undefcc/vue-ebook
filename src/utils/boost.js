/* eslint-disable */
Array.prototype.pushWithoutDuplicate = function () {
    for (let i = 0; i < arguments.length; i++) { // 获取argument列表（参数列表）
        const arg = arguments[i]
        if (this.indexOf(arg) === -1) { // this指向数组Array
            this.push(arg)
        }
    }
}
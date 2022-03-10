/**
 *手写promise
 *规范：promise/A+、ECMAscript6
 */

//  定义三个状态常量
const PROMICE_STATUS_PENDING = 'pending'
const PROMICE_STATUS_FULFILLED = 'fulfilled'
const PROMICE_STATUS_REJECTED = 'rejected'

// 工具函数
function execFunctionWithCatchError(execFn, value, resolve, reject) {
    try {
        const result = execFn(value)
        resolve(result)
    } catch (err) {
        reject(err)
    }
}

class Promice {
    // 规划构造函数
    constructor(executor) {
        //定义初始状态
        this.status = PROMICE_STATUS_PENDING
        this.value = undefined
        this.reason = undefined

        // 用于对then优化
        this.onFulfilledFns = []
        this.onRejectedFns = []

        // 2.定义resolve、reject回调
        const resolve = (value) => {
            if (this.status === PROMICE_STATUS_PENDING) {
                queueMicrotask(() => {
                    if (this.status != PROMICE_STATUS_PENDING) return
                    this.status = PROMICE_STATUS_FULFILLED
                    this.value = value
                    this.onFulfilledFns.forEach(fn => {
                        fn(this.value)
                    })
                })
            }
        }

        const reject = reason => {
            if (this.status === PROMICE_STATUS_PENDING) {
                queueMicrotask(() => {
                    if (this.status !== PROMICE_STATUS_PENDING) return
                    this.status = PROMICE_STATUS_REJECTED
                    this.reason = reason
                    this.onRejectedFns.forEach(fn => {
                        fn(this.reason)
                    })
                })
            }
        }
        /**
         * 3.二选一
         * 1）.resolve执行微任务队列：改变状态、获取value、then传入执行成功回调
         * 2）.reject执行微任务队列：改变状态、获取value、then传入执行失败回调
         */
        try {
            executor(resolve, reject)
        } catch (err) {
            reject(err)
        }
    }
    // 实现then方法
    then(onFulfilled, onRejected) {
        // this.onFulfilled = onFulfilled
        // this.onRejected = onRejected
        return new Promice((resolve, reject) => {
            /**
             * 状态已确定
             */
            if (this.status === PROMICE_STATUS_FULFILLED && onFulfilled) {
                // try {
                //     const value = onFulfilled(this.value)
                //     resolve(value)
                // } catch (err) {
                //     reject(err)
                // }
                execFunctionWithCatchError(onFulfilled, this.value, resolve, reject)
            }
            if (this.status === PROMICE_STATUS_REJECTED && onRejected) {
                // try {
                //     const reason = onRejected(this.reason)
                //     resolve(reason)
                // } catch (err) {
                //     reject(err)
                // }
                execFunctionWithCatchError(onRejected, this.reason, resolve, reject)
            }
            /**
             * 状态未确定的回调放到数组中去
             */
            if (this.status === PROMICE_STATUS_PENDING) {
                this.onFulfilledFns.push(() => {
                    // try {
                    //     const value = onFulfilled(this.value)
                    //     resolve(value)
                    // } catch (err) {
                    //     reject(err)
                    // }
                    execFunctionWithCatchError(onFulfilled, this.value, resolve, reject)
                })
                this.onRejectedFns.push(() => {
                    // try {
                    //     const reason = onRejected(this.reason)
                    //     resolve(reason)
                    // } catch (err) {
                    //     reject(err)
                    // }
                    execFunctionWithCatchError(onRejected, this.reason, resolve, reject)
                })
            }
        })


    }
}

const p = new Promice((resolve, reject) => {
    resolve(111)
    // reject(222)
})

p.then(res => {
    console.log("res1:", res)
    return "aaaa"
    // throw new Error("err message")
}, err => {
    console.log("err1:", err)
    return "bbbbb"
    // throw new Error("err message")
}).then(res => {
    console.log("res2:", res)
}, err => {
    console.log("err2:", err)
})

/**
 * 
 */
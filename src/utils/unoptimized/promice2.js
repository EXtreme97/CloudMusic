/**
 *手写promise
 *规范：promise/A+、ECMAscript6
 */

//  定义三个状态常量
const PROMICE_STATUS_PENDING = 'pending'
const PROMICE_STATUS_FULFILLED = 'fulfilled'
const PROMICE_STATUS_REJECTED = 'rejected'

class Promice {
    // 规划构造函数
    constructor(executor) {
        //定义初始状态
        this.status = PROMICE_STATUS_PENDING
        this.value = undefined
        this.reason = undefined

        // 用于对then优化，能多次调用then
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
        executor(resolve, reject)
    }
    // 实现then方法
    then(onFulfilled, onRejected) {
        // this.onFulfilled = onFulfilled
        // this.onRejected = onRejected
        /**
         * 状态已确定
         */
        if (this.status === PROMICE_STATUS_FULFILLED && onFulfilled) {
            onFulfilled(this.value)
        }
        if (this.status === PROMICE_STATUS_REJECTED && onRejected) {
            onRejected(this.reason)
        }
        /**
         * 状态未确定的回调放到数组中去
         */
        if (this.status === PROMICE_STATUS_PENDING) {
            this.onFulfilledFns.push(onFulfilled)
            this.onRejectedFns.push(onRejected)
        }

    }
}

const p = new Promice((resolve, reject) => {
    resolve(111)
    // reject(222)
})
p.then(res => {
    console.log("res:", res);
}, err => {
    console.log("err:", err)
})

p.then(res => {
    console.log("res2:", res);
}, err => {
    console.log("err2:", err)
}).then(res => {
    console.log("res2:", res);
}, err => {
    console.log("err2:", err)
})

/**
 * 本能链式调用
 */
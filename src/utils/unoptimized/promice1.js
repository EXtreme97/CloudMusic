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

        // 2.定义resolve、reject回调
        const resolve = (value) => {
            if (this.status === PROMICE_STATUS_PENDING) {
                this.status = PROMICE_STATUS_FULFILLED
                queueMicrotask(() => {
                    this.value = value
                    this.onFulfilled(this.value)
                    console.log("resolve被调用");
                })
            }
        }

        const reject = reason => {
            if (this.status === PROMICE_STATUS_PENDING) {
                this.status = PROMICE_STATUS_REJECTED
                queueMicrotask(() => {
                    this.reason = reason
                    this.onRejected(this.reason)
                    console.log("rejected被调用");
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
        this.onFulfilled = onFulfilled
        this.onRejected = onRejected
    }
}

const p = new Promice((resolve, reject) => {
    // resolve(111)
    reject(222)
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
})

/**
 * 不能多次调用
 * err2: 222
 * rejected被调用
 */
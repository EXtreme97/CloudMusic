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
        this.onFulfilledFns = []
        this.onRejectedFns = []

        // 2.定义resolve、reject回调
        const resolve = (value) => {
            if (this.status === PROMICE_STATUS_PENDING) {
                queueMicrotask(() => {
                    if (this.status !== PROMICE_STATUS_PENDING) return
                    this.status = PROMICE_STATUS_FULFILLED
                    this.value = value
                    this.onFulfilledFns.forEach(fn => {
                        fn(this.value)
                    })
                })
            }
        }

        const reject = (reason) => {
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

        try {
            executor(resolve, reject)
        } catch (err) {
            reject(err)
        }
    }
    // 实现then方法
    then(onFulfilled, onRejected) {
        const defaultOnFulfilled = value => { return value }
        onFulfilled = onFulfilled || defaultOnFulfilled

        const defaultOnRejected = err => { throw err }
        onRejected = onRejected || defaultOnRejected

        return new Promice((resolve, reject) => {
            /**
             * 状态已确定
             */
            if (this.status === PROMICE_STATUS_FULFILLED && onFulfilled) {
                execFunctionWithCatchError(onFulfilled, this.value, resolve, reject)
            }
            if (this.status === PROMICE_STATUS_REJECTED && onRejected) {
                execFunctionWithCatchError(onRejected, this.reason, resolve, reject)
            }
            /**
             * 状态未确定的回调放到数组中去
             */
            if (this.status === PROMICE_STATUS_PENDING) {
                if (onFulfilled) this.onFulfilledFns.push(() => {
                    execFunctionWithCatchError(onFulfilled, this.value, resolve, reject)
                })
                if (onRejected) this.onRejectedFns.push(() => {
                    execFunctionWithCatchError(onRejected, this.reason, resolve, reject)
                })
            }
        })


    }

    // 实现catch方法
    catch(onRejected) {
        return this.then(undefined, onRejected)
    }

    //实现finally
    finally(onFinally) {
        this.then(() => {
            onFinally()
        }, () => {
            onFinally()
        })
    }

    static resolve(value) {
        return new Promice(resolve => resolve(value))
    }

    static reject(reason) {
        return new Promice((resolve, reject) => reject(reason))
    }

    static all(promices) {
        return new Promice((resolve, reject) => {
            const values = []
            promices.forEach(promice => {
                promice.then(res => {
                    values.push(res)
                    if (values.length === promices.length) {
                        resolve(values)
                    }
                }, err => {
                    reject(err)
                })
            })
        })
    }

    static allSettled(promices) {
        return new Promice((resolve) => {
            const results = []
            promices.forEach(promice => {
                promice.then(res => {
                    results.push({ status: PROMICE_STATUS_FULFILLED, value: res })
                    if (results.length === promices.length) {
                        resolve(results)
                    }
                }, err => {
                    results.push({ status: PROMICE_STATUS_REJECTED, value: err })
                    if (results.length === promices.length) {
                        resolve(results)
                    }
                })
            })
        })
    }

    static rece(promices) {
        return new Promice((resolve, reject) => {
            promices.forEach(promice => {
                promice.then(resolve, reject)
            })
        })
    }

    static any(promices) {
        const reasons = []
        return new Promice((resolve, reject) => {
            promices.forEach(promice => {
                promice.then(resolve, err => {
                    reasons.push(err)
                    if (reasons.length === promices.length) {
                        reject(new AggregateError(reasons))
                    }
                })
            })
        })
    }
}

const p = new Promice((resolve, reject) => {
    // resolve(111)
    reject(222)
})

// p.then(res => {
//     console.log("res1:", res)
//     return "aaaaa"
// }).then(res => {
//     console.log("res2:", res)
// }).catch(err => {
//     console.log("err:", err)
// }).finally(() => {
//     console.log("finally")
// })

// Promice.resolve("hello").then(res => { console.log("res:", res); })
// Promice.reject("error~").catch(err => { console.log("err:", err); })

const p1 = new Promise((resolve) => {
    setTimeout(() => { resolve(1111) }, 2000)
})
const p2 = new Promise((resolve, reject) => {
    setTimeout(() => { reject(2222) }, 1000)
})
const p3 = new Promise((resolve) => {
    setTimeout(() => { resolve(3333) }, 3000)
})

// Promice.all([p1, p2, p3]).then(res => {
//     console.log(res)
// }).catch(err => {
//     console.log(err)
// })

// Promice.allSettled([p1, p2, p3]).then(res => {
//     console.log(res)
// }).catch(err => {
//     console.log(err)
// })


// Promice.rece([p1, p2, p3]).then(res => {
//     console.log("res:", res)
// }).catch(err => {
//     console.log("err:", err)
// })

// Promice.any([p1, p2, p3]).then(res => {
//     console.log("res:", res)
// }).catch(err => {
//     console.log("err:", err)
// })

/**
 * 
 */
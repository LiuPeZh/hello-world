/**
 * Promise 的实现
 */

const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

class MyPromise {
  constructor(executor) {
    this.status = PENDING
    this.value = null
    this.reason = null
    this.onFulfilledCbs = []
    this.onRejectedCbs = []
    const resolve = (value) => {
      this.status = FULFILLED
      this.value = value
      for (const cb of this.onFulfilledCbs) {
        cb()
      }
    }
    const reject = (reason) => {
      this.status = REJECTED
      this.reason = reason
      for (const cb of this.onRejectedCbs) {
        cb()
      }
    }
    executor(resolve, reject)
  }
  then(onFulfilled, onRejected) {
    // if (this.status === PENDING) {
    //   this.onFulfilledCbs.push(onFulfilled)
    //   this.onRejectedCbs.push(onRejected)
    // } else if (this.status === FULFILLED) {
    //   onFulfilled(this.value)
    // } else if (this.status === REJECTED) {
    //   onRejected(this.reason)
    // }
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : reason => reason
    return new MyPromise((resolve, reject) => {
      if (this.status === PENDING) {
        this.onFulfilledCbs.push(() => {
          let x = onFulfilled(this.value)
          resolvePromise(x, resolve, reject)
        })
        this.onFulfilledCbs.push(() => {
          let x = onRejected(this.reason)
          resolvePromise(x, resolve, reject)
        })
      } else if (this.status === FULFILLED) {
        let x = onFulfilled(this.value)
        resolvePromise(x, resolve, reject)
      } else if (this.status === REJECTED) {
        let x = onRejected(this.reason)
        resolvePromise(x, resolve, reject)
      }
    })
  }
  static all(promises) {
    return new Promise((resolve, reject) => {
      const result = []
      let count = 0
      promises.forEach((promise, index) => {
        promise = promise.then && typeof promise.then === 'function' ? promise : Promise.resolve(promise)
        promise.then((val) => {
          result[index] = val
          count++
          count === promises.length && resolve(result)
        }, (err) => {
          reject(err)
        })
      })
    })
  }
  static allSettled(promises) {
    return new Promise((resolve, reject) => {
      const result = []
      let count = 0
      try {
        promises.forEach((promise, index) => {
          promise = promise.then && typeof promise.then === 'function' ? promise : Promise.resolve(promise)
          promise.then((val) => {
            result[index] = {
              status: 'fulfilled',
              value: val
            }
            count++
            count === promises.length && resolve(result)
          }, (err) => {
            result[index] = {
              status: 'rejected',
              reason: err
            }
            count++
            count === promises.length && resolve(result)
          })
        })
      } catch (e) {
        reject(e)
      }
    })
  }
}

function resolvePromise(x, resolve, reject) {
  if (x && typeof x === 'object' || typeof x === 'function') {
    const then = x.then
    if (typeof then === 'function') {
      then.call(
        x,
        (y) => {
          resolvePromise(y, resolve, reject)
        },
        (r) => {
          reject(r)
        }
      )
    } else {
      resolve(x)
    }
  } else {
    resolve(x)
  }

}

new MyPromise((resolve) => {
  console.log(1)
  setTimeout(() => {
    resolve(2)
  }, 1000)
  console.log(3)
}).then((val) => {
  console.log(val)
  return val
}).then((val) => {
  console.log(val)
})

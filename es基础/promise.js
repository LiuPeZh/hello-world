
class MyPromise {
  constructor(excutor) {
    
    this.status = 'PENDING'
    this.value = null
    this.err = null
    const resolve = (val) => {
      this.value = val
    }
    const reject = (err) => {
      this.err = err
    }
    excutor(resolve, reject)
  }
  then(resolve, reject) {
    resolve(this.value)
  }
}
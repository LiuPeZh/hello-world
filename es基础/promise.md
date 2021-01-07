## Promise简介
广义上来说 Promise 是一种异步编程模式，在 JS 中具体是一个原生构造函数，它表示了一个在未来会返回的一个结果。它通过链式的方式，把 promise 的结果与相应的处理程序绑定了起来，在 Promise 完成的后就会去执行相应的处理程序。主要用于改进 回调函数式 异步编程 的 回调地狱问题 。
它有这两个关键要素：状态和链式调用
### 状态
Promise有三种状态：pending (待定)、fulfilled (已兑现)、rejected (已拒绝)。
状态的变化只能从 pending 到 fulfilled 或者从 pending 到 rejected，且当状态发生变化后就不会再有改变。
### 链式调用

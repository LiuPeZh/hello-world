## this
简单来说除去apply、bind、call和new下，是谁调用的this就指向谁。

## 能改变this指向的方法
1. new 
    用构造函数创建对象时，构造函数内部的this会指向该对象。
2. apply、bind和call
    这三个方法用于改变函数内的this。其中bind是返回一个新函数并不执行，而其余两个则是会执行的。
    bind传参 function.bind(thisArg[, arg1[, arg2[, ...]]]) ， 除了第一个要求this对象外，从第二个参数开始都会预置到新返回的函数的参数中。
    call的传参和bind一致，但它是直接被调用的。第二个参数开始，相当于给给函数传参。
    apply的传参则是 func.apply(thisArg, [argsArray])， 其中第二个参数是一个数组或类数组，数组元素会传给func函数。


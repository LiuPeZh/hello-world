## typescript 基础
typescript 是 javascript 的超集。
### 类型
本质上来讲，typescript 的类型系统采用的是结构类型，即只要两个变量类型的结构（shape）相同，那这两个类型就是相等的（两个类型的变量可以相互赋值）。
通常类型在编译为 js 代码后会被直接去掉。
  - 1. 基础类型、interface与type
    基础类型分别为
    Boolean Number String Symbol Bigint
    Object
    Array Tuple
    Enum 
    Enum 和 class 类型 既可以作为类型 也可以作为变量进行操作。编译后会转为相应的js代码。
    ```typescript
    enum Book {
      JS = 'a',
      TS = 'b'
    }

    var Book;
    (function (Book) {
        Book["JS"] = "a";
        Book["TS"] = "b";
    })(Book || (Book = {}));
    ```

    Unknown Any Void Null Undefined
    Never
    class
    类型断言 as语法 和 尖括号语法 
  - 2. interface
  声明对象 声明class 声明函数 继承 实现 声明合并
  - 3. 函数
      函数的类型通常在定义函数的时候只需要对参数进行类型声明，就能完成函数类型。当然也可以通过 interface 和 type 去进行函数类型声明。
      this
      在 ts 的普通函数中使用 this 会有一个报错。解决方法为 使用 箭头函数代替，使用 this 参数
      this 参数 是一个特殊的参数，它必须放在函数的第一个参数位置上，在编译成 js 后 this 参数会被去掉，使用时一定要注意 this 的类型声明要符合正确的this类型。
  - 4. 字面量类型
  - 5. 联合类型、交叉类型
  联合类型 union type 表示 一个集合中的某个。 交叉类型 相当于类型的并集， 
  - 6. 类型收缩与类型守卫
  ! ? 符号
## typescript 进阶
  - type 
  泛型 泛型约束

  - 1. 工具类型
## typescript 探讨
  - 1. 为什么要使用
  规避常见类型错误、更好的 IDE 提示、更易于重构等。
  - 2. 如何正确使用


## 参考资源
  https://www.typescriptlang.org/docs/handbook/ TypeScript Documentation
  http://www.semlinker.com/ts-object-type/ 一文读懂 TS 中 Object, object, {} 类型之间的区别
  https://www.zhihu.com/question/354601204/answer/888551021 TypeScript中的never类型具体有什么用？
  
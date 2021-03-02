## typescript 基础
typescript 是 javascript 的超集。
本文将围绕 ts 中类型与新增的关键字来展开进行 ts 的讲解。

### 基础类型
  基础类型可分为以下几种：普通类型，数组与元组，枚举类型，字面量类型

1. 普通类型
  普通类型关键字: boolean number string symbol bigint unknown any void null undefined object
  这些关键字可以直接作为类型使用，也可以通过组合形成更高级的类型。
  boolean 、number 、string 、symbol 、bigint 、null 和 undefined 基本和 js 中的普通类型一一对应。可以发现除了 null 和 undefined 其他类型都是原生构造函数的首字母小写形式，当然这些原生构造函数也可以被用作类型，但在 ts 很少去这样使用。

2. unknown 和 any 
  unknow 
  表示未知的类型，用于不确定的变量类型。任何类型都是它的 subtype ， 也就是说任何类型变量都可以分配给它，但它只能分配给自身或 any 类型的变量。
  实际使用中通常会先对 unknow 类型变量进行 类型收缩，然后再进行具体的操作。如下代码：
  ```typescript
  ```
  any 表示任何类型，它可以赋给任何类型变量，也可以接受任何类型变量。
  如果一个变量设置为 any 类型， 那么就可以进行任何操作，就像是在写 js 一样，但这样就会丢失类型检查，而且更不好确保程序运行不出错。就比如常见的 Cannot read property 'a' of null/undefined 错误。

  unknown 和 any 的区别
  unknown 和 any 的最大的区别就是 unknown 可以确保类型检查，而 any 则相当于完全放弃了类型检查。
  所以通常情况下应该使用 unknown 而不是 any。当然个人感觉在通常业务开发中也没有必要去禁用 any，一方面，使用 any 可以作为 ts 初学者过渡的阶段，另一方面有时候可能会花费更多的时间在 类型 定义上，而需求变动时，有得重写，这时候 any 就很具有作用。
  我在使用在通常是在接口返回值上去使用 any 。

3. Enum 枚举类型
  enum 类型 可以说是对 js 类型的一个补充。表示一系列的集合。
  
  Enum 既可以作为类型也可以作为变量进行使用。编译后会转为相应的js代码。
  ```typescript
  enum Book {
    JS = 'a',
    TS = 'b'
  }
  // 编译后的 js 代码
  var Book;
  (function (Book) {
      Book["JS"] = "a";
      Book["TS"] = "b";
  })(Book || (Book = {}));
  ```
  定义 enum 类型 需注意这几点：1. 默认情况下， enum 类型中的成员是从 0 开始的。2. 给某个成员赋值一个数字时，这个成员下面的成员就会接着这个数。3. 使用字符串做值的时候，所有成员就都要进行赋值操作。或者最下面有赋值的为数字。

  我在实际使用中是作为 状态 去使用。

4. never
  never 类型 表示不存在的类型。
  通常是一个从来不会有返回值的函数（如：如果函数内含有 while(true) {}）
  或者一个总是会抛出错误的函数（如：function foo() { throw new Error('Not Implemented') }）
  在工具类型中很常见。


5. object
  object 表示引用类型，它是所以引用类型的基类，也就是说其他的引用类型变量可以赋值给 object 类型变量，比如 数组类型 函数类型 等都可以进行赋值。
  通常，在没有属性或方法的操作情况下，可以使用 object 作为类型。而当有属性访问，或者方法调用，那么在类型不收缩的情况下，ts 会报错。

6. 数组与元组关键字: Array<T> T[] [T,D]
  数组 与 js 中的数组基本一致。
  而元组可以看作是特殊的数组，它的元素是确定的。


7. 字面量类型

### 高级类型
1. 联合类型 和 交叉类型
  联合类型 union type 表示 一个集合中的某个。 交叉类型 相当于类型的并集， 
2. interface 和 type
  - 1. 定义及使用
    interface 声明对象 声明class 声明函数 继承 实现 声明合并
  - 2. 字符串签名 和 索引签名
  - 3. 区别

3. 函数类型
  - 1. 函数类型定义
  - 2. 参数类型
  - 3. this 类型
    在 ts 的普通函数中使用 this 会有一个报错。解决方法为 使用 箭头函数代替，使用 this 参数
    this 参数 是一个特殊的参数，它必须放在函数的第一个参数位置上，在编译成 js 后 this 参数会被去掉，使用时一定要注意 this 的类型声明要符合正确的this类型。
  - 4. 函数重载
  - 5. 实际使用
    函数的类型通常在定义函数的时候只需要对参数进行类型声明，就能完成函数类型。当然也可以通过 interface 和 type 去进行函数类型声明。
  this

4. class
  - 1. 定义 字段 等
  - 2. 继承 及 实现
  - 3. 抽象类

5. 泛型
  - 1. 定义 使用
  - 2. 泛型约束

### 其他

1. 类型断言
  ! 表示非空断言，用于标识变量不可能为 null 或 undefined
  在 vue2 开发中 可以用于声明 props 中。
  ```typescript
  @Prop()
  public data!: string
  ```
  也可以用于获取dom 等确定值不为 null 或 undefined 的情况。
    class
    类型断言 as语法 和 尖括号语法 

2. 类型收缩

## typescript 进阶

### 类型编程
1. 类型守卫

2. 类型映射

3. 条件类型
  T extends U ? X : Y

4. 常用工具类型

### 其他
1. 装饰器

2. declare

3. 三重斜线指令

4. tsconfig.json 配置

## typescript 探讨
  - 1. ts 本质
    本质上来讲，typescript 的类型系统采用的是结构类型，即只要两个变量类型的结构（shape）相同，那这两个类型就是相等的（两个类型的变量可以相互赋值）。但上述情况只在变量赋值的时候存在，如果使用了对象字面量，那就会报错，因为 ts 会对对象字面量进行特殊的处理 进行额外属性检测。
    通常类型在编译为 js 代码后会被直接去掉。
  - 2. 为什么要使用
    规避常见类型错误、更好的 IDE 提示、更易于重构等。
  - 2. 如何正确使用


## 参考资源
  https://www.typescriptlang.org/docs/handbook/ TypeScript 官方文档
  http://www.semlinker.com/ts-object-type/ 一文读懂 TS 中 Object, object, {} 类型之间的区别
  https://www.zhihu.com/question/354601204/answer/888551021 TypeScript中的never类型具体有什么用？
  
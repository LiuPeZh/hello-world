## typescript 基础

typescript 是 javascript 的超集。
本文将从最基础的类型开始，逐步深入的去讲解 ts 。

### 基础类型
  基础类型可分为以下几种：普通基础类型，数组与元组，枚举类型，字面量类型

#### 1. 普通基础类型
  普通基础类型关键字: boolean number string symbol bigint unknown any void null undefined object。
  这些关键字可以直接作为类型使用，也可以通过组合形成更高级的类型。
  ```typescript
  ```
  boolean 、number 、string 、symbol 、bigint 、null 和 undefined 基本和 js 中的普通类型一一对应。除了 null 以外，其他类型就相当于 js 中使用 typeof 运算符的操作结果。
  可以发现除了 null 和 undefined 其他类型都是原生构造函数的首字母小写形式，当然这些原生构造函数也可以被用作类型，但在 ts 很少去这样使用。

#### 2. unknown 和 any 
  - 1. unknow 
  表示未知的类型，用于不确定的变量类型。任何类型都是它的 `subtype`， 也就是说任何类型变量都可以分配给它，但它只能分配给自身或 any 类型的变量。
  实际使用中通常会先对`unknow`类型变量进行`类型收缩`，然后再进行具体的操作。如下代码：
  ```typescript
  ```
  
  - 2. any 
  表示任何类型，它可以赋给任何类型变量，也可以接受任何类型变量。
  如果一个变量设置为 any 类型， 那么就可以进行任何操作，就像是在写 js 一样，但这样就会丢失类型检查，而且更不好确保程序运行不出错。就比如常见的 Cannot read property 'a' of null/undefined 错误。

  - 3. unknown 和 any 的区别
  unknown 和 any 的最大的区别就是 unknown 可以确保类型检查，而 any 则相当于完全放弃了类型检查。
  所以通常情况下应该使用 unknown 而不是 any。当然个人感觉在通常业务开发中也没有必要去禁用 any，一方面，使用 any 可以作为 ts 初学者过渡的阶段，另一方面有时候可能会花费更多的时间在 类型 定义上，而需求变动时，有得重写，这时候 any 就很具有作用。
  我在使用在通常是在接口返回值上去使用 any 。

#### 3. Enum 枚举类型
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

#### 4. never
  never 类型 表示不存在的类型。
  通常是一个从来不会有返回值的函数（如：如果函数内含有 while(true) {}）
  或者一个总是会抛出错误的函数（如：function foo() { throw new Error('Not Implemented') }）
  在工具类型中很常见。


#### 5. object
  object 表示引用类型，它是所以引用类型的基类，也就是说其他的引用类型变量可以赋值给 object 类型变量，比如 数组类型 函数类型 等都可以进行赋值。
  通常，在没有属性或方法的操作情况下，可以使用 object 作为类型。而当有属性访问，或者方法调用，那么在类型不收缩的情况下，ts 会报错。

#### 6. 数组与元组关键字: Array<T> T[] [T,D]
  数组 与 js 中的数组基本一致。
  而元组可以看作是特殊的数组，它的元素是确定的。


#### 7. 字面量类型
  字面量类型 就是 string、number 和 boolean 类型的实际类型，形式如下：
  ```typescript
  type Str = 'hello'
  ```

  通常 使用字面量联合类型可以替代 enum 使用。

### 高级类型

#### 1 接口( interface )
  - 1. 定义及使用
    interface 声明对象 声明class 声明函数 继承 实现 声明合并
  - 2. 字符串签名 和 索引签名
    对象的键可以是字符串也可以是数字，或 symbol 类型。

#### 2. 类型别名( type alias )
  - 1. 使用
    类型别名 通过`type`关键字进行声明。顾名思义，它可以作为另一个类型的别名，也就是说，基础类型可以被重新命名。当然这样做没有什么实际意义，它主要是用来声明 元组、联合类型 和 交叉类型的。

#### 3. interface 与 type alias 的区别
  通常情况下，interface 和 type alias 是可以相互替换的，但有这些细微差别：
  - 1. type alias 的相关错误信息，是会被其内部各个属性名所取代，而 interface 的错误信息则是 interface 命名的类型。
  - 2. interface 存在声明合并，而 type alias 不能。
  - 3. interface 只能用于声明对象（包含函数和类）的结构，而不能重新命名基础类型。type alias 两个都可以做到。

#### 3. 联合类型( union type )
  - 1. 定义 
    一个联合类型是由两个或以上的类型组合而成的，它的值只能是这些组合类型中的某一个。
    定义方式为：type A = typeA | typeB

    特殊：与 never 进行联合的类型是该类型本身，与 never 交叉的类型，其结果是 never。 

  - 2. 可辨识联合类型。

#### 4. 交叉类型( interestion type )
  - 1. 定义
    交叉类型也是有两个或以上的类型组合而成，与联合类型不同的是，它的值必须是有这些组合类型的所有属性。
    定义方式为：type B = typeA & typeB

#### 5. 函数类型
  - 1. 函数类型定义
  - 2. 参数类型
  - 3. this 类型
    在 ts 的普通函数中使用 this 会有一个报错。解决方法为 使用 箭头函数代替，使用 this 参数
    this 参数 是一个特殊的参数，它必须放在函数的第一个参数位置上，在编译成 js 后 this 参数会被去掉，使用时一定要注意 this 的类型声明要符合正确的this类型。

  - 4. 函数重载
    函数重载是指函数的多态性: 函数的 参数数量、参数类型 和 返回值 不同，但函数名相同。
    不管是 js 还是 ts 都没有真正的函数重载。因为 js 作为动态语言，天生不支持函数重载。
    在 ts 中函数重载需要声明多个函数，但 函数的实现只有一种，且其内部会对不同的参数 进行不同的处理，从而实现函数重载。

  - 5. 实际使用
    函数的类型通常在定义函数的时候只需要对参数进行类型声明，就能完成函数类型。当然也可以通过 interface 和 type 去进行函数类型声明。
  this

#### 6. class
  - 1. class 是 ES6 中新增的一种语法，用于声明 类，其本质是一个特殊的函数，在 ts 中，则新增了更符合类的 字段声明
    分为 私有 共有 和 保护。同时也加入了 implements 用于实现接口，
  - 2. 继承 及 实现
  - 3. 抽象类

#### 7. 泛型
  - 1. 泛型是指在定义函数、接口或类的时候，不预先指定具体的类型，使用时再去指定类型的一种特性。
  - 2. 泛型约束
    通过 extend 关键字可以对泛型进行约束，如下例子
    ```typescript
    ```

#### 8. 模板字符串类型
  1. 基础语法
  它的语法和 es 里的字符串模板很相似。
  目前存在 bug。 如果模板字符串类型中存在 number 或 string 类型，那么就无法正确的检测类型。

### 其他

#### 1. 类型推断
  通常我们可以不必去写类型注解，因为 ts 可以自动推断出变量的类型。
  const 声明的 非引用类型 变量。
  使用 as const 断言的类型。
  as const 和 用于声明常量的 const 有所不同，const 声明的常量本身不能修改，但它的属性可以被修改，而 as const 断言的变量属性也不能被修改。

#### 2. 类型断言
  ! 表示非空断言，用于标识变量不可能为 null 或 undefined
  在 vue2 开发中 可以用于声明 props 中。
  ```typescript
  @Prop()
  public data!: string
  ```
  也可以用于获取dom 等确定值不为 null 或 undefined 的情况。
    class
    类型断言 as语法 和 尖括号语法 

#### 3. 类型收缩
  类型收缩通常用于对联合类型的收缩。

## typescript 进阶

### 类型编程
#### 1. 类型守卫
  - 1. 定义作用
  - 2. in 
  - 3. typeof 
  - 4. instanceof

#### 2. 类型映射
  通过一个类型创建另一个类型。ts 中提供了这些操作符用于创建新类型: `keyof type`、`typeof type` 以及 `索引访问类型( Indexed Access Types )`
  - 1. Keyof 操作符
  - 2. typeof 操作符
    typeof 在 js 中适用于判断类型的，而在 ts 中也是用来推断类型的，只不过，当被用于类型声明。

#### 3. 条件类型
  - 1. 
  类似于 js 中的 三元表达式， ts 中的类型也能够根据条件返回不同的类型。其结构如下:
  `T extends U ? X : Y`
  和 泛型约束 所用到的关键字 extends 一样， 两者表述的意思也基本相同：T 符合 U。 这个条件类型表示 T 符合 U 那么就得到 X 类型，负责得到 Y 类型。

  - 2. infer T
    infer 是与条件类型绑定出现的关键词， 用于 extends 的右边，替代 要符合的类型，从而方便条件分支的使用。

#### 4. 常用工具类型
  - 1. Partial<Type> 
    用于将对象的各个属性转化成可选属性。
  - 2. Required<Type> 
    用于将对象的各个属性转化成必填属性。
  - 3. Readonly<Type> 
  - 4. Record<Type> 
  - 5. Pick<Type> 
  - 6. Omit<Type> 
  - 7. Exclude<Type> 
  - 8. Extract<Type> 
  - 9. ReturnType<Type> 


### 其他
#### 1. 装饰器
  - 1. 装饰器 是一种设计模式，它在 es / ts 中的实现是 使用 @XX 的语法对 class 及 class 中的 属性 和 方法 进行一种装饰。

  我们开发中，目前使用的 vue2.x 中 ts 的使用就是基于 class 语法和 相关装饰器实现的。如下 vue 代码：
  ```typescript
  <template>
  </template>

  <script>

  @Component
  export defalut class HelloWorld extends Vue {
    @Prop()
    public msg!: string

    @Emit()
    public onClick() {
      return this.msg + 'asd'
    }
  }
  </script>
  ```

  也可以通过自定义装饰器，创建自己的装饰器。如下的 loading 装饰器 和 log 装饰器。

  - 2. 为什么不能在函数上使用装饰器： 因为存在函数提升。

#### 2. 声明文件
  - 1. declare 是 ts 中的关键字，用于声明变量、方法等，主要是为了用于提供 js 文件或三方库 的类型声明。
  在 package.json 中会使用 type 字段去标识当前包的 类型声明文件，从而向使用者提供相应的代码补全、提示等功能。
  在编译 ts 文件的过程中，也可以通过配置 tsconfig.json 文件 生成相应的 声明文件。
  通常会在 xxx.d.ts 文件中使用，因为该文件不会被编译器编译成 js 代码。
  
  - 2. 三重斜线指令
  使用三重斜线指令可以将声明文件引进 ts 文件中。
  ```typescript
  /// <reference path="./jquery.d.ts" />
  ```
#### 3. tsconfig.json 配置

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
  
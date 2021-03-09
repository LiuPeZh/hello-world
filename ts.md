## typescript 基础

typescript 是 javascript 的超集。
本文将从最基础的类型开始，逐步深入的去讲解 ts 。

### 基础类型
  基础类型可分为以下几种：普通基础类型，数组与元组，枚举类型，字面量类型

#### 1. 普通基础类型
  普通基础类型关键字: boolean number string symbol bigint unknown any void null undefined object。
  这些关键字可以直接作为类型使用，也可以通过组合形成更高级的类型。
  ```typescript
  let num: number = 10
  let str: string = 'hello'
  let flag: boolean = false
  let uniqueVal: symbol = Symbol('uniqueVal')
  let bigNum: bigint = 9007199254740991n

  let nullVar: null = null
  let undefinedVar: undefined = undefined 
  // null 和 undefined 类型的值就是自身，通常不会像上述代码一样直接进行赋值， 而是通过复合成高级类型，再进行使用。

  ```

  boolean 、number 、string 、symbol 、bigint 、null 和 undefined 基本和 js 中的普通类型一一对应。 其中除了 null 以外，其他类型就相当于 js 中使用 typeof 运算符的操作结果。
  可以发现除了 null 和 undefined 其他类型都是原生构造函数的首字母小写形式，当然这些原生构造函数也可以被用作类型，但在 ts 很少去这样使用。

  void 表示空类型，一般用于函数没有返回值的时候。它可以被 any、undefined、null 和 never 类型的值，进行赋值。

#### 2. unknown 和 any 
  - 1. unknow 
    表示未知的类型，用于不确定的变量类型。任何类型都是它的 `subtype`， 也就是说任何类型变量都可以分配给它，但它只能分配给自身或 any 类型的变量。
    ```typescript
    let unkonwnVal: unknown
    unkonwnVal = 1
    unkonwnVal = 'a'
    unkonwnVal = false
    unkonwnVal = null
    unkonwnVal = false
    unkonwnVal = {
        name: 'unknown value'
    }
    // ...
    ```

    实际使用中通常会先对`unknow`类型变量进行`类型收缩`，然后再进行具体的操作。如下代码：
    ```typescript
    // function foo(val: unknown): string | number
    function foo(val: unknown) {
      if (typeof val === 'function') {
        val() // 这块 val 变量将会被推断为 函数类型 (parameter) val: Function
      } else if (typeof val === 'number' || typeof val === 'string') {
        return val // 而在这块， val 将会被推断成联合类型 string | number， (parameter) val: string | number
      }
      throw Error('参数类型应该为：number、string和function')
    }
    ```
  
  - 2. any 
  表示任何类型，它可以赋给任何类型变量，也可以接受任何类型变量。
  如果一个变量设置为 any 类型， 那么就可以进行任何操作，就像是在写 js 一样，但这样就会丢失类型检查，而且更不好确保程序运行不出错。就比如常见的 Cannot read property 'a' of null/undefined 错误。
  ```typescript
  // 函数内对参数 val 的任何操作，都不会引发 ts 报错。
  function foo(val: any) {
    val() // 可以直接当函数调用，但不保证运行时不出错
    val = 1
    if (typeof val === 'function') {
      val() // 这里还是会被推断为 any 类型， 类型收缩失效。
    }
    throw Error('参数类型应该为：number、string和function')
  }
  ```

  - 3. unknown 和 any 的区别
  unknown 和 any 的最大的区别就是 unknown 可以确保类型检查，而 any 则相当于完全放弃了类型检查。
  所以通常情况下应该使用 unknown 而不是 any。当然个人感觉在通常业务开发中也没有必要去禁用 any，一方面，使用 any 可以作为 ts 初学者过渡的阶段，另一方面有时候可能会花费更多的时间在 类型 定义上，而需求变动时，又得重写，这时候 any 就很具有作用。

#### 3. Enum 枚举类型
  enum 类型 表示一系列数据的集合, 是对 js 类型的一个补充, 因此它既可以作为类型也可以作为变量进行使用。
  基本语法如下: 
  ```typescript
  enum Book {
    Maths,
    Chinese,
    English
  }
  let Maths = Book.Maths // Maths -> 0 
  let Chinese = Book.Chinese // Chinese -> 1
  ```
  使用 enum 类型 需注意这几点:
  - 1. 默认情况下， enum 类型中的成员是从 0 开始的。
  - 2. 给某个成员赋值一个数字时，这个成员下面的成员就会接着这个数，而上面则和默认情况一致。注意如果这个成员的值被设置为已有的值，那么就会有重复的， 这在 ts 中不会报错。
    ```typescript
    enum Book {
      Maths,
      Chinese = 3,
      English
    }
    let Maths = Book.Maths // Maths -> 0 
    let Chinese = Book.Chinese // Chinese -> 3
    let Chinese = Book.English // Chinese -> 4
    ```
  - 3. 使用字符串做值的时候，所有成员就都要进行赋值操作。或者最下面有赋值的为数字。
    ```typescript
    enum Book {
      Maths = 'Maths',
      Chinese = 'Chinese',
      English = 3,
      History
    }
    let Maths = Book.Maths // Maths -> 'Maths'
    let Chinese = Book.Chinese // Chinese -> 'Chinese'
    let English = Book.English // English -> 3
    let History = Book.History // History -> 4
    ```
  - 4. 枚举类型的枚举项是只读属性，因此不能被修改。
  
  - 5. enum 类型能作为变量使用，因此编译后不会像其他类型那样被去掉，而是会转为相应的js代码，因为涉及到了运行时。
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
  - 6. 通常大型系统中，会使用二进制数字做标志，如vue源码
    ```typescript
    // vue-next/packages/shared/src/patchFlag.ts
    export const enum PatchFlags {
      TEXT = 1,
      CLASS = 1 << 1,
      STYLE = 1 << 2,
      PROPS = 1 << 3,
      FULL_PROPS = 1 << 4,
      HYDRATE_EVENTS = 1 << 5,
      STABLE_FRAGMENT = 1 << 6,
      KEYED_FRAGMENT = 1 << 7,
      UNKEYED_FRAGMENT = 1 << 8,
      NEED_PATCH = 1 << 9,
      DYNAMIC_SLOTS = 1 << 10,
      HOISTED = -1,
      BAIL = -2
    }
    ```

    这样做的一个好处是，可以通过位运算符去进行相关判断或操作。
    ```typescript
    // vue-next/packages/runtime-core/src/renderer.ts 904 line
    if (patchFlag & PatchFlags.FULL_PROPS) {
        // ...
      } else {
        if (patchFlag & PatchFlags.CLASS) {
          // ...
        }
        if (patchFlag & PatchFlags.STYLE) {
          // ...
        }
        if (patchFlag & PatchFlags.PROPS) {
          // ...
        }
      }
    ```
  我是这样去使用的：
  ```typescript
  export enum TableState {
    Init = -1,     // 初始
    Saved = 0,     // 保存后 （待提交状态）
    Committed = 1, // 提交后 （待审核状态）
    Verified = 2   // 审核后 （审核通过后）
  }

  class BtnComp exnteds Vue {
    public tableState: TableState = TableState.Saved
    public originBtnList = [
      {
        label: '保存',
        hasStatus: [TableState.Init, TableState.Saved],
        event: () => {}
      },
      {
        label: '提交',
        hasStatus: [TableState.Saved],
        event: () => {}
      },
      {
        label: '回退',
        hasStatus: [TableState.Committed],
        event: () => {}
      },
      {
        label: '审核',
        hasStatus: [TableState.Committed],
        event: () => {}
      },
    ]
    public get btnList() {
      return this.originBtnList.filter((btn) => btn.hasStatus.includes(this.tableState))
    }
  }

  ```

#### 4. never
  never 类型 表示不存在的类型。
  > 通常是一个从来不会有返回值的函数（如：如果函数内含有 while(true) {}）
  > 或者一个总是会抛出错误的函数（如：function foo() { throw new Error('Not Implemented') }）
  > 所返回的类型。
  never 类型的变量只能被 never 类型的值进行赋值。
  通常 never 类型会被结合 可辨识联合类型 或 校验分支完全性的时候去使用。
  ```typescript

  ```

#### 5. object
  object 表示引用类型，它是所以引用类型的基类，也就是说其他的引用类型变量可以赋值给 object 类型变量，比如 数组类型 函数类型 等都可以进行赋值。
  通常，在没有属性或方法的操作情况下，可以使用 object 作为类型。而当有属性访问，或者方法调用，那么在类型不收缩的情况下，ts 会报错。示例：
  ```typescript
  let obj: object = {
    name: 'asd',
    num: 123
  }
  // 有个问题需要注意：当对象被声明 object 类型后，访问或者修改该对象的属性时，会报错
  obj.a = 'qwe' // Error -> Property 'a' does not exist on type 'object'.
  // 所以通常情况下， 不要去使用 object 进行类型标注，而应使用 interface 和 type alias 去进行声明，然后标注。
  ```
  如下代码, 是 ts 对于 Object 构造函数的一个声明，它的 create 方法用于基于某个对象去创建一个新对象，可以看到其第一参数为 object | null 的联合类型，也就是说明该函数能接受任何引用类型的变量 或者 null。
  ```typescript
  interface ObjectConstructor {
    // ...
    create(o: object | null): any;
    create(o: object | null, properties: PropertyDescriptorMap & ThisType<any>): any;
    // ...
  }
  ```

#### 6. 数组 与 元组
  - 1. 数组
    数组的声明的语法为 `Array<T> T[]` 其中 T 表示泛型，可以使用其他类型去替代，表示相应类型的数组
    ```typescript
    let numArr: number[] = [1,2,3] // T 被 number 类型替代, 表示 number 型数组。
    let strArr: Array<string> = ['a', 'b', 'c'] // 表示 string 型数组
    ```

  - 2. 元组
    元组可以看作是特殊的数组，一般情况下数组是同一类型值的有序集合，而元组的每个元素都具有相关联的类型，同时数量也是确定的。
    其声明形式为 `[T,D]`
    ```typescript
    let tupleA: [string, number] = ['a', 1]

    // 通过解构赋值，可以正确的推断解构后的每个元素的类型。
    let [str, num] = tupleA // str -> string ,  num -> number
    ```

#### 7. 字面量类型
  字面量类型 就是 string、number 和 boolean 类型的实际类型，可以这样理解：string、number 和 boolean 就是它们各自类型的一个总的集合，而相应的字面量类型就是它们的子集。形式如下：
  ```typescript
  type Str = 'hello'
  type FalseType = false
  type Zero = 0
  ```
  字面量类型通常也需要复合成高级类型去使用。

### 高级类型

#### 1 对象类型( Object Types )
  首先要明确该类类型和上文中的`object`类型有所不同， `object`类型是所有引用类型（包括函数、数组等）的合集，而该条所述类型就是单纯的对象（键值对）类型。
  - 1. 使用
    对象字面量方式的标注, 也可以使用 下文中为 interface 和 type alias 进行类型命名然后再去标注。
    ```typescript
    let point: {
      x: number; // 类型后可以用分号、逗号，也可以什么都不加(只要不写在同一行)。
      y: number
    } = {
      x: 1,
      y: 1
    } 
    ```
  - 2. 可选属性
    在属性后加一个 ?，就能让它变成可选属性，意思就是可有可无。
    ```typescript
    let point: {
      x: number;
      y: number;
      z?: number // z 属性为可选属性，因此在赋值的时候可以没有。
    } = {
      x: 1,
      y: 1
    }
    ```
  - 3. 只读属性
    在属性前面加上 readonly，就能让它变成只读属性，这就意味着这个属性的值不能被修改。
    ```typescript
    let point: {
      readonly x: number;
      y: number;
    } = {
      x: 1,
      y: 1
    }
    point.x = 2 // Error -> Cannot assign to 'x' because it is a read-only property.
    point.y = 3 // OK
    // 可以看到，修改被 readonly 标注的属性 x 时，ts 报了个错误，因为它是只读属性。
    ```

#### 2 接口( interface )
  - 1. 定义及使用
    interface 就是接口的意思。

    声明对象，和上文中的对象字面量类型相识，但使用 interface 可以给其进行命名，从而可以在多个地方使用。可选属性 和 只读属性也能在 interface 中使用。
      ```typescript
      interface User {
        name: string
        password: string
      }
      let user: User = {
        name: 'admin',
        password: '123456'
      }
      ```
    声明函数
      ```typescript
      // 普通函数
      interface Foo {
        (name: string, type: number) => void
      }

      const foo: Foo = (name, type) => {
        console.log(`name is ${name}, type is ${type}`)
      }

      // 构造函数

      ```
    扩展
      类似于 class 的继承, 扩展 interface 也是通过 extends 关键字来实现的。
      ```typescript
      interface SuperUser extends User {
        type: 'vip' | 'svip'
      }
      let superUser: SuperUser = {
        name: 'admin',
        password: '123456',
        type: 'vip'
      }
      ```

  - 2. 字符串签名 和 数字签名
    对象的键可以是字符串也可以是数字，或 symbol 类型, 所以可以通过动态key 的形式，声明对象的类型。如下：
    ```typescript
    interface Info {
      [k: string]: number // 表示键为string类型，值为number型的对象。
    }
    ```

  - 3. 声明合并
    这是 interface 所具有的特性，它使得扩充 interface 很简便。具体为：只要同名的interface，那么它们的属性就会自动合并。
    ```typescript
    interface Point {
      x: number
      y: number
    }

    interface Point {
      z: number
    }

    let point: Point = { // 如果少写了 z 属性 或 x和y 属性 都会导致报错。
      x: 1,
      y: 1,
      z: 1
    }
    ```
#### 3. 类型别名( type alias )
  - 1. 使用
    类型别名 通过`type`关键字进行声明。顾名思义，它可以作为另一个类型的别名，也就是说，基础类型可以被重新命名。当然这样做没有什么实际意义，它主要是用来声明 元组、联合类型 和 交叉类型的。
    ```typescript
    type StringN = string; // 原始值的别名
    type StrAndNum = string | number; // string 和 number 的联合类型， 具体值的类型为两者中的某一个。

    // 声明对象和interface基本一致。且同个命名空间下，只能存在唯一命名的 type alias。
    // 上文中 使用 interface 声明的 User 类型 可以用 type alias 这样声明:
    type User = {
      name: string
      password: string
    };
    // 使用上与interface一致。
    let user: User = {
      name: 'admin',
      password: '123456'
    }
    ```

#### 3. interface 与 type alias 的区别
  通常情况下，interface 和 type alias 是可以相互替换的，但有这些细微差别：
  - 1. type alias 的相关错误信息，是会被其内部各个属性名所取代，而 interface 的错误信息则是 interface 命名的类型。
  - 2. interface 存在声明合并，而 type alias 不能。
  - 3. interface 只能用于声明对象（包含函数和类）的结构，而不能重新命名基础类型。type alias 两个都可以做到。

#### 4. 函数类型
  - 1. 函数类型定义
    上文提到过，可以通过 interface 和 type alias 来声明函数类型，不过通常也可以直接在函数上标注。
    ```typescript
    ```

  - 2. 参数类型

  - 3. this 类型
    在 ts 的普通函数中使用 this 会有一个报错。解决方法为 使用 箭头函数代替，使用 this 参数
    this 参数 是一个特殊的参数，它必须放在函数的第一个参数位置上，在编译成 js 后 this 参数会被去掉，使用时一定要注意 this 的类型声明要符合正确的this类型。

  - 4. 函数重载
    函数重载是指函数的多态性: 函数的 参数数量、参数类型 和 返回值 不同，但函数名相同。
    不管是 js 还是 ts 都没有真正的函数重载。因为 js 作为动态语言，天生不支持函数重载。
    在 ts 中函数重载需要声明多个函数，但 函数的实现只有一种，且其内部会对不同的参数 进行不同的处理，从而实现函数重载。
    ```typescript
    ```

#### 5. class
  - 1. class 是 ES6 中新增的一种语法，用于声明 类，其本质是一个特殊的函数，在 ts 中，则新增了更符合类的 字段声明
    分为 私有 共有 和 保护。同时也加入了 implements 用于实现接口，
    ```typescript
    ```

  - 2. 继承 及 实现
    继承 和 js 中的继承一致，而实现则是通过 implements 字段， 右侧为具体的 interface 声明的类型命名。


  - 3. 抽象类
    抽象类是一种特殊的类，通过 abstract 关键字，可以让普通类变为抽象类。


#### 6. 联合类型( union type )
  - 1. 定义 
    一个联合类型是由两个或以上的类型组合而成的，它的值只能是这些组合类型中的某一个。
    定义方式为：type A = typeA | typeB

    特殊：与 never 进行联合的类型是该类型本身，

  - 2. 可辨识联合类型。

#### 7. 交叉类型( interestion type )
  - 1. 定义
    交叉类型也是有两个或以上的类型组合而成，与联合类型不同的是，它的值必须是有这些组合类型的所有属性。
    定义方式为：type B = typeA & typeB
    从概念上可以这样理解交叉类型，比作交集，
    从实际上可以这样理解：交叉类型的结果就是其用于交叉类型中的各个类型的所有属性。

    特殊：与 never 交叉的类型，其结果是 never。 
    两个不相交的类型，交叉后也是 never。

#### 8. 泛型
  - 1. 泛型是指在定义函数、接口或类的时候，不预先指定具体的类型，使用时再去指定类型的一种特性。
  - 2. 泛型约束
    通过 extend 关键字可以对泛型进行约束，如下例子
    ```typescript
    ```

#### 9. 模板字符串类型
  1. 基础语法
  它的语法和 es 里的字符串模板很相似。
  目前存在 bug。 如果模板字符串类型中存在 number 或 string 类型，那么就无法正确的检测类型。

### 其他

#### 1. 类型推断
  通常我们可以不必去写类型注解，因为 ts 可以自动推断出变量的类型，要不然所有的变量都写类型的话，那也就失去了 js 的简洁性，这也是 ts 作为 js超集，不仅仅考虑了静态类型检测，而且还估计到了 js 的简洁性。

  let 和 const 声明变量的类型推断。注意 const 声明的非引用类型变量被推断为实际的字面量类型。
  ```typescript
  let str = 'hello' // str -> string
  const str2 = 'hello' // str2 -> 'hello'

  /**
    * obj ->  {
    *     name: string
    *  }
    */
  let obj = {  
    name: 'asd'
  }
  // 和 let 一致
  const obj2 = {  
    name: 'asd'
  }

  // 但是在其后加上 as const 断言， 那么就会推断为这样.
  /**
    * obj3 ->  {
    *     name: 'asd'
    *  }
    */
  const obj3 = {  
    name: 'asd'
  } as const // as const 和 用于声明常量的 const 有所不同，const 声明的常量本身不能修改，但它的属性可以被修改，而 as const 断言的变量属性也不能被修改。
  ```

#### 2. 类型断言
  - 1. ! 表示非空断言，用于标识变量不可能为 null 或 undefined
  在 vue2 开发中 可以用于声明 props 中。
  ```typescript
  @Prop()
  public data!: string
  ```
  也可以用于获取dom 等确定值不为 null 或 undefined 的情况。

  - 2. 类型断言 as语法 和 尖括号语法
  ```typescript
  let str = '123'
  let number: number = str as string
  ``` 

#### 3. 类型收缩
  类型收缩通常用于对联合类型的收缩。

## typescript 进阶

### 类型编程
  经过这几年的发展，ts 的类型系统已经非常成熟，而且还具有图灵完备：可以当作一门编程语言使用。比如这位大佬用它实现了4位加法器。 不过碍于本人自己水平，本节只会讲解一些最基础的类型编程。
#### 1. 类型守卫
  - 1. 定义作用
  - 2. in 
    使用 in 操作符做类型守卫，本质上就是借助了 js 中 in 操作符的用法：判断一个属性是否在一个对象中。
  - 3. typeof 
    本质上也是 通过 typeof 判断类型。
  - 4. instanceof
    用于判断 一个对象是否是一个类的实例。

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
    用于将对象的各个属性转化成只读属性。
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
  ```typescript
  ```

  - 2. 为什么不能在函数上使用装饰器： 因为存在函数提升。类是不会提升的，所以就没有这方面的问题。
  可以看以下代码:
  ```typescript
  var counter = 0;

  var add = function () {
    counter++
  }

  @add
  function foo() {
  }
  ```

  上述代码会被编译为以下代码
  ```typescript
  var counter
  var add

  @add
  function foo() {
  }

  counter = 0

  add = function () {
    counter++
  }
  ```

#### 2. 声明文件
  - 1. declare 是 ts 中的关键字，用于声明变量、方法等，主要是为了用于提供 js 文件或三方库 的类型声明。
    在 package.json 中会使用 type 字段去标识当前包的 类型声明文件，从而向使用者提供相应的代码补全、提示等功能。
    在编译 ts 文件的过程中，也可以通过配置 tsconfig.json 文件 生成相应的 声明文件。
    通常会在 xxx.d.ts 文件中使用，因为该文件不会被编译器编译成 js 代码。
    ```typescript
    declare global {
      interface Window {
        webApp: { // 在全局环境挂载一个webApp属性，从而可以在用的地方有类型检测
          baseUrl: string
        }
      }
    }
    
    const { baseUrl } = window.webApp
    ```
  
  - 2. 三重斜线指令
  使用三重斜线指令可以将声明文件引进 ts 文件中。
  ```typescript
  /// <reference path="./jquery.d.ts" />
  ```
#### 3. tsconfig.json 配置
  类似于前端其他工具，比如 webpack 、eslint 、babel 等，虽然可以通过 cli 程序指定具体的文件进行相关操作。但通常工程化的项目中，会采用配置文件来代替手工 cli 输入。ts 的相关配置文件为 tsconfig.json 下面简单说说常用的属性：
  ```json
  {
    "compilerOptions": { // 这个下面是有关编译选项的配置。
      "target": "esnext", // 目标语言版本 -> 就是编译后生成的 js 版本。
      "module": "esnext", // 目标代码的模块标准：esnext 为ES模块。
      "strict": true,
      "jsx": "preserve",
      "importHelpers": true,
      "moduleResolution": "node",
      "experimentalDecorators": true, // 开启装饰器语法，因为装饰器在ES标准中并没有完善，只是个实验特性，所以需要开启才能使用。
      "esModuleInterop": true,
      "allowSyntheticDefaultImports": true,
      "sourceMap": true,
      "baseUrl": ".",
      "types": [
        "webpack-env",
        "mocha",
        "chai"
      ],
      "paths": { // 路径映射。 比如在 ts + vue 的项目中，如果没有这项配置， 那么通过 @/ 这种方式引入的模块编译时会报错。
        "@/*": [
          "src/*"
        ]
      },
      "lib": [ // 该配置与 taget 配置相关， 如果 targer 设置为 ES5 那么就要在这里引入相关文件。注意这里引入的只是.d.ts 类型声明文件。
        "esnext",
        "dom", // 比如, 去掉该项， 将会使 dom 相关的 api 失去类型，从而导致编译报错。
        "dom.iterable",
        "scripthost"
      ]
    },
    "include": [ // 要编译的文件
      "src/**/*.ts",
      "src/**/*.tsx",
      "src/**/*.vue",
      "tests/**/*.ts",
      "tests/**/*.tsx"
    ],
    "exclude": [ // 不用编译的文件
      "node_modules",
      "src/components/video-preview/video-preview.vue",
      "src/components/video-preview/video/*.js"
    ]
  }

  ```
  注意：tsc 和 babel 类似，都是只转化语法 （也就是像箭头函数，let，const 等），而不会转化新 api （比如：Promise Map Array.find 等）。要想在 低版本ES 中使用这些新 api 就需要引入 core-js 等库。

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
  
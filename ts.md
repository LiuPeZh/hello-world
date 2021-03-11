## TypeScript 基础

本文旨在从整体上去了解和学习 TypeScript， 从而让自己构建起 TypeScript 的知识体系，便于后续深入学习。

### 基础类型

#### 1. 普通基础类型
  普通基础类型关键字: 
  `boolean、number、string、symbol、bigint、void、null、undefined`

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

  `boolean 、number 、string 、symbol 、bigint 、null 和 undefined`基本和`js`中的普通类型一一对应。 其中除了`null`以外，其他类型就相当于`js`中使用`typeof`运算符的操作结果。

  可以发现除了`null`和`undefined`其他类型都是原生构造函数的首字母小写形式，当然这些原生构造函数也可以被用作类型，但在`ts`很少去这样使用。

  `void`表示空类型，一般用于函数没有返回值的时候。它可以被`any、undefined、null 和 never`类型的值进行赋值。注意`void`类型和`js`中的`void`操作符，`void`操作符总是会返回`undefined`值，而`void`类型就只是空类型。

#### 2. unknown 和 any 
  1. unknow

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

      let num: number = unkonwnVal // Error -> Type 'unknown' is not assignable to type 'number'.
      ```

      实际使用中通常会先对`unknow`类型变量进行`类型收缩`，然后再进行具体的操作。如下代码：
      ```typescript
      // function foo(val: unknown): string | number
      function foo(val: unknown) {
        if (typeof val === 'function') {
          val() // 这块 val 变量将会被推断为函数类型 (parameter) val: Function
        } else if (typeof val === 'number' || typeof val === 'string') {
          return val // 而在这块，val 将会被推断成联合类型 string | number， (parameter) val: string | number
        }
        throw Error('参数类型应该为：number、string和function')
      }
      ```
      &nbsp;
  2. `any` 
      表示任何类型，它可以赋给任何类型变量，也可以接受任何类型变量。
      &nbsp;
      如果一个变量设置为`any`类型， 那么就可以进行任何操作，就像是在写`js`一样，但这样就会丢失类型检查，而且更不能确保程序运行不出错。就比如常见的` Cannot read property 'a' of null/undefined `错误。

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
      &nbsp;
  3. `unknown` 和 `any` 的区别
      `unknown` 和 `any` 的最大的区别就是 `unknown` 可以确保类型检查，而 `any` 则相当于完全放弃了类型检查。
      &nbsp;
      所以通常情况下应该使用 `unknown` 而不是 `any`。当然个人感觉在通常业务开发中也没有必要去禁用 `any`，一方面，使用 `any` 可以作为 `ts` 初学者过渡的阶段，另一方面有时候可能会花费更多的时间在类型定义上，而需求变动时，又得重写，这时候 `any` 就很具有作用。

#### 3. Enum 枚举类型
  1. 定义及语法
      `enum` 类型表示一系列数据的集合, 是对 `js` 类型的一个补充, 因此它既可以作为类型也可以作为变量进行使用。
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
      &nbsp;
  2. 使用 enum 类型 需注意这几点:
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
        &nbsp;
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
        &nbsp;
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
        &nbsp;
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
      - 7. 当然最长见的用法就是用于消除魔法字符串
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
  ```typescript
  function error(message: string): never {
    throw new Error(message);
  }

  // Inferred return type is never
  function fail() {
    return error("Something failed");
  }

  // Function returning never must not have a reachable end point
  function infiniteLoop(): never {
    while (true) {}
  }
  ```

  和 `unknow` 的特性相反 `never` 类型的变量只能被 never 类型的值进行赋值，但`never`类型的值则能赋值给任何变量。
  ```typescript
  let a: never = 1 // Error -> Type 'number' is not assignable to type 'never'
  let b: never = fail()
  let c: string = fail()
  ```
  通常 never 类型会被用于 `可辨识联合类型` 或校验 `分支完全性` 的时候去使用。

#### 5. object
  `object` 表示引用类型，它是所以引用类型的基类，也就是说其他的引用类型变量可以赋值给 `object` 类型变量，比如 数组类型 函数类型 等都可以进行赋值。
  通常，在没有属性或方法的操作情况下，可以使用 `object` 作为类型。而当有属性访问，或者方法调用，那么在类型不收缩的情况下，`ts` 会报错。示例：

  ```typescript
  let obj: object = {
    name: 'asd',
    num: 123
  }
  // 有个问题需要注意：当对象被声明 object 类型后，访问或者修改该对象的属性时，会报错
  obj.a = 'qwe' // Error -> Property 'a' does not exist on type 'object'.
  // 所以通常情况下， 不要去使用 object 进行类型标注，而应使用 interface 和 type alias 去进行声明，然后标注。
  ```
  &nbsp;
  如下代码, 是 `ts` 对于 `Object` 构造函数的一个声明，它的 `create` 方法用于基于某个对象去创建一个新对象，可以看到其第一参数为 `object | null` 的联合类型，也就是说明该函数能接受任何`引用类型`的变量或者`null`。
  ```typescript
  interface ObjectConstructor {
    // ...
    create(o: object | null): any;
    // ...
  }
  ```

#### 6. 数组 与 元组
  1. 数组
    数组的声明的语法为 `Array<T> T[]` 其中 `T` 表示泛型，可以使用其他类型去替代，表示相应类型的数组
      ```typescript
      let numArr: number[] = [1,2,3] // T 被 number 类型替代, 表示 number 型数组。
      let strArr: Array<string> = ['a', 'b', 'c'] // 表示 string 型数组
      ```
      &nbsp;
  2. 元组
    元组可以看作是特殊的数组，一般情况下数组是同一类型值的有序集合，而元组的每个元素都具有相关联的类型，同时数量也是确定的。
    其声明形式为 `[T,D]`
      ```typescript
      let tupleA: [string, number] = ['a', 1]

      // 通过解构赋值，可以正确的推断解构后的每个元素的类型。
      let [str, num] = tupleA // str -> string ,  num -> number
      ```

#### 7. 字面量类型
  字面量类型就是 `string、number 和 boolean` 类型的实际值类型，可以这样理解：`string、number 和 boolean` 就是它们各自类型的一个总的集合，而相应的字面量类型就是它们的子集。形式如下：
  ```typescript
  type Str = 'hello'
  type FalseType = false
  type Zero = 0
  ```

  字面量类型通常可以用于校验函数参数，或复合成高级类型去使用。
  ```typescript
  type PreStr = 'hello' | 'hi'

  function say(pre: PreStr, other: string) {
    console.log(pre + other)
  }

  say('hello', '123')
  say('hi', '123')
  say('xxx', '123')  // Error -> Argument of type '"xxx"' is not assignable to parameter of type 'PreStr'.
  ```

### 高级类型

#### 1. 对象类型( Object Types )
  首先要明确该类类型和上文中的`object`类型有所不同， `object`类型是所有引用类型（包括函数、数组等）的合集，而该条所述类型就是单纯的对象（键值对）类型。

  1. 使用
    可以使用`对象字面量`方式的标注, 也可以使用下文中的 `interface` 和 `type alias` 进行类型命名然后再去标注。
  
      ```typescript
      let point: {
        x: number; // 类型后可以用分号、逗号，也可以什么都不加(只要不写在同一行)。
        y: number
      } = {
        x: 1,
        y: 1
      } 
      ```
  2. 可选属性
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
  3. 只读属性
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
&nbsp;

#### 2. 接口( interface )
  1. 定义及使用
    `interface` 是用于声明类型规范。

      - 1. 声明对象，和上文中的对象字面量类型相识，但使用 `interface` 可以给其进行命名，从而可以在多个地方使用。可选属性 和 只读属性也能在 `interface` 中使用。
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
      - 2. 声明函数
        ```typescript
        // 普通函数
        interface Foo {
          (name: string, type: number) => void
        }

        const foo: Foo = (name, type) => {
          console.log(`name is ${name}, type is ${type}`)
        }

        // 构造函数 // 声明为构造函数类型，那么就只能使用new去调用。
        class Person {
          name: string
          constructor(name: string) {
            this.name = name
          }
        }
        type SomeConstructor = {
          new (s: string): Person;
        };
        function fn(ctor: SomeConstructor) {
          return new Person("X");
        }
         ```
        &nbsp;
  2. 扩展
      类似于 `class` 的继承, 扩展 `interface` 也是通过 `extends` 关键字来实现的。
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

  3. 字符串签名 和 数字签名
    对象的键可以是字符串也可以是数字，或 `symbol` 类型。而体现`js`灵活性的一点就是对象的键可以是动态可变的，因此在`ts`中可以通过使用`字符串签名`和`数字签名`来生成`动态key`的对象类型。如下：
      ```typescript
      interface Info {
        [k: string]: number // 表示键为string类型，值为number型的对象。
      }
      let info: Info = {
        messag: 123
      }

      interface MyArr {
        [index: number]: number // 表示键为number类型，值为number型的对象。比较特殊：因为数组类型的值可以赋值给他。
      }
      let myArr1: MyArr = {
        0: 123
      }
      let myArr2: MyArr = [0, 1, 2]
      ```

  3. 声明合并
    这是 `interface` 所具有的特性，它使得扩充 `interface` 很简便。具体为：只要是同名的`interface`，那么它们的属性就会自动合并。
      ```typescript
      interface Point {
        x: number
        y: number
      }

      interface Point { // 和上述interface同名，因此发生合并
        z: number
      }

      let point: Point = { // 如果少写了 z 属性 或 x和y 属性 都会导致报错。
        x: 1,
        y: 1,
        z: 1
      }
      ```

#### 3. 类型别名( type alias )
  类型别名 通过`type`关键字进行声明。顾名思义，它可以作为另一个类型的别名，也就是说，基础类型可以被重新命名。当然这样做没有什么实际意义，它主要是用来声明`元组、联合类型 和 交叉类型`的。
  ```typescript
  type StringN = string; // 原始值的别名
  type StrAndNum = string | number; // string 和 number 的联合类型， 具体值的类型为两者中的某一个。
  type KeyValue = [string, number];

  let keyValue: KeyValue = ['num', 123]
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

  type SuperUser = {
    type: 'vip' | 'svip'
  } & User
  ```

#### 4. interface 与 type alias 的区别
  通常情况下，`interface` 和 `type alias` 是可以相互替换的，但有这些细微差别：
  - 1. `type alias` 的相关错误信息，是会被其内部各个属性名所取代，而 `interface` 的错误信息则是 `interface` 命名的类型。
  - 2. `interface` 存在声明合并，而 `type alias` 不能。
  - 3. `interface` 只能用于声明对象（包含函数和类）的结构，而不能重新命名基础类型。`type alias` 两个都可以做到。

#### 5. 函数类型
  1. 函数类型
    通过使用函数类型，可以在很大程度上帮助我们解决一些常见bug, 比如参数类型传错。同时函数的使用也会变得很简单：结合编辑器的提示和类型检测，就感觉像看文档一样。
    上文提到过，可以通过 `interface` 和 `type alias` 来声明函数类型，不过通常也可以直接在函数上标注。
      ```typescript
      type Foo = {
        (a: number): number;
      };
      type FooShort = (a: number) => number;

      const foo1: Foo = (a: number) => a + 2
      const foo2: Foo = (a: number) => a + 2

      function greet(name: string) {
        console.log("Hello, " + name.toUpperCase() + "!!");
      }
      greet(42); // Error -> Argument of type 'number' is not assignable to parameter of type 'string'.
      ```

  2. this 类型
    在 `ts` 的普通函数中使用 `this` 会有一个类型报错。解决方法为: 使用`箭头函数`代替，另一个是使用 `this` 参数。
    `this` 参数 是一个特殊的参数，它必须放在函数的第一个参数位置上，在编译成 `js` 后 `this` 参数会被去掉。使用时一定要注意 `this` 的类型声明要符合正确的`this`类型。
      ```typescript
      interface Card {
        suit: string;
        card: number;
      }

      interface Deck {
        suits: string[];
        cards: number[];
        createCardPicker(this: Deck): () => Card;
      }

      let deck: Deck = {
        suits: ["hearts", "spades", "clubs", "diamonds"],
        cards: Array(52),
        createCardPicker: function (this: Deck) {  // 可以看到第一个参数为 this，它被标注为 Deck 类型，因此在该函数中使用 this 时都会被推断为 Deck 类型。
          return () => {
            let pickedCard = Math.floor(Math.random() * 52);
            let pickedSuit = Math.floor(pickedCard / 13);

            return { suit: this.suits[pickedSuit], card: pickedCard % 13 };
          };
        },
      };
      ```

  3. 函数重载
    函数重载是指函数的多态性: 函数的 `参数数量、参数类型 和 返回值` 不同，但函数名相同。
    但不管是 `js` 还是 `ts` 都没有真正的函数重载，因为 `js` 作为动态语言，天生不支持函数重载。
    在 `ts` 中函数重载需要声明多个函数，但函数的实现只有一种，且其内部需要对不同的参数进行不同的处理，从而实现函数重载。
      ```typescript
      interface ObjectConstructor {
        // ...
        // Obect.create 函数用于基于某个对象P创建一个新对象，新对象的原型指向该对象P。其可以只传一个参数，也可传两个参数，第二个参数类似于Object.defineProperties()的第二个参数，会被当做新属性插入到新对象中。
        create(o: object | null): any;
        create(o: object | null, properties: PropertyDescriptorMap & ThisType<any>): any;
        // ...
      }
      // Object.create polyfill
      if (typeof Object.create !== "function") {
        Object.create = function (proto, propertiesObject) {
          if (typeof proto !== 'object' && typeof proto !== 'function') {
            throw new TypeError('Object prototype may only be an Object: ' + proto);
          } else if (proto === null) {
            throw new Error("This browser's implementation of Object.create is a shim and doesn't support 'null' as the first argument.");
          }

          if (typeof propertiesObject !== 'undefined') throw new Error("This browser's implementation of Object.create is a shim and doesn't support a second argument.");

          function F() {}
          F.prototype = proto;

          return new F();
        };
      }

      let obj = {
        name: 'obj'
      }

      let a = Object.create(obj) // a -> {}  __proto__ -> obj

      let b = Object.create(obj, {
        type: {
          value: 1
        }
      }) // b -> { type: 1 }  __proto__ -> obj
      ```

#### 6. class
  1. 使用 
    `class` 是 `ES6` 中新增的一种语法，用于声明 `类`。
    `类`是包含一组属性和方法的封装体，在`js`中，并不存在真正的`类`，其只是一个基于原型的语法糖, 本质就是是一个特殊的函数。在 `ts` 中也一样，只不过新增了更符合类的`字段声明`: 分为 `public` `private` 和 `protected`。同时也加入了 `implements` 用于实现接口，
      ```typescript
      class Point {
        public x: number; // 公有字段可以被自身方法、自身实例、子类方法和子类实例访问。
        public y: number;
        private z: number = 0;  // 私有字段，只能被自身方法访问。
        // protected 保护字段，只能在自身方法和子类方法中访问，而不能被实例访问。
      }
      const pt = new Point();
      pt.x = 0;
      pt.y = 0;
      pt.z = 1 // Error -> Property 'z' is private and only accessible within class 'Point'.
      ```

      需要注意`ts`中的私有字段`private`只是在编译时检测，而不会涉及到运行时，也就是说，只是编译出错，但不影响访问，要想真正的使用私有字段，就需使用`ES6`标准中提出的私有字段： `#`开头的属性语法。
    &nbsp;

  2. 继承 及 实现
    继承 和 `js` 中的继承一致，而实现则是通过 `implements` 字段， 右侧为具体的 `interface` 声明的类型命名。

      ```typescript
      interface Pingable {
        ping(): void;
      }

      class Sonar implements Pingable {
        ping() {
          console.log("ping!");
        }
      }

      class Ball implements Pingable {
      // Class 'Ball' incorrectly implements interface 'Pingable'.
      //  Property 'ping' is missing in type 'Ball' but required in type 'Pingable'.
        pong() {
          console.log("pong!");
        }
      }
      ```

  3. 抽象类
    抽象类是一种特殊的类，通过 `abstract` 关键字，可以让普通类变为抽象类。与普通类最大的不同就是，抽象类不能被实例化。
      ```typescript
      abstract class Base {
        abstract getName(): string;

        printName() {
          console.log("Hello, " + this.getName());
        }
      }

      const b = new Base(); // Cannot create an instance of an abstract class.

      class Derived extends Base {
        getName() {
          return "world";
        }
      }

      const d = new Derived();
      d.printName();
      ```


#### 7 联合类型( union type )
  1. 定义 
    一个联合类型是由两个或以上的类型组合而成的，它的值只能是这些组合类型中的某一个。
    定义方式为：`type A = typeA | typeB`
    &nbsp;
      ```typescript
      type NumberOrString = number | string // 我们定义了一个可以是number 也可以是 string 的类型。
      ```

      特殊：与 never 进行联合的类型是该类型本身，
  &nbsp;
  2. 可辨识联合类型。
    可辨识联合类型，就是组成联合类型的每个类型中都有相同的一个字段，用于标识该类型与其他类型的不同。
      ```typescript
      type NetworkLoadingState = {
        state: "loading";
      };
      type NetworkFailedState = {
        state: "failed";
        code: number;
      };
      type NetworkSuccessState = {
        state: "success";
        response: {
          title: string;
          duration: number;
          summary: string;
        };
      };
      // Create a type which represents only one of the above types
      // but you aren't sure which it is yet.
      type NetworkState =
        | NetworkLoadingState
        | NetworkFailedState
        | NetworkSuccessState;

      function logger(state: NetworkState): string {
        switch (state.state) {
          case "loading":
            return "Downloading...";
          case "failed":
            // The type must be NetworkFailedState here,
            // so accessing the `code` field is safe
            return `Error ${state.code} downloading`;
          case "success":
            return `Downloaded ${state.response.title} - ${state.response.summary}`;
        }

      ```

#### 8 交叉类型( interestion type )
  1. 定义
    交叉类型也是有两个或以上的类型组合而成，与联合类型不同的是，它的值必须是有这些组合类型的所有属性。
    定义方式为：`type B = typeA & typeB`
    从实际使用上可以这样理解：交叉类型生成的新类型就是其用于交叉类型中的各个类型所组成的新类型。
      ```typescript
      interface Foo {
        foo: string;
        name: string;
      }
      
      interface Bar {
        bar: string;
        name: string;
      }

      type X = Foo & Bar
      /**
        * X -> {
        *   foo: string
        *   name: string
        *   bar: string
        * }
        */

      let x: X = {
        foo: 'asd',
        name: '123',
        bar: 'asd',
      }
      ```

      特殊：
      - 1. 与 never 交叉的类型，其结果是 never。 
      - 2. 两个不相交的类型，交叉后也是 never。比如 number & string ，因为两者并不相交，所以其类型为 never。
      - 3. 如果相交的两个对象有同名属性，且该同名属性的类型不同， 那么相交后的该属性也符合上面两条规则。

#### 9 泛型
  1. 泛型是指在定义函数、接口或类的时候，不预先指定具体的类型，使用时再去指定类型的一种特性。
      ```typescript
      function identity<Type>(arg: Type): Type {
        return arg;
      }
      identity(1) // return -> number
      identity('hello') // return -> string

      interface Option<T> {
        label: string
        value: T
      }

      let option: Option<number> = {
        label: '一',
        value: 1
      }
      let option2: Option<number> = {
        label: '一',
        value: '一'
      }
      ```

  2. 泛型约束
    当我们想使用泛型，但并不想使用所有类型的时候，就可以使用泛型约束，从而让泛型在一定的类型范围内。
    通过 `extend` 关键字可以对泛型进行约束，如下例子
      ```typescript
      // 将对象转化为query string
      function obj2QueryStr<T extends object, K extends keyof T>(obj: T): string {
        let str = ''
        for (const key of Object.keys(obj) as K[]) {
          str += `&${key}=${obj[key]}`
        }
        return str
      }

      interface ITree {
        childrens?: ITree[] | null
      }
      /**
      * 树形结构遍历
      * @param tree 
      * @param fn 
      */
      function traverseTree<T extends ITree>(tree: T[], fn: (node: T) => void ) {
        if (!tree.length) {
          return
        }
        const queue = tree.slice() // 浅拷贝 防止修改原始数据
        while(queue.length) {
          let len = queue.length
          while(len--) {
            const node = queue.shift()
            if (!node) {
              continue
            }
            fn(node)
            if (node.childrens) {
              queue.push(...node.childrens as T[])
            }
          }
        }
      }
      ```


#### 10. 模板字符串类型
  1. 基础语法
  它的语法和 es 里的字符串模板很相似。用于灵活的创建字符串字面量类型。
      ```typescript
      type EmailLocaleIDs = "welcome_email" | "email_heading";
      type FooterLocaleIDs = "footer_title" | "footer_sendoff";

      type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;
      //   ^ = type AllLocaleIDs = "welcome_email_id" | "email_heading_id" | "footer_title_id" | "footer_sendoff_id"
      ```

## TypeScript 进阶

### 类型概念

#### 1. 类型推断
  通常我们可以不必去写类型注解，因为 `ts` 可以自动推断出变量的类型，要不然所有的变量都写类型的话，那也就失去了 `js` 的简洁性，这也是 `ts` 作为 `js` 超集，不仅仅考虑了静态类型检测，而且还估计到了 `js` 的简洁性。

  `let` 和 `const` 声明变量的类型推断。注意 `const` 声明的非引用类型变量被推断为实际的字面量类型。
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

#### 2. 类型收缩
  类型收缩就是从宽泛的类型换成窄类型的过程。通常用于处理联合类型和`unknow`类型的场景。
  ```typescript
  const tableBody = document.querySelector('.el-table__body') // tableBody -> Element | null 
  // 直接访问 tableBody的属性或方法，会导致类型报错，因为这里是 Element 和 null 的联合类型。
  if (tableBody) { // 通过这样的判断，就会使得，该if块下的tableBody都会变成 Element 类型。
    // dom元素相关的操作
  }
  const options = [
    { label: '一', value: 1 },
    { label: '二', value: 2 },
    { label: '三', value: 3 },
  ]
  const option = options.find((item) => item.value === 1)
  /**
    *  option ->  {
    *               label: string;
    *               value: number;
    *             } | undefined
    */
  // 数组的 find 方法也是会返回 null 和 数组元素的类型 的联合类型， 因此在使用option 时，也需要进行类型收缩
  if (option) {
    console.log(option.label)
  }
  ```


#### 3. 类型断言
  1. ! 表示非空断言，用于标识变量不可能为 `null` 或 `undefined`。通常可以应用于声明变量，然后在后续过程中操作。
    在 `vue2` 开发中,可以用于声明 `props` 中。
      ```typescript
      @Prop()
      public data!: string
      ```
      也可以用于获取dom 等确定值不为 null 或 undefined 的情况。比如上文类型收缩中的例子：
      ```typescript
      // 如果确定这个元素是存在的，那么只需要在该方法后加上!操作符，就能将联合类型中的 null 类型过滤掉。
      const tableBody = document.querySelector('.el-table__body')! // tableBody -> Element
      // dom元素相关的操作 // 因为 tableBody 位 Element 类型，因此进行相关dom操作，不会引发类型错误。
      }
      ```

  2. 类型断言 `as语法` 和 `尖括号语法`
      ```typescript
      let str = '123'
      let num: number = str as string

      // 复杂一点的例子
      interface TableData {
        [k: string]: number | string
      }

      const heads = ['name', 'lastName', 'date']
      const datas = [
        ['asd', 'qwe', '2020-12-31'],
        ['zxc', 'cvb', '2021-01-01'],
      ]
      const tableDatas = datas.map((data) => {
        return heads.reduce((acc, head, idx) => {
          acc[head] = data[idx]
          return acc
        }, {} as TableData) // reduce 方法的第二个参数，如果只是 {} 那么就会导致 上面 acc[head] = data[idx] 类型错误，
        // 因为不能位空对象添加属性。而通过 as 断言位 TableData， 那么 acc 也就会是 TableData 类型。
        // 最后结合类型推断，tableDatas 也是 TableDatap[] 类型
      })
      console.log(tableDatas)
      /**
        * [
        *   {
        *     "name": "asd",
        *     "lastName": "qwe",
        *     "date": "2020-12-31"
        *   }, 
        *   {
        *     "name": "zxc",
        *     "lastName": "cvb",
        *     "date": "2021-01-01"
        *   }
        * ]
        */
      
      // 尖括号断言
      let someValue: unknown = "this is a string";
      let strLength: number = (<string>someValue).length;
      ``` 
      通常因为和`jsx`语法冲突，所以推荐使用 `as` 进行断言。

  3. `?` 可选链断言
    和ES中的可选链一样，如果某个属性是可选属性，那么通过使用 `?` 就能避免写过多的判断语法。
      ```typescript
      // 还是上文中的那个例子：
      const tableBody = document.querySelector('.el-table__body')

      // 不过这次我们使用 ? 可选链操作符去调用 dom方法，如下调用addEventListener，此时就不会出现类型错误。
      tableBody?.addEventListener('click', (e) => {
          console.log(e)
      })
      ```

#### 4. 类型守卫
  1. 类型守卫
    类型守卫 可以理解为类型收缩的更准确的操作。在类型收缩中，我们通过使用if判断变量是否为 `null` 或 `undefined` 来实现类型收缩。但这样判断会导致一个问题：运行时，可能会将一些其他类型变量也判断为false或 `ture`，这是因为 `js` 的动态类型，从而存在隐式转换，比如 空字符串 `''`、 数字 `0`、`NaN` 会被判断为 `false`，而 空对象 `{}`、空数组 `{}` 则会被判断为 `ture`。因此在存在这些边界值的情况下，直接使用 `if` 判断是否为空 就不准确了。但幸好在 `js` 中还有其他一些操作符用于帮助我们判断类型。

  2. `in` 
    使用 `in` 操作符做类型守卫，本质上就是借助了 `js` 中 `in` 操作符的用法：判断一个属性是否在一个对象中。
      ```typescript
      type Fish = {
        swim: () => void
      };
      type Bird = {
        fly: () => void
      };
      function move(pet: Fish | Bird) {
        if ("swim" in pet) { 
          return pet.swim();
        }
        return pet.fly();
      }
      ```
  3. typeof 
    本质上也是 通过 `typeof` 判断类型。不过 `typeof` 只会返回这些类型 `"undefined", "number", "string", "boolean", "bigint", "symbol", "object"、 "function"`

      ```typescript
      function isNumber(x: any): x is number {
        return typeof x === "number";
      }

      function isString(x: any): x is string {
        return typeof x === "string";
      }

      function padLeft(value: string, padding: string | number) {
        if (isNumber(padding)) {
          return Array(padding + 1).join(" ") + value;
        }
        if (isString(padding)) {
          return padding + value;
        }
        throw new Error(`Expected string or number, got '${padding}'.`);
      }
      ```
  4. `instanceof`
    用于判断 一个对象是否是一个类的实例。
      ```typescript
      class Foo {
        foo = 123;
        common = '123';
      }

      class Bar {
        bar = 123;
        common = '123';
      }

      function doStuff(arg: Foo | Bar) {
        if (arg instanceof Foo) {
          console.log(arg.foo); // ok
          console.log(arg.bar); // Error -> Property 'bar' does not exist on type 'Foo'
        }
        if (arg instanceof Bar) {
          console.log(arg.foo); // Error -> Property 'foo' does not exist on type 'Bar'
          console.log(arg.bar); // ok
        }
      }

      doStuff(new Foo());
      doStuff(new Bar());
      ```

#### 5. 类型兼容
  1. `subtype`
    在基础类型 `any` 和 `unknow` 类型中有提过 `subtype。` 我们可以看出，如果 `B` 是 `A` 的 subtype，那么 B 类型的值就能赋值给 `A` 类型的变量 (函数调用的参数也一样), 反过来则不能赋值。需要注意使用对象字面量赋值时会进行严格检查（函数参数类同）。
      ```typescript
      interface A {
        name: string
      }
      interface B {
          name: string
          type: number
      }

      type BisSubtypeOfA = B extends A ? true : never // -> true

      let b: B = {
          name: '123',
          type: 1
      }
      let a: A = b

      let a1: A = {
          name: 'a1'
      }

      let b1: B = a1  // Error -> Property 'type' is missing in type 'A' but required in type 'B'

      
      let c: A = {
        name: 'c',
        type: 1 
        // Error -> Type '{ name: string; type: number; }' is not assignable to type 'A'.
        // Object literal may only specify known properties, and 'type' does not exist in type 'A'.
      }
      ```
  &nbsp;

  2. `bottom type` 和 `top type`
    `bottom type` 是所有类型的 `subtype`， 所有类型是 `top type` 的 `subtype`。 `top > 其他类型 > bottom`。
    回到上文提到过的 `unknow` 、 `any` 和 `never` 类型，从 `top type` 和 `bottom type` 角度来看： 
    `unknow` 就是 `top type`（其他类型的值可以赋值给 `unknown` 类型的变量）；
    `never` 则是 `bottom type` （可以赋值给其他类型变量，但反之则不能）；
    `any` 则既是 `top type` 又是 `bottom type`（`any` 类型变量可以任意赋值，反之也一样）。
&nbsp;

  3. 结构类型( `structural type `)
    `typescript` 的类型系统采用的是结构类型，即只要两个变量类型的结构（`shape`）相同，那这两个类型就是相等的（两个类型的变量可以相互赋值）。
    但上述情况只在变量赋值的时候存在，如果使用了对象字面量，那就会报错，因为 `ts` 会对对象字面量进行特殊的处理进行额外属性检测。


### 类型编程
  经过这几年的发展，`ts` 的类型系统已经非常成熟，而且还具有图灵完备：可以当作一门编程语言使用。比如有大佬用它实现了8位运算。 不过碍于本人自己水平，本节只会讲解一些最基础的类型编程。

#### 1. 类型映射
  `类型映射`就是通过一个类型去创建另一个类型。`ts` 中提供了这些操作符用于创建新类型: `keyof type`、`typeof type` 以及 `索引访问类型( Indexed Access Types )`

  1. keyof 操作符
    `keyof T` 可以获取 `T` 类型的`key`字段，类似于 `js` 中的 `Object.keys()`, 通常返回的是一个有字面量类型组成的联合类型。
      ```typescript
      type Point = { x: number; y: number };
      type P = keyof Point; // P 的实际类型为 'x' | 'y'
      type IsTrue = P extends 'x' | 'y' ? true : false // 可以验证： ISTrue 为 true

      ```
  2. typeof 操作符
    `typeof` 在 `js` 中适用于判断类型的，而在 `ts` 也可以用来推断实际值的类型。
      ```typescript
      let p = { x: number; y: number };
      type Point = typeof p;
      /** 
        * Point -> 
        *   {
        *     x: number;
        *     y: number;
        *   }
        *
        */
      ```
  3. 索引访问
    和 `js` 中访问对象类似，在 `ts` 中也可以访问类型中字段，只不过结果为该字段的标注类型。如果使用联合类作为索引访问，那么得到的结果也就是由这些联合类型`匹配的字段`的标注`类型`,组成的`新的联合类型`。
      ```typescript
      type Person = { age: number; name: string; alive: boolean };
      type Age = Person["age"]; // Age -> number
      type I1 = Person["age" | "name"]; // I1 -> number | string
      type I2 = Person[keyof Person];   // I2 -> number | string | boolean
      ```

#### 2. 条件类型
  1. 语法
    类似于 `js` 中的 三元表达式， `ts` 中的类型也能够根据条件是否符合而返回不同的类型。其结构如下:
    `T extends U ? X : Y`
    所用到的关键字和 `泛型约束` 一样,都是 `extends`。 这个条件类型表示 `T` 符合 `U` (`T` 是 `U` 的子类型)， 那么就得到 `X` 类型，负责得到 `Y` 类型。注意：和上文 `类型兼容` 不同，这里是涉及到的是`泛型`，所以可以使用`对象字面量`。

      ```typescript
      interface Animal {
        live(): void;
      }
      interface Dog extends Animal {
        woof(): void;
      }
      type IsAnimal<T> = T extends Animal ? true : false;
  
      type Example1 = IsAnimal<Dog>
      //   ^ = type Example1 = true

      type Example2 = IsAnimal<RegExp>
      //   ^ = type Example2 = false
      ```

      如果 `T` 为联合类型那么就会对联合类型中的每一个类型进行条件判断：也就是说 `T extends U ? X : Y` 中，当 `T` 是 `A | B` 时，会拆分成 `A extends U ? X : Y | B extends U ? X : Y`:
      
      ```typescript
      type Example3 = IsAnimal<Dog | RegExp>
      //   ^ = type Example3 = boolean
      ```
      &nbsp;

  2. infer T
    `infer` 是与条件类型绑定出现的关键词， 用于 `extends` 的右边，替代要判断的类型条件，从而方便条件分支中使用。
      ```typescript
      type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
      type StrArr = string[];

      type Str = Flatten<StrArr>
      //   ^ = type Str = string

      type num = Flatten<number>
      //   ^ = type num = number
      ```

#### 3. 常用工具类型
  1. Partial<Type> 
    用于将`泛型Type`的各个属性转化成可选属性。
    源码:
      ```typescript
      type Partial<T> = { [P in keyof T]?: T[P] | undefined; }
      ```
      示例:
      ```typescript
      interface Todo {
        title: string;
        description: string;
      }
      type PartialTodo = Partial<Todo>
      //   ^ = type PartialTodo = {
      //         title?: string;
      //         description?: string;
      //       }
      ```
  2. Required<Type> 
    用于将`泛型Type`的各个属性转化成必填属性。
    源码:
      ```typescript
      type Required<T> = { [P in keyof T]-?: T[P]; }
      ```
      示例:
      ```typescript
      interface Props {
        a?: number;
        b?: string;
      }

      const obj: Props = { a: 5 };

      const obj2: Required<Props> = { a: 5 }; 
      // Property 'b' is missing in type '{ a: number; }' but required in type 'Required<Props>'.
      ```
  3. Readonly<Type> 
    用于将`泛型Type`的各个属性转化成只读属性。
    源码:
      ```typescript
      type Readonly<T> = { readonly [P in keyof T]: T[P]; }
      ```
      示例:
      ```typescript
      interface Todo {
        title: string;
      }

      const todo: Readonly<Todo> = {
        title: "Delete inactive users",
      };

      todo.title = "Hello";
      // Cannot assign to 'title' because it is a read-only property.
      ```
  4. Record<Keys,Type> 
    用`泛型Type`类型构建`key`为`Keys`的对象类型，也就是说构建出来的对象类型的属性`key`为`keys`的值，而属性对应的类型为`Type`类型。
    源码:
      ```typescript
      type Record<K extends string | number | symbol, T> = { [P in K]: T; }
      ```
      示例:
      ```typescript
      interface CatInfo {
        age: number;
        breed: string;
      }
      type CatName = "miffy" | "boris" | "mordred";

      const cats: Record<CatName, CatInfo> = {
        miffy: { age: 10, breed: "Persian" },
        boris: { age: 5, breed: "Maine Coon" },
        mordred: { age: 16, breed: "British Shorthair" },
      };
      ```
  5. Pick<Type, Keys> 
    从`泛型Type`中提取属性为`Keys`的部分。
    源码:
      ```typescript
      type Pick<T, K extends keyof T> = { [P in K]: T[P]; }
      ```
      示例:
      ```typescript
      export interface FormSchema {
        label?: string
        prop: string
        type: string
        options?: Array<{label: any, value: any}>
      }
      type Schema = Pick<FormSchema, 'prop' | 'options'>
      /**
      * 
      * 
      * type Schema = {
      *  prop: string;
      *  options?: {
      *      label: any;
      *      value: any;
      *    }[] | undefined;
      *  }
      */
      ```
  6. Omit<Type, Keys> 
    从`泛型Type`中移除`Keys`，生成新的的类型。
    源码:
      ```typescript
      type Omit<T, K extends string | number | symbol> = { [P in Exclude<keyof T, K>]: T[P]; }
      ```
      示例:
      ```typescript
      interface Todo {
        title: string;
        description: string;
        completed: boolean;
      }

      type TodoPreview = Omit<Todo, "description">;

      const todo: TodoPreview = {
        title: "Clean room",
        completed: false,
      };
      ```
  7. Exclude<Type, ExcludedUnion> 
    `泛型Type` 和 `ExcludedUnion` 都为联合类型，作用是去除 `T` 类型和 `U` 类型的交集。
    源码:
      ```typescript
      type Exclude<T, U> = T extends U ? never : T
      ```
      示例:
      ```typescript
      type T1 = Exclude<"a" | "b" | "c", "a" | "b">;
      //    ^ = type T1 = "c"
      type T2 = Exclude<string | number | (() => void), Function>;
      //    ^ = type T2 = string | number
      ```
  8. Extract<Type, Union> 
    和`Exclude`相反，只保留 `T` 类型和 `U` 类型的交集。
    源码:
      ```typescript
      type Extract<T, U> = T extends U ? T : never
      ```
      示例:
      ```typescript
      type T0 = Extract<"a" | "b" | "c", "a" | "f">;
      //    ^ = type T0 = "a"
      type T1 = Extract<string | number | (() => void), Function>;
      //    ^ = type T1 = () => void
      ```
  9. ReturnType<Type> 
    获取`泛型Type函数`的`返回类型`。
    源码:
      ```typescript
      type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any
      ```
      示例:
      ```typescript
      type T0 = ReturnType<() => string>;
      //    ^ = type T0 = string
      type T1 = ReturnType<(s: string) => void>;
      //    ^ = type T1 = void
      ```

### 其他
#### 1. 装饰器
  1. 装饰器 是一种设计模式，它在 `es` / `ts` 中的实现是 使用` @XX` 的语法对 `class` 及 `class` 中的 `属性` 和 `方法` 进行一种装饰。

      我们开发中，目前使用的 `vue2.x` 中 `ts` 的使用就是基于 `class` 语法和 相关装饰器实现的。如下 `vue` 代码：
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

      也可以通过自定义装饰器，创建自己的装饰器。如下的 `loading` 装饰器 和 `log` 装饰器。
      ```typescript
      import { createDecorator } from 'vue-class-component'
      import { Loading } from 'element-ui'

      export const DecLoading = (target: string) => {
        return createDecorator((options: any, key) => {
          const orginalMethod = (options.methods as any)[key]

          options.methods[key] = async function wrapperMethod(...args: any) {
            const loadingIns = Loading.service({ target })
            await orginalMethod.apply(this, args)
            loadingIns.close()
          }
        })
      }

      @Component
      export default class Page extends Vue {
        @DecLoading('.page-wrap')
        public async getData() {
          // 请求数据
        }
      }
      ```

  2. 为什么不能在函数上使用装饰器： 因为存在`函数提升`。类是不会提升的，所以就没有这方面的问题。
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
  1. `declare` 是 `ts` 中的关键字，用于声明变量、方法等，主要是为了用于提供 `js` 文件或三方库 的类型声明。
    通常会在 `xxx.d.ts` 文件中使用，因为该文件不会被编译器编译成 `js` 代码。
      &nbsp;
    在 `package.json` 中会使用 `type` 字段去标识当前包的类型声明文件，从而向使用者提供相应的代码补全、提示等功能。
    在编译 `ts` 文件的过程中，也可以通过配置 `tsconfig.json` 文件 生成相应的声明文件。

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
  
  2. 三重斜线指令
  使用`三重斜线指令`可以将声明文件引进 `ts` 文件中。
      ```typescript
      /// <reference path="./jquery.d.ts" />
      ```

#### 3. 命名空间
  命名空间和模块的功能类似：主要是为了防止代码冲突。但与`模块`不同的是，同个 `ts` 文件中可以有多个命名空间，而`模块`则是基于文件的，也就是说，它们的粒度是不同的。
  ```typescript
  namespace NameA {
    interface A {
      name: string
    }
    export function foo(a: A) {
      console.log(a.name)
    }
  }

  NameA.foo({name: '123'}) // -> '123'
  ```

  命名空间其实就是用`自执行函数IFFE`实现的，看以下编译后的代码。
  ```javascript
  var NameA;
  (function (NameA) {
    function foo(a) {
      console.log(a.name);
    }
    NameA.foo = foo;
  })(NameA || (NameA = {}));
  NameA.foo({ name: '123' });
  ```

#### 4. tsconfig.json 配置
  类似于前端其他工具，比如 `webpack 、eslint 、babel` 等，虽然可以通过 `cli` 程序指定具体的文件进行相关操作。但通常工程化的项目中，会采用配置文件来代替手工 `cli` 输入。`ts` 的相关配置文件为 `tsconfig.json` 下面简单说说常用的属性：
  ```javascript
  {
    "compilerOptions": { // 这个下面是有关编译选项的配置。
      "target": "esnext", // 目标语言版本 -> 就是编译后生成的 js 版本。
      "module": "esnext", // 目标代码的模块标准：esnext 为ES模块。
      "strict": true,     // 用于指定是否启动所有类型检查， 比如 noImplicitAny：为 true 时，如果没有明确设置类型(函数参数等)就会报错。
      "jsx": "preserve",  // 用于开启 jsx
      "importHelpers": true, // 指定是否引入tslib里的辅助工具函数
      "moduleResolution": "node",  // 模块解析规则
      "experimentalDecorators": true, // 开启装饰器语法，因为装饰器在ES标准中并没有完善，只是个实验特性，所以需要开启才能使用。
      "esModuleInterop": true,  // 通过导入内容创建命名空间，实现CommonJS和ES模块之间的互操作性
      "allowSyntheticDefaultImports": true, // 用来指定允许从没有默认导出的模块中默认导入
      "sourceMap": true, //  用来指定编译时是否生成.map文件
      "baseUrl": ".", // 用于设置解析非相对模块名称的基本目录，相对模块不会受到baseUrl的影响
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
  注意：`tsc` 和 `babel` 类似，都是只转化语法 （也就是像箭头函数，`let，const` 等），而不会转化新 api （比如：`Promise Map Array.find` 等）。要想在 低版本浏览器 中使用这些新 api 就需要引入 `core-js` 等库。

## typescript 探讨
###  ts 本质
    ts 本质上就是 js 的超集，也就是说 ts = js + 类型。
###  为什么要使用
    规避常见类型错误、更好的 IDE 提示、更易于重构等。
###  如何正确使用
    灵活应用类型推戴和类型断言。
    ······


## 参考资源
  [官方文档](https://www.typescriptlang.org/docs/handbook/) 
  [深入理解 TypeScript](https://jkchao.github.io/typescript-book-chinese/#why)
  [TypeScript 高级用法](https://zhuanlan.zhihu.com/p/350033675)
  [一文读懂 TS 中 Object, object, {} 类型之间的区别](http://www.semlinker.com/ts-object-type/)
  [TypeScript中的never类型具体有什么用？](https://www.zhihu.com/question/354601204/answer/888551021)
  [TypeScript类型元编程：实现8位数的算术运算](https://zhuanlan.zhihu.com/p/85655537)
  [tsconfig.json配置详解](https://segmentfault.com/a/1190000021749847)



  
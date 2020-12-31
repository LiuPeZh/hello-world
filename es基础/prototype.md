## 原型
原型是一种特殊的对象，它向由它关联的构造函数创建的对象提供了共享的属性。
  特性:
    - 1. 对原型对象属性的添加或修改，对于由它关联的构造函数创建的对象，是立即可见的。
    - 2. 对对象属性赋值时，会遮盖它原型上定义的同名属性的值。
    - 3. 访问对象属性时，如果自身没有，而原型上有，则会返回原型对象上的值（原型链）。
  获取原型：
    通过构造函数的prototype属性，通过实例对象的__proto__属性（该属性不是标准）或Objet.getPrototypeOf函数。
  作用：
    用于共享属性（主要用于继承）。

![avatar](https://github.com/LiuPeZh/hello-world/tree/es-foundation/es%E5%9F%BA%E7%A1%80/prototype.png)

原型只要理解了这张图基本就全理解了。。

prototype 用来实现基于原型的继承和属性共享
__proto__ 构成原型链，用于实现基于原型的继承。指向创建这个对象的prototype。在es6中新增Object.getPrototypeOf(obj)用于代替 __proto__ 非标准方法。

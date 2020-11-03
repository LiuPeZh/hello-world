## 1. vuex是如何注入到vue中的（Vue.use(Vuex)调用时发生了什么）?
```javascript
// src/store.js
let Vue // bind on install
export function install (_Vue) {
  if (Vue && _Vue === Vue) { // 避免重复安装
    if (__DEV__) {
      console.error(
        '[vuex] already installed. Vue.use(Vuex) should be called only once.'
      )
    }
    return
  }
  Vue = _Vue
  applyMixin(Vue)
}
```
appalyMixin方法
```javascript
// src/mixin.js
export default function (Vue) {
  // ... 判断vue版本，mixin是vue2.x中的方法，vue1.0版本是重写init方法来实现注入。
  Vue.mixin({ beforeCreate: vuexInit })
  // 将store实例注入到每个组件中。
  function vuexInit () {
    const options = this.$options
    // store injection
    if (options.store) { // root节点组件的注入
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) { // 非root节点组件的注入
      this.$store = options.parent.$store
    }
  }
}
```
## 2. new Vuex.store(opt)的流程。
```javascript
  constructor (options = {}) {
    // ... 用于自动安装Vuex 以及 判断环境（Vue，Promise，以及stroe单例）。
    // assert(this instanceof Store, `store must be called with the new operator.`)
    const {
      plugins = [],
      strict = false
    } = options

    // 存储内部状态
    this._committing = false // commit标志位，用于判断state的变化是否是由commit触发的。
    this._actions = Object.create(null) // actions集合
    this._actionSubscribers = [] // actions订阅数组
    this._mutations = Object.create(null) // mutations集合
    this._wrappedGetters = Object.create(null)
    this._modules = new ModuleCollection(options) // 创建模块
    this._modulesNamespaceMap = Object.create(null)
    this._subscribers = []
    this._watcherVM = new Vue()
    this._makeLocalGettersCache = Object.create(null)

    // 利用闭包，将dispatch和commit方法绑定到自身实例上。
    const store = this
    const { dispatch, commit } = this
    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload, options) {
      return commit.call(store, type, payload, options)
    }

    // strict mode
    this.strict = strict

    const state = this._modules.root.state

    // 安装模块，内部会递归调用来安装每一个子模块。
    installModule(this, state, [], this._modules.root)

    // 初始化该stroe实例的vm
    resetStoreVM(this, state)

    // 绑定插件
    plugins.forEach(plugin => plugin(this))
    // 浏览器的vue devtool插件。
    const useDevtools = options.devtools !== undefined ? options.devtools : Vue.config.devtools
    if (useDevtools) {
      devtoolPlugin(this)
    }
  }
```
## 3. 模块的实现 new ModuleCollection(options)
```javascript
// src/module/module-collection.js
class ModuleCollection {
  constructor (rawRootModule) {
    // register root module (Vuex.Store options)
    this.register([], rawRootModule, false)
  }
  register (path, rawModule, runtime = true) {
    if (__DEV__) {
      assertRawModule(path, rawModule)
    }

    const newModule = new Module(rawModule, runtime)
    if (path.length === 0) {
      this.root = newModule
    } else {
      const parent = this.get(path.slice(0, -1))
      parent.addChild(path[path.length - 1], newModule)
    }

    // register nested modules
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(path.concat(key), rawChildModule, runtime)
      })
    }
  }
}
```
## 4. 调用dispatch和commit时的原理。
## 5. 组件绑定的辅助
## 6. 其他
#### 1. Array.prototype.reduce方法
1. 将数组按照一定的规则整合成一个值（累计，拼接字符串，转对象）。
2. 按照路径在树型结构中查找数据。

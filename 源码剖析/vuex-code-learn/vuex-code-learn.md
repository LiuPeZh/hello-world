## 1. vuex的安装（Vue.use(Vuex)?
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
// src/mixin.js
export class Store {
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
  // getter 获取store.state时相当获取store.vm._data.$$state
  get state () {
    return this._vm._data.$$state
  }

  set state (v) {
    if (__DEV__) {
      assert(false, `use store.replaceState() to explicit replace store state.`)
    }
  }
}
```
### 2-1. 模块的实现
<details>
<summary>new ModuleCollection(options)</summary>

模块在vuex中是很重要的一部分。因为采用了单一状态树模型，所以在状态较多的时候，代码层面就显得很复杂。通过模块化可以解决这个问题。而它的模块实质就是一颗树的结构。
在vuex中，是通过ModuleCollection类来管理模块的。
```javascript
// src/store.js
class ModuleCollection {
  constructor (rawRootModule) {
    // register root module (Vuex.Store options) 注册根模块
    this.register([], rawRootModule, false)
  }
  register (path, rawModule, runtime = true) { // path 路径， rawModule 原始的配置项，runtime运行时。
    if (__DEV__) {
      assertRawModule(path, rawModule)
    }

    const newModule = new Module(rawModule, runtime)
    if (path.length === 0) { // 通过path来判断是否为根模块
      this.root = newModule
    } else {
      const parent = this.get(path.slice(0, -1))
      parent.addChild(path[path.length - 1], newModule)
    }

    // register nested modules 注册嵌套模块
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(path.concat(key), rawChildModule, runtime)
      })
    }
  }
}
```
在register方法中内部维护了一个path路径变量，这种方式在vuex源码的其他部分也常用到。
然后具体来看一下Module类的实现。这个类提供了当前模块对子模块的增删改查的操作，以及对子模块和当前模块的getter、actions、mutation遍历的方法。
```javascript
// src/module/module.js
export default class Module {
  constructor (rawModule, runtime) {
    this.runtime = runtime
    // Store some children item
    this._children = Object.create(null)
    // Store the origin module object which passed by programmer
    this._rawModule = rawModule
    const rawState = rawModule.state

    // Store the origin module's state
    this.state = (typeof rawState === 'function' ? rawState() : rawState) || {}
  }
  
  get namespaced () {
    return !!this._rawModule.namespaced
  }

  addChild (key, module) {
    this._children[key] = module
  }

  removeChild (key) {
    delete this._children[key]
  }

  getChild (key) {
    return this._children[key]
  }

  hasChild (key) {
    return key in this._children
  }
  update (rawModule) {
    this._rawModule.namespaced = rawModule.namespaced
    if (rawModule.actions) {
      this._rawModule.actions = rawModule.actions
    }
    if (rawModule.mutations) {
      this._rawModule.mutations = rawModule.mutations
    }
    if (rawModule.getters) {
      this._rawModule.getters = rawModule.getters
    }
  }

  forEachChild (fn) {
    forEachValue(this._children, fn)
  }

  forEachGetter (fn) {
    if (this._rawModule.getters) {
      forEachValue(this._rawModule.getters, fn)
    }
  }

  forEachAction (fn) {
    if (this._rawModule.actions) {
      forEachValue(this._rawModule.actions, fn)
    }
  }

  forEachMutation (fn) {
    if (this._rawModule.mutations) {
      forEachValue(this._rawModule.mutations, fn)
    }
  }
}
```
</details>

### 2-2. dispatch和commit的实现
<details>
<summary>dispatch和commit</summary>

```javascript
// src/store.js
export class Store {

  // ......

  commit (_type, _payload, _options) {
    // check object-style commit
    const {
      type,
      payload,
      options
    } = unifyObjectStyle(_type, _payload, _options)

    const mutation = { type, payload }
    const entry = this._mutations[type]
    if (!entry) {
      if (__DEV__) {
        console.error(`[vuex] unknown mutation type: ${type}`)
      }
      return
    }
    this._withCommit(() => {
      entry.forEach(function commitIterator (handler) {
        handler(payload)
      })
    })

    this._subscribers
      .slice() // shallow copy to prevent iterator invalidation if subscriber synchronously calls unsubscribe
      .forEach(sub => sub(mutation, this.state))

    if (
      __DEV__ &&
      options && options.silent
    ) {
      console.warn(
        `[vuex] mutation type: ${type}. Silent option has been removed. ` +
        'Use the filter functionality in the vue-devtools'
      )
    }
  }

  dispatch (_type, _payload) {
    // check object-style dispatch
    const {
      type,
      payload
    } = unifyObjectStyle(_type, _payload)

    const action = { type, payload }
    const entry = this._actions[type]
    if (!entry) {
      if (__DEV__) {
        console.error(`[vuex] unknown action type: ${type}`)
      }
      return
    }

    try {
      this._actionSubscribers
        .slice() // shallow copy to prevent iterator invalidation if subscriber synchronously calls unsubscribe
        .filter(sub => sub.before)
        .forEach(sub => sub.before(action, this.state))
    } catch (e) {
      if (__DEV__) {
        console.warn(`[vuex] error in before action subscribers: `)
        console.error(e)
      }
    }

    const result = entry.length > 1
      ? Promise.all(entry.map(handler => handler(payload)))
      : entry[0](payload)

    return new Promise((resolve, reject) => {
      result.then(res => {
        try {
          this._actionSubscribers
            .filter(sub => sub.after)
            .forEach(sub => sub.after(action, this.state))
        } catch (e) {
          if (__DEV__) {
            console.warn(`[vuex] error in after action subscribers: `)
            console.error(e)
          }
        }
        resolve(res)
      }, error => {
        try {
          this._actionSubscribers
            .filter(sub => sub.error)
            .forEach(sub => sub.error(action, this.state, error))
        } catch (e) {
          if (__DEV__) {
            console.warn(`[vuex] error in error action subscribers: `)
            console.error(e)
          }
        }
        reject(error)
      })
    })
  }

  // ......

  _withCommit (fn) {
    const committing = this._committing
    this._committing = true
    fn()
    this._committing = committing
  }
}
// Vuex提供了两种风格的dipatch和commit的调用传参：载荷形式(type, payload)和对象形式({ type, payload })。
// 这个方法就是用来处理并统一这两种传参方式。
function unifyObjectStyle (type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload
    payload = type
    type = type.type
  }

  if (__DEV__) {
    assert(typeof type === 'string', `expects string as the type, but found ${typeof type}.`)
  }

  return { type, payload, options }
}
```
</details>

## 3. 安装模块 installModule(this, state, [], this._modules.root)
this：当前Store的实例，state： 根模块的state，[]表示根模块路径， this._modules.root： 根模块 。 与ModuleCollection的register方法一样，都是内部去维护这个path路径变量。
```javascript
// src/store.js
function installModule (store, rootState, path, module, hot) {
  const isRoot = !path.length
  const namespace = store._modules.getNamespace(path) // 获取当前模块的命名空间。是一个由/分割的字符串。

  // register in namespace map
  if (module.namespaced) { // 如果该模块开启了命名空间，那么就通过对象将该具有该命名空间的模块存起来，方便后续的使用。
    if (store._modulesNamespaceMap[namespace] && __DEV__) {
      console.error(`[vuex] duplicate namespace ${namespace} for the namespaced module ${path.join('/')}`)
    }
    store._modulesNamespaceMap[namespace] = module
  }

  // set state
  if (!isRoot && !hot) {
    const parentState = getNestedState(rootState, path.slice(0, -1)) // 获取当前模块的父模块的state
    const moduleName = path[path.length - 1] // 模块的名称
    store._withCommit(() => {
      if (__DEV__) {
        if (moduleName in parentState) {
          console.warn(
            `[vuex] state field "${moduleName}" was overridden by a module with the same name at "${path.join('.')}"`
          )
        }
      }
      // 通过Vue.set方法向父模块的state对象中添加key为当前模块名称，值为当前模块state的对象。
      Vue.set(parentState, moduleName, module.state) 
    })
  }
  // 创建局部上下文环境
  const local = module.context = makeLocalContext(store, namespace, path)

  module.forEachMutation((mutation, key) => {
    const namespacedType = namespace + key
    registerMutation(store, namespacedType, mutation, local)
  })

  module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    registerAction(store, type, handler, local)
  })

  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })
  // 递归安装每一个子模块。
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}
function registerMutation (store, type, handler, local) {
  const entry = store._mutations[type] || (store._mutations[type] = [])
  entry.push(function wrappedMutationHandler (payload) {
    handler.call(store, local.state, payload)
  })
}

function registerAction (store, type, handler, local) {
  const entry = store._actions[type] || (store._actions[type] = [])
  entry.push(function wrappedActionHandler (payload) {
    let res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload)
    if (!isPromise(res)) {
      res = Promise.resolve(res)
    }
    if (store._devtoolHook) {
      return res.catch(err => {
        store._devtoolHook.emit('vuex:error', err)
        throw err
      })
    } else {
      return res
    }
  })
}

function registerGetter (store, type, rawGetter, local) {
  if (store._wrappedGetters[type]) {
    if (__DEV__) {
      console.error(`[vuex] duplicate getter key: ${type}`)
    }
    return
  }
  store._wrappedGetters[type] = function wrappedGetter (store) {
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  }
}
```
在不开启命名空间的情况下，commit和dispatch会触发所有全局的mutation和action，
再创建完局部上下文环境后， 接下来会去注册当前模块下的getters、mutations和actions。
然后再来看下makeLocalContext函数的实现。我们可以在定义mutation函数时第一个参数可以拿到state对象，而在定义action函数时通过第一个参数拿到context。
<details>
<summary>const local = module.context = makeLocalContext(store, namespace, path)</summary>

```javascript
// src/store.js
/**
 * make localized dispatch, commit, getters and state
 * if there is no namespace, just use root ones
 * @param { Stroe } store
 * @param { String } namespace
 * @param { String[] } path
 * @return local object
 */
function makeLocalContext (store, namespace, path) {
  const noNamespace = namespace === ''
  // 保存dispatch和commit方法。如果有命名空间，那么会重写store.dispatch方法。
  const local = {
    dispatch: noNamespace ? store.dispatch : (_type, _payload, _options) => {
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args

      if (!options || !options.root) { // 如果传了第三个参数，那么就跳过 type的拼接，直接分发根模块的 action
        type = namespace + type
        if (__DEV__ && !store._actions[type]) {
          console.error(`[vuex] unknown local action type: ${args.type}, global type: ${type}`)
          return
        }
      }

      return store.dispatch(type, payload)
    },

    commit: noNamespace ? store.commit : (_type, _payload, _options) => {
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args

      if (!options || !options.root) { // 如果传了第三个参数，那么就跳过 type的拼接，直接分发根模块的 mutation
        type = namespace + type
        if (__DEV__ && !store._mutations[type]) {
          console.error(`[vuex] unknown local mutation type: ${args.type}, global type: ${type}`)
          return
        }
      }

      store.commit(type, payload, options)
    }
  }

  // getters and state object must be gotten lazily
  // because they will be changed by vm update
  // 通过懒加载的方式定义local的state和getters
  Object.defineProperties(local, {
    getters: {
      get: noNamespace
        ? () => store.getters
        : () => makeLocalGetters(store, namespace)
    },
    state: {
      get: () => getNestedState(store.state, path)
    }
  })

  return local
}
```
</details>

## 4. 初始化Vue实例 resetStoreVM(this, state), 通过将state挂到vm的data上来实现响应式数据。
```javascript
// src/store.js'
function resetStoreVM (store, state, hot) {
  const oldVm = store._vm

  // bind store public getters
  store.getters = {}
  // reset local getters cache
  store._makeLocalGettersCache = Object.create(null)
  const wrappedGetters = store._wrappedGetters
  const computed = {}
  forEachValue(wrappedGetters, (fn, key) => {
    // use computed to leverage its lazy-caching mechanism
    // direct inline function use will lead to closure preserving oldVm.
    // using partial to return function with only arguments preserved in closure environment.
    computed[key] = partial(fn, store)
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // for local getters
    })
  })

  // 用一个vue实例来存储state
  // 禁用vue的警告和错误日志
  const silent = Vue.config.silent
  Vue.config.silent = true
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  Vue.config.silent = silent

  // enable strict mode for new vm
  if (store.strict) {
    enableStrictMode(store)
  }

  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(() => {
        oldVm._data.$$state = null
      })
    }
    Vue.nextTick(() => oldVm.$destroy())
  }
}
// vuex中，如果开启严格模式，那么在非mutation中对state中值的修改会触发抛出错误。
// 激活严格模式。不难发现其是通过vm的$watch来深度同步监听state中的值的变化，如果当前store._committing为false 那么就会抛出错误。而通过_withCommit方法包装执行的函数，会在内部将store._committing设置为true，修改完后再变为原来的状态，这种方式避免抛出错误。
function enableStrictMode (store) {
  store._vm.$watch(function () { return this._data.$$state }, () => {
    if (__DEV__) {
      assert(store._committing, `do not mutate vuex store state outside mutation handlers.`)
    }
  }, { deep: true, sync: true })
}
```
从本质上来说vuex就是一个vue组件，只不过这个组件没有template、render等属性。通过将state挂载到vm的data上，将getter挂载到vm的computed，来实现响应式的数据。从设计上来看getter是依赖state的，因此在该vm中和state分别对应到computed和data上。

## 5. 辅助函数
## 6. 其他
#### 1. Array.prototype.reduce方法
1. 将数组按照一定的规则整合成一个值（累计，拼接字符串，转对象）。
2. 按照路径在树型结构中查找数据。

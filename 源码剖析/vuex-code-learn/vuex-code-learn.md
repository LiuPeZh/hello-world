通常当我们需要在多个组件中共享状态的时候（组件间的通信），一般会采用这几种方式：
1. 通过props和$emit，$attrs和$listeners，provide和inject
2. 使用事件总线 event bus
3. 通过Vue.observable
4. 通过vuex。
在组件嵌套较多的情况下，1和2这种方式会使得代码很复杂，难以对数据的流向进行预测及调试。3虽然可以很轻量的创建响应式的数据，但如果没有对状态操作的封装，也会使得代码变乱。
而vuex是vue官方专为vue打造的状态管理工具。它提供了一套规范性的状态管理，使得状态都集中在一块，同时也使得状态的变化可以被跟踪（因为只能通过提交mutation的时候才能改变状态），从而能方便开发时的调试，代码的可读性也会提高。所以在规模较大、需要共享的状态较多的项目中，使用vuex能够很好的帮我们去调试及组织代码。

![vuex的数据流](https://github.com/LiuPeZh/hello-world/blob/master/%E6%BA%90%E7%A0%81%E5%89%96%E6%9E%90/vuex-code-learn/img/vuex-flow.png?raw=true)
vuex的数据流模型是这样的：从vue组件中dispatch（分发）了一个action后，在这个action中可能会去异步的调用后端接口获取数据或者去进行了某个操作，然后它会commit（提交）了一个mutation，在mutation内部会去修改state（状态）中的某个属性，因为state是响应式的，所以它的变化会引起vue组件的更新，从而展示新的内容。

接下来看下vuex具体的实现。
## 1. vuex的安装( Vue.use(Vuex) )
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
/**
 *  new Vue({
 *    el: '#app',
 *    store,
 *    render: h => h(App)
 *  })
*/
export default function (Vue) {
  // 判断vue版本，mixin是vue2.x中的方法，vue1.0版本是重写init方法来实现注入。
  const version = Number(Vue.version.split('.')[0])
  if (version >= 2) {
    Vue.mixin({ beforeCreate: vuexInit })
  } else {
    const _init = Vue.prototype._init
    Vue.prototype._init = function (options = {}) {
      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit
      _init.call(this, options)
    }
  }
  // 将store实例注入到每个组件中。
  function vuexInit () {
    const options = this.$options
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
vuex的安装是通过全局混入beforeCreate钩子函数来进行的，在vue中作为被混入的生命周期函数，它是不会被覆盖，而是会按混入的顺序依次去执行。在root组件中直接挂载$store，在非root组件中挂载的则是父组件的$store，因为父子组件的生命周期触发是 父beforeCreate --> 子berforeCreate 这样的顺序去触发的，最终通过层层的挂载$store，使得每个组件中都可以访问到，同时它们也都同一个对象。
## 2. new Vuex.store(opt)的流程。
Store实例的创建可分为这几个部分，
  1. 环境判断; 
  2. 初始化内部状态; 
  3. 创建module集合; 
  4. 绑定dispatch和commit方法;
  5. 安装module;
  6. 初始化vue实例;
```javascript
new Vuex.Store({
  state: {
    // ... 定义状态 
  },
  getters: {
    // ... 定义getter
  },
  actions: {
    // ... 定义actions函数
  },
  mutations: {
    // ... 定义mutations函数
  }
})
```
```javascript
// src/mixin.js
export class Store {
  constructor (options = {}) {
    // ... 用于自动安装Vuex 以及 判断环境（Vue，Promise，以及是否是通过new的方式调用）。
    if (!Vue && typeof window !== 'undefined' && window.Vue) {
      install(window.Vue)
    }
    debugger
    if (__DEV__) {
      assert(Vue, `must call Vue.use(Vuex) before creating a store instance.`)
      assert(typeof Promise !== 'undefined', `vuex requires a Promise polyfill in this browser.`)
      assert(this instanceof Store, `store must be called with the new operator.`)
    }

    const {
      plugins = [],
      strict = false
    } = options

    // 初始化内部状态
    this._committing = false // commit标志位，用于判断state的变化是否是由commit触发的。
    this._actions = Object.create(null) // actions集合
    this._actionSubscribers = []
    this._mutations = Object.create(null) // mutations集合
    this._wrappedGetters = Object.create(null) // getter 集合
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

模块在vuex中是很重要的一部分。因为采用了单一状态树模型，所以在状态较多的时候，所有状态及操作都写在一块时代码层面就显得很复杂。通过模块化可以解决这个问题，因为这样就能在各自的模块中去提交（commit）和分发（dispatch）各自的状态。
在vuex中，是通过ModuleCollection类来管理模块的（模块的注册和创建）。
```javascript
// src/store.js
class ModuleCollection {
  // rawRootModule 是原始配置项
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
      const parent = this.get(path.slice(0, -1)) // 找到父模块实例
      parent.addChild(path[path.length - 1], newModule) // 调用父模块实例的addChild方法将当前模块添加到父模块的内部_children对象上。
    }

    // register nested modules 注册嵌套模块
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(path.concat(key), rawChildModule, runtime) // 递归调用 注册子模块
      })
    }
  }
  getNamespace (path) {
    let module = this.root
    return path.reduce((namespace, key) => {
      module = module.getChild(key)
      return namespace + (module.namespaced ? key + '/' : '')
    }, '')
  }
}
```
在register方法中内部维护了一个path路径变量，这种方式在vuex源码的其他部分也常用到。它会用于判断是否为root模块及通过path找到相应的模块。
然后具体来看一下Module类的实现。这个类提供了当前模块对子模块的增删查的操作及对自身改的操作，以及对子模块、当前模块的getter、actions、mutation遍历的方法。
```javascript
// src/module/module.js
export default class Module {
  // rawModule 原始的配置项（和上述的rawRootModule有些区别，它可能是root部分的也可能是子模块部分的）
  constructor (rawModule, runtime) {
    this.runtime = runtime
    this._children = Object.create(null)
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
![modules](https://github.com/LiuPeZh/hello-world/blob/master/%E6%BA%90%E7%A0%81%E5%89%96%E6%9E%90/vuex-code-learn/img/module-collection-ins.png?raw=true)

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
  // 在该方法内 将标志位_committing设置为true 然后再调用了传进来的函数，最后又将_committing复位。主要用于确保再严格模式下，状态的修改只能再mutation中进行。后续初始化vue实例的方法中会说明为什么这样就能确保。
  _withCommit (fn) {
    const committing = this._committing
    this._committing = true
    fn()
    this._committing = committing
  }
}
// Vuex提供了两种风格的dipatch和commit的调用传参：载荷形式(type, payload)和对象形式({ type, payload })。
// 这个方法就是用来将这两种传参方式做统一处理为对象风格的。
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
两个方法的基本流程相同，都是，1.格式化参数；2.拿到格式化后的type和payload；3然后通过type获取响应的actions和mutations函数数组；4.调用；5.触发订阅的内容；在最后dispatch还会返回一个Promise对象，用来组合actions。
调用的不同点在于，commit中相应mutations的调用是通过_withCommit包装后的，而dispatch中相应actions的调用是通过Promise.all方法的。
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

  // 在不开启命名空间的情况下，commit和dispatch会触发所有全局的mutation和action，这样使得多个模块能够对同一 mutation 或 action 作出响应。当开启命名空间后getter、action 及 mutation 都会自动根据模块注册的路径调整命名。
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
function getNestedState (state, path) {
  return path.reduce((state, key) => state[key], state)
}
function registerMutation (store, type, handler, local) {
  // 在Store实例的_mutations对象上去获取key为type的函数数组， 如果不存在在赋值一个空数组
  const entry = store._mutations[type] || (store._mutations[type] = []) 
  entry.push(function wrappedMutationHandler (payload) {
    // 使用call绑定store调用，第一个参数是局部的state。
    /**
     *  increment (state, payload) {
     *    state.count += payload
     *  }
     */
    handler.call(store, local.state, payload)
  })
}

function registerAction (store, type, handler, local) {
  const entry = store._actions[type] || (store._actions[type] = [])
  entry.push(function wrappedActionHandler (payload) {
    // 使用call绑定store调用，第一个参数是一个具有多个属性的context。
    /**
     *  increment (context) {
     *    context.commit('increment')
     *  }
      */
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
  // 与mutations和actions的存储不同，getter不会被多个同类型的给覆盖。
  /**
   *  doneTodos: state => {
   *    return state.todos.filter(todo => todo.done)
   *  }
   */
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

在getter、mutations和actions中定义的函数第一个参数可以拿到局部的状态或上下文环境，这个局部的上下文环境主要是由makeLocalContext函数来实现的。
<details>
<summary>const local = module.context = makeLocalContext(store, namespace, path)</summary>

```javascript
// src/store.js
/**
 * make localized dispatch, commit, getters and state
 * if there is no namespace, just use root ones
 * @param { Stroe } store store实例
 * @param { String } namespace 命名空间
 * @param { String[] } path 模块的路径
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
function makeLocalGetters (store, namespace) {
  if (!store._makeLocalGettersCache[namespace]) {
    const gettersProxy = {}
    const splitPos = namespace.length
    Object.keys(store.getters).forEach(type => {
      // skip if the target getter is not match this namespace
      if (type.slice(0, splitPos) !== namespace) return

      // extract local getter type
      const localType = type.slice(splitPos)

      // Add a port to the getters proxy.
      // Define as getter property because
      // we do not want to evaluate the getters in this time.
      Object.defineProperty(gettersProxy, localType, {
        get: () => store.getters[type],
        enumerable: true
      })
    })
    store._makeLocalGettersCache[namespace] = gettersProxy
  }

  return store._makeLocalGettersCache[namespace]
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
      // 将之前的state置空
      store._withCommit(() => {
        oldVm._data.$$state = null
      })
    }
    // 销毁之前的vue实例
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
辅助函数能帮我们在组件中使用vuex时简洁方便一些。vuex提供了5个辅助函数分别是：mapState、mapGetters、mapActions、mapMutations、createNamespacedHelpers。其中前4个方法中的流程基本一致，都是： 1. 创建空对象res；2. 判断要映射到vue组件上的属性名数组或方法名数组（下文简称map）是否和法；3. 格式化map；4. 遍历格式化后的对象数组将属性名或方法名存储到res上；5. 返回res。

```javascript
// src/helper.js
import { isObject } from './util'

/**
 * 格式化数组或对象 输出一个对象数组。
 * normalizeMap([1, 2, 3]) => [ { key: 1, val: 1 }, { key: 2, val: 2 }, { key: 3, val: 3 } ]
 * normalizeMap({a: 1, b: 2, c: 3}) => [ { key: 'a', val: 1 }, { key: 'b', val: 2 }, { key: 'c', val: 3 } ]
 * @param {Array|Object} map
 * @return {Object}
 */
function normalizeMap (map) {
  if (!isValidMap(map)) {
    return []
  }
  return Array.isArray(map)
    ? map.map(key => ({ key, val: key }))
    : Object.keys(map).map(key => ({ key, val: map[key] }))
}

/**
 * Validate whether given map is valid or not
 * @param {*} map
 * @return {Boolean}
 */
function isValidMap (map) {
  return Array.isArray(map) || isObject(map)
}

/**
 * 返回一个函数，这个函数具有两个参数，第一个是命名空间，第二个是要映射的数组。它的内部会将传参进行处理，
 * ('模块名', [...])  或者 ([...]) 
 * @param {Function} fn
 * @return {Function}
 */
function normalizeNamespace (fn) {
  return (namespace, map) => {
    if (typeof namespace !== 'string') {
      map = namespace
      namespace = ''
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/'
    }
    return fn(namespace, map)
  }
}

/**
 * 在installModule的方法中，会按命名空间（如果开启了命名空间）将模块存储到_modulesNamespaceMap对象中。
 * 这个方法就是借助_modulesNamespaceMap对象来查找模块的。
 * @param {Object} store
 * @param {String} helper
 * @param {String} namespace
 * @return {Object}
 */
function getModuleByNamespace (store, helper, namespace) {
  const module = store._modulesNamespaceMap[namespace]
  if (__DEV__ && !module) {
    console.error(`[vuex] module namespace not found in ${helper}(): ${namespace}`)
  }
  return module
}

/**
 * Vue中的使用 三种例子
 *  computed: mapState({
 *    count: state => state.count,
 *  })
 *  computed: mapState([
 *    'count',
 *  ])
 *  computed: mapState('some/nested/module', [
 *    'a',
 *  ])
 * Reduce the code which written in Vue.js for getting the state.
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} states # Object's item can be a function which accept state and getters for param, you can do something for state and getters in it.
 * @param {Object}
 */
export const mapState = normalizeNamespace((namespace, states) => {
  const res = {}
  if (__DEV__ && !isValidMap(states)) {
    console.error('[vuex] mapState: mapper parameter must be either an Array or an Object')
  }

  normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState () {
      let state = this.$store.state
      let getters = this.$store.getters
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapState', namespace)
        if (!module) {
          return
        }
        state = module.context.state
        getters = module.context.getters
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    }
    // mark vuex getter for devtools
    res[key].vuex = true
  })
  return res
})

/**
 * Reduce the code which written in Vue.js for committing the mutation
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} mutations # Object's item can be a function which accept `commit` function as the first param, it can accept anthor params. You can commit mutation and do any other things in this function. specially, You need to pass anthor params from the mapped function.
 * @return {Object}
 */
export const mapMutations = normalizeNamespace((namespace, mutations) => {
  const res = {}
  if (__DEV__ && !isValidMap(mutations)) {
    console.error('[vuex] mapMutations: mapper parameter must be either an Array or an Object')
  }
  normalizeMap(mutations).forEach(({ key, val }) => {
    res[key] = function mappedMutation (...args) {
      // Get the commit method from store
      let commit = this.$store.commit
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapMutations', namespace)
        if (!module) {
          return
        }
        commit = module.context.commit
      }
      return typeof val === 'function'
        ? val.apply(this, [commit].concat(args))
        : commit.apply(this.$store, [val].concat(args))
    }
  })
  return res
})

/**
 * Reduce the code which written in Vue.js for getting the getters
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} getters
 * @return {Object}
 */
export const mapGetters = normalizeNamespace((namespace, getters) => {
  const res = {}
  if (__DEV__ && !isValidMap(getters)) {
    console.error('[vuex] mapGetters: mapper parameter must be either an Array or an Object')
  }
  normalizeMap(getters).forEach(({ key, val }) => {
    // The namespace has been mutated by normalizeNamespace
    val = namespace + val
    res[key] = function mappedGetter () {
      if (namespace && !getModuleByNamespace(this.$store, 'mapGetters', namespace)) {
        return
      }
      if (__DEV__ && !(val in this.$store.getters)) {
        console.error(`[vuex] unknown getter: ${val}`)
        return
      }
      return this.$store.getters[val]
    }
    // mark vuex getter for devtools
    res[key].vuex = true
  })
  return res
})

/**
 * Reduce the code which written in Vue.js for dispatch the action
 * @param {String} [namespace] - Module's namespace
 * @param {Object|Array} actions # Object's item can be a function which accept `dispatch` function as the first param, it can accept anthor params. You can dispatch action and do any other things in this function. specially, You need to pass anthor params from the mapped function.
 * @return {Object}
 */
export const mapActions = normalizeNamespace((namespace, actions) => {
  const res = {}
  if (__DEV__ && !isValidMap(actions)) {
    console.error('[vuex] mapActions: mapper parameter must be either an Array or an Object')
  }
  normalizeMap(actions).forEach(({ key, val }) => {
    res[key] = function mappedAction (...args) {
      // get dispatch function from store
      let dispatch = this.$store.dispatch
      if (namespace) {
        const module = getModuleByNamespace(this.$store, 'mapActions', namespace)
        if (!module) {
          return
        }
        dispatch = module.context.dispatch
      }
      return typeof val === 'function'
        ? val.apply(this, [dispatch].concat(args))
        : dispatch.apply(this.$store, [val].concat(args))
    }
  })
  return res
})

/**
 * Rebinding namespace param for mapXXX function in special scoped, and return them by simple object
 * @param {String} namespace
 * @return {Object}
 */
export const createNamespacedHelpers = (namespace) => ({
  mapState: mapState.bind(null, namespace),
  mapGetters: mapGetters.bind(null, namespace),
  mapMutations: mapMutations.bind(null, namespace),
  mapActions: mapActions.bind(null, namespace)
})
```

## 6. 总结
### 1. Array.prototype.reduce方法
1. 将数组按照一定的规则整合成一个值（累计，拼接字符串，转对象）。
2. 按照路径在树型结构中查找数据。
### 2. 函数柯里化
1. 绑定函数的this, 在通过赋值操作的时候确保函数中的this不丢失。
2. 包装函数，统一处理函数的参数及延迟函数执行。
### 3. getter ( Object.defineProperty、class及proxy )
通过getter可以使得取值的步骤延迟到访问属性时。也可以通过这种方式去做一些额外的操作，比如代理某个属性。
### 4. 代码编写层面
遵循单一职责，解耦各个模块。如源码中的ModuleCollection类和Module类，一个是用于管理Module(注册、注销等)，一个是用于Module本身。
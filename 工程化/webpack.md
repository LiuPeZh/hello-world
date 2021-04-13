## webpack

### 5个核心概念
1. entry 入口 
  指定 webpack 应该从哪个模块开始进行构建。通过入口，递归找到所有依赖。
2. output 输出
  指定 webpack 模块输出的路径、名称等。
3. loaders 资源转换器 
  转换非js类型的资源。因为 webpack 只能处理 js 类型文件，所以需要借助 loader 来处理其他资源。
4. plugins 插件
  plugin 用于在 webpack 运行的生命周期的事件中。在合适的时机做合适的功能。
5. mode 模式
  分为开发模式和生产模式


### 其他
1. 3中hash配置作用和区别。
  有 hash、chunkHash 和 contentHash。都是用于去标识打包后输出的文件的。
  hash 是让所有输出的文件都使用同一个hash值。也就是说，如果只有一个文件发生了变化，那么打包后输出的其他文件的hash值也会变化。
  chunkHash 让生成的每一个chunk都具有自己的hash值，可以避免 hash 配置中的问题。
  contentHash 则是用于其他资源的文件，比如 引入了一个css文件，打包后该css的hash是和它相关chunk保持一致，如果设置了 contentHash 那么就可以让该css文件具有自己的hash签名，而不会跟着相关js文件变化。

2. source-map
  eval 打包后的模块都使用 eval() 执行，行映射可能不准；不产生独立的 map 文件
  cheap map只显示行，不显示列。产生独立map文件
  inline 映射文件已base64 格式编码，加在bundle后，不产生独立的map文件
  module 增加对 loader 和 第三方模块的映射
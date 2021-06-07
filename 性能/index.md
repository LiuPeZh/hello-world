性能监控 API Performance对象
### PerformanceEntry对象
#### PerformanceEntry.entryType 类型
1. frame, navigation
  文档加载相关的
  比如 navigation 中就包括：网络到加载的过程中各个时间节点。
2. resource
  资源相关
3. mark
  用于标记，之后可以通过该类型访问。
4. measure
  指定一个测量名，结合mark方法可以计算两个mark之间的时间。
5. paint
  绘制相关：FP ( first-paint ) ：首次绘制像素到屏幕上的时间
  FCP ( first-contentful-paint ) ：首次绘制来自DOM内容的时间。

其他指标:
  FMP ( first-meaning-paint ) ：主要内容绘制到屏幕上的时间。
  LCP ( largest-contentful-content ) ：可是区域中最大的内容元素呈现。
  FSP ( first-screen-paint ) ：页面从加载到首屏内容全部绘制完成的时间。
  


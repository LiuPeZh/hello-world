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
  

## 从哪些方面关注性能
1. 页面是否正常加载 （ FP、FCP ）
2. 加载的内容是否以及足够 （ FMP ）
3. 页面是否可以操作 （ TTI ）
4. 页面是否可以交互，动画是否流畅  （ 耗时长的任务 ）

1. 可以直接通过performance api获取
2. 首先要理解什么是主要内容：常见的可以把图片、视频、动画或者占可视面积较大的视为主要内容，
计算： 获取 FMP元素 、计算 FMP 元素加载时间。
3. TTI: domContentLoadedEventEnd - navigationStart 或者 tti-polyfill
4. 可以通过 Long Tasks API 测量
长任务：任何连续不间断的且主UI线程繁忙50毫秒及以上的时间区间。
```javascript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // TODO...
    console.log(entry);
  }
});

observer.observe({entryTypes: ['longtask']});
```

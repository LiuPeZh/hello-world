#### 这是一篇记录学习vue源码的笔记，主要从大佬的某一篇详细文章

## 从VNode的设计开始
vnode可以说是virtual dom技术的核心，它将
一个设计好的vnode，一方面能很好的表示真实节点，另一方面能极大的提升性能

+ vnode最终设计好的样子
```typescript
{
    tag: string | object | null, // 可以表示标签，组件等
    data: object | null, // 该节点的属性、样式、事件等
    childrens: string | 0object[] | null, // 子节点 或者是文本节点的文本内容
    childrenFlags: symbol, // 子节点的类型标志
    flags: symbol, // 表示该节点的标志，比如普通标签节点、组件、文本节点等等
}
```
+ 抽象
    + 函数 尽可能少的参数：在调用是参数过多会造成不必要的麻烦。同时函数的功能也要尽可能完善。 
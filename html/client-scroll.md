## clientWidth/Height scrollWidth/Height offsetWidth/Height 对比

1. clientWidth 
  表示元素内部宽度，实际计算：内容宽度 + padding。 （不含边框和滚动条宽度）
  clientHeight 与其同理

2. scrollWidth
  表示元素宽度，实际计算：内容宽度（包含由于overflow溢出而不可见的内容） + padding。
  在没有滚动条的情况下，与 clientWidth 的值相同。

3. offsetWidth
  表示元素布局宽度，实际计算：内容宽度 + padding + 左右边框宽度

## offsetTop/Left scrollTop/Left clientTop/Left

1. offsetTop
  当前元素相对于其 offsetParent 元素顶部内边距的距离

2. scrollTop
  当前元素内容顶部到它的可见内容顶部的距离，也就是被卷去的距离。当没有滚动条时，为 0， 也就是说，一个元素没有出现滚动条，那么它的顶部内容和可见内容顶部是一样的，所以为0。

3. clientTop
  当前元素上边框的宽度。

## mouse event： offsetX/Y pageX/Y clientX/Y screenX/Y layerX/Y X/Y

1. offsetX
  距离目标元素的内边距边在 X 轴方向上的偏移距离

2. pageX
  距离页面左边的偏移距离，包含被横向滚动卷去的距离。

3. clientX
  距离页面左边的偏移距离，不包含被横向滚动卷去的距离。 没有滚动条时，clientX 与 pageX 是一致的。

4. screenX
  事件对象距离屏幕左侧的偏移距离。

5. layerX
  相对于当前坐标的值。
  如果触发事件的元素没有被定位，那么以页面为参考点，如果有，则以该元素的边框左上角为参考点。
## 背景
最近，产品提了一个需求，一个元素暴露在用户的页面上就上报数据。听上去还是蛮容易的，说起来就直接撸。

## 思路
判断元素的滚动和视图的展示区域的关系就能判断是否展示在屏幕中了。

## 实现
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b4e6cb7ccdbb45b6be96cf4e791f665b~tplv-k3u1fbpfcp-watermark.image)

首先，补一下基础概念。

如何判断元素展示在页面上呢？
```javascript
 /**
  * @description 判断元素是否在父元素中展示
  * @param childBoxScrollTop {Number} 子元素滚动顶部
  * @param childBoxScrollBottom {Number} 子元素滚动底部
  * @param rootClientHeight {Number} 父元素展示高度
  * @param rootScrollTop {Number} 父元素滚动距离
  * @return {Boolean}
  */
export const checkExpose = (childBoxScrollTop,childBoxScrollBottom,rootClientHeight,rootScrollTop) => {
  if (childBoxScrollBottom < rootScrollTop){
    return false
  }
  if (childBoxScrollTop<rootScrollTop+rootClientHeight){
    return true
  }
  return false
}
```
检测 子元素盒子的滚动顶部和底部 和 父元素展示的视口距离 相关的关系就可以判断了。

现在已经能拿到元素是否展示在视图中了。
接下来 监听父元素滚动，进行元素判断就能拿到了元素的展示情况。
```javascript
root.addEventListener('scroll',(e) => { 
      for (let child of newChildren){
        let expose = checkExpose(child.scrollTop,child.scrollBottom,root.clientHeight,root.scrollTop,root.offsetTop)
        if (child.expose !== expose){
          child.expose = expose
        }
      }
  })
```
大家都知道滚动事件触发的非常多，进行非常多的判断会出现性能问题。所以加一个节流就可以缓解一下这个问题,装一下，自己抛出个自定义事件。
```
  let fn = throttle()
  root.addEventListener('scroll',(e) => {
    fn(() => {
      for (let child of newChildren){
        let expose = checkExpose(child.scrollTop,child.scrollBottom,root.clientHeight,root.scrollTop,root.offsetTop)
        if (child.expose !== expose){
          window.dispatchEvent(new CustomEvent('domExpose',{
            'detail': {
              element: child,
              domExpose: expose
            },
            bubbles: false,
            cancelable: false
          }))
          child.expose = expose
        }
      }
    })
  })
```
在调用的地方进行一个监听
```
window.addEventListener('domExpose',(e) => {
   console.log(e.detail)
})
```
## 结论
到这里，这个功能基本就ok了，当然非常的粗糙，横向判断啊，父元素被隐藏了怎么判断这些问题都是没有考虑的。最后打包，npm，github走一波。
```
yarn add check-dom-expose
```
[github](https://github.com/godj1001/check-dom-expose)
## 最终
产品啊，这个需求不好做，需要两天时间啊

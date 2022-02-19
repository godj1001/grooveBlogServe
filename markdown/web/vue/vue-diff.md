## 背景

在vue中，视图更新的diff算法在面试过程中算是常被问及的一个问题，那么它到底是什么？我们应该怎么回答啊。

## 源码分析

这里我先贴一下diff算法的核心代码

```
... 
// isUndef 判断是否为undefined 
// oldCh 旧节点列表
// newCh 新节点列表
// sameVnode 判断是否是相同的节点，判断key值，标签，data等等东西 
while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
  if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
        
      }
  // 从这里开始 进行新旧开始结束节点的两两判断
  else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        // 兜底逻辑 对当前的新节点进行一个特定查询
        // 获取oldStartIdx和oldEndIdx之间的所有key的map
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
				// 判断新开始节点的key存不存在 
        // 若是存在，则在oldKeyToIdx中找到这个节点
        // 若是不存在，则会在旧的节点中 查找这个节点，复用它
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        } else {
          vnodeToMove = oldCh[idxInOld]
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
            oldCh[idxInOld] = undefined
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
          }
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }
		// 进行列表的最后清理
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(oldCh, oldStartIdx, oldEndIdx)
    }
}
...
```

可能从代码上还是不太直观，我们来用图片来展示一些diff算法是如何工作的。

## 例子

假定现有oldCh：[1,2,3,4,5] newCh[1,3,4]![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3514e995e21e4fd4a882a2b2ca1d96c9~tplv-k3u1fbpfcp-zoom-1.image)![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8dceb38d1a2643a39ab624fce912403f~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8e2b55e7b5a34397bb38157e27749fe4~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eedee470ddea4ee180cbb3e4a63b5894~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8423c36bbd73496883d18d49d1255a39~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/db970be11b274ef09ecd35b0f7e66bfb~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e6c80110efaf43feb04dc1d3f444aadf~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2771cbfef775497484d5b11694109291~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/05b860fd33a54bca852b5bbf16525666~tplv-k3u1fbpfcp-zoom-1.image)

上面是一个简单的例子，里面还是少了很多场景，比如两个节点结束节点匹配，开始和结束之间节点匹配等等。

但是 通过上面的例子也是可以了解diff到底是如何工作的。

## 总结

那么 当面试官问到 讲讲vue的diff算法的时候，应该怎么回答呢？

首先，我们拿到新旧节点的数组，然后初始化四个指针，分别指向新旧节点的开始位置和结束位置，进行两两对比，若是 新的开始节点和旧开始节点相同，则都向后面移动，若是结尾节点相匹配，则都前移指针。若是新开始节点和旧结尾节点匹配上了，则会将旧的结束节点移动到旧的开始节点前。若是旧开始节点和新的结束节点相匹配，则会将旧开始节点移动到旧结束节点的后面。若是上述节点都没配有匹配上，则会进行一个兜底逻辑的判断，判断开始节点是否在旧节点中，若是存在则复用，若是不存在则创建。最终跳出循环，进行裁剪或者新增，若是旧的开始节点小于旧的结束节点，则会删除之间的节点，反之则是新增新的开始节点到新的结束节点。

之前也是对vue的diff算法一知半解，现在对diff算法有了更深刻的理解。

ps: 之前被问过 vue 的diff算法是深度优先遍历还是广度优先算法，从图里是无法的得知的，在patchVnode过程中会调用updateChildren，所以 vue 的diff算法是个深度优先算法。

上述的可能有一些理解错误，欢迎指正和教导。

# react hooks 

react hooks 解决了 react 函数组件没有 state ， 没有生命周期，逻辑不能复用的问题。

## hooks
### 引入hooks的时候发生了什么？

例如 useState, 在react代码中，useState什么样子的呢？
```javascript
export function useState(initialState){
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}
```
useState的执行等于 dispatcher.useState(initialState),
接下来我们看一下 这个resolveDispatcher返回的是什么？

```javascript
function resolveDispatcher() {
  const dispatcher = ReactCurrentDispatcher.current
  return dispatcher
}

// other file
const ReactCurrentDispatcher = {
    current: null
}
```
这里看到，resolveDispatcher只是定义了一个结构，然后返回出来。


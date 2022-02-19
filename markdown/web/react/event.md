# react 事件
## 概述
1. react 的事件绑定在document上统一管理，而不是真实的dom上。
2. dom上事件被单独处理，被react底层替换成空函数。
3. react绑定的事件，比如 onChange，document上可能有多个事件与之对应。
4. react 并不是一开始把所有事件都绑定在document上，而是采用一种按需绑定。

在react中，我们绑定的onClick并不是原生事件，而是原生事件合成的react事件，比如click事件合成为onClick事件，比如blur，change，input，keydown等事件，合成为onchange。

那么为什么react要采用这样的模式？

第一、将所有事件绑定在document上统一管理，防止很多事件直接绑定在原生dom上，造成不可控的情况。
另一方面，react 想要实现一个全浏览器的框架，为了实现这种目标就需要提供给全浏览器一致性的事件系统，以此磨平不同浏览器的差异。

## 事件初始化 - 事件合成 插件机制
react并不是一次性将所有的事件都绑定进去，而是如果发现项目中有onClick事件，才绑定click事件，发现有onChange事件，才绑定blur，change等事件。

### 事件合成 事件插件
基础概念

* namesToPlugins
  
  namesToPlugins装事件名 -> 事件模块插件的映射。namesToPlugins最终的样子如： 
```javascript
  const namesToPlugins = {
    SimpleEventPlugin,
    EnterLeaveEventPlugin,
    ChangeEventPlugin,
    SelectEventPlugin,
    BeforeInputEventPlugin,
}
``` 
simpleEventPlugin 等是处理各个事件函数的插件，比如以此点击事件，就会找到SimpleEventPlugin对应的处理函数。

* plugins

这个对象就是上面注册的所有插件列表，初始化为空

* registrationNameModules

registrationNameModules 记录了react合成的事件 - 对应的事件插件的关系，在react中处理props中事件的时候，会根据不同的事件名，找到对应的事件插件，然后统一绑定在document上，对于没有出现过的事件，就不会绑定。

```javascript
{
    onBlur: SimpleEventPlugin,
    onClick: SimpleEventPlugin,
    onClickCapture: SimpleEventPlugin,
    onChange: ChangeEventPlugin,
    onChangeCapture: ChangeEventPlugin,
    onMouseEnter: EnterLeaveEventPlugin,
    onMouseLeave: EnterLeaveEventPlugin,
    ...
}
```

* 事件插件

```javascript
const SimpleEventPlugin = {
    eventTypes:{ 
        'click':{ /* 处理点击事件  */
            phasedRegistrationNames:{
                bubbled: 'onClick',       // 对应的事件冒泡 - onClick 
                captured:'onClickCapture' //对应事件捕获阶段 - onClickCapture
            },
            dependencies: ['click'], //事件依赖
            ...
        },
        'blur':{ /* 处理失去焦点事件 */ },
        ...
    }
    extractEvents:function(topLevelType,targetInst,){ /* eventTypes 里面的事件对应的统一事件处理函数，接下来会重点讲到 */ }
}
```

事件插件是一个对象，有两个属性，第一个extractEvents作为事件统一处理函数，第二个eventTypes是一个对象，对象保存了原生事件名和对应的配置项dispatchConfig的映射关系，由于react的事件统一绑定在document上，react用独特的事件名称比如onClick和onClickCapture，来说明我们给绑定的函数到底是在冒泡截断还是捕获事件阶段执行。

* registrationNameDependencies

registrationNameDependencies 用来记录，合成事件比如onClick和原生事件click对应关系。
```javascript
{
    onBlur: ['blur'],
    onClick: ['click'],
    onClickCapture: ['click'],
    onChange: ['blur', 'change', 'click', 'focus', 'input', 'keydown', 'keyup', 'selectionchange'],
    onMouseEnter: ['mouseout', 'mouseover'],
    onMouseLeave: ['mouseout', 'mouseover'],
    ...
}
```

### 事件初始化
采用初始化注册方式
```javascript
/* 第一步：注册事件：  */
injectEventPluginsByName({
    SimpleEventPlugin: SimpleEventPlugin,
    EnterLeaveEventPlugin: EnterLeaveEventPlugin,
    ChangeEventPlugin: ChangeEventPlugin,
    SelectEventPlugin: SelectEventPlugin,
    BeforeInputEventPlugin: BeforeInputEventPlugin,
});
```
injectEventPluginsByName 做的事情很简单，形成了namesToPlugins，然后执行recomputePluginOrdering，那么recomeputePluginOrdering做了什么？

```javascript
const eventPluginOrder = [ 'SimpleEventPlugin' , 'EnterLeaveEventPlugin','ChangeEventPlugin','SelectEventPlugin' , 'BeforeInputEventPlugin' ]

function recomputePluginOrdering(){
    for (const pluginName in namesToPlugins) {
        /* 找到对应的事件处理插件，比如 SimpleEventPlugin  */
        const pluginModule = namesToPlugins[pluginName];
        const pluginIndex = eventPluginOrder.indexOf(pluginName);
        /* 填充 plugins 数组  */
        plugins[pluginIndex] = pluginModule;
        const publishedEvents = pluginModule.eventTypes;
        for (const eventName in publishedEvents) {
        // publishedEvents[eventName] -> eventConfig , pluginModule -> 事件插件 ， eventName -> 事件名称
            publishEventForPlugin(publishedEvents[eventName],pluginModule,eventName,)
        } 
    }
}
```
recomputePluginOrdering 的作用是形成plugins，然后执行publishEventForPlugin

```javascript
/*
  dispatchConfig -> 原生事件对应配置项 { phasedRegistrationNames :{  冒泡 捕获  } ，   }
  pluginModule -> 事件插件 比如SimpleEventPlugin  
  eventName -> 原生事件名称。
*/
function publishEventForPlugin (dispatchConfig,pluginModule,eventName){
    eventNameDispatchConfigs[eventName] = dispatchConfig;
    /* 事件 */
    const phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;
    if (phasedRegistrationNames) {
    for (const phaseName in phasedRegistrationNames) {
        if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
            // phasedRegistrationName React事件名 比如 onClick / onClickCapture
            const phasedRegistrationName = phasedRegistrationNames[phaseName];
            // 填充形成 registrationNameModules React 合成事件 -> React 处理事件插件映射关系
            registrationNameModules[phasedRegistrationName] = pluginModule;
            // 填充形成 registrationNameDependencies React 合成事件 -> 原生事件 映射关系
            registrationNameDependencies[phasedRegistrationName] = pluginModule.eventTypes[eventName].dependencies;
        }
    }
    return true;
    }
}

```
publishEventForPlugin 形成了registrationNameModules和registrationNameDependencies对象中的映射关系。

### 事件合成总结
初始化阶段主要是形成了上述的几个重要对象，构建初始化React合成事件和原生事件的对应关系，合成事件和对应的事件处理插件关系。

## 事件绑定 - 从一次点击事件开始

### 事件绑定流程
1. diffProperties处理React合成事件

```javascript
<div>
  <button onClick={ this.handerClick }  className="button" >点击</button>
</div>
```
我们绑定给hostComponent种类的fiber，button对应的fiber上，以memoizedProps和pendingProps形式保存；
```javascript
// button 对应 fiber
memoizedProps = {
   onClick:function handerClick(){},
   className:'button'
}
```
第二步 react在调和子节点后，进入diff阶段，判断hostComponent类型的fiber，会用diff props函数diffProperties单独处理。

```javascript
function diffProperties(){
    /* 判断当前的 propKey 是不是 React合成事件 */
    if(registrationNameModules.hasOwnProperty(propKey)){
         /* 这里多个函数简化了，如果是合成事件， 传入成事件名称 onClick ，向document注册事件  */
         legacyListenToEvent(registrationName, document）;
    }
}
```
diffProperties函数在diff props 如果发现时合成事件就会调用legacyListenToEvent函数，注册事件监听器。

2. legacyListenToEvent 注册事件监听器

```javascript
//  registrationName -> onClick 事件
//  mountAt -> document or container
function legacyListenToEvent(registrationName，mountAt){
   const dependencies = registrationNameDependencies[registrationName]; // 根据 onClick 获取  onClick 依赖的事件数组 [ 'click' ]。
    for (let i = 0; i < dependencies.length; i++) {
        const dependency = dependencies[i];
        //这个经过多个函数简化，如果是 click 基础事件，会走 legacyTrapBubbledEvent ,而且都是按照冒泡处理
        legacyTrapBubbledEvent(dependency, mountAt);
  }
}
```
legacyTrapBubbledEvent 就是执行将绑定真正的dom事件的函数（冒泡处理）

```javascript
function legacyTrapBubbledEvent(topLevelType,element){
   addTrappedEventListener(element,topLevelType,PLUGIN_EVENT_SYSTEM,false)
}
```
第三步在legacyListenToEvent函数中，先找到react合成事件对应的原生事件集合，比如 onClick -> ['click'] , onChange -> [blur , change , input , keydown , keyup]，然后遍历依赖项的数组，绑定事件。

react 对于click等基础事件，会默认按事件冒泡阶段的事件处理。

3. 绑定dispatchEvent进行事件监听。

react是如何绑定事件到document。
```javascript
/*
  targetContainer -> document
  topLevelType ->  click
  capture = false
*/
function addTrappedEventListener(targetContainer,topLevelType,eventSystemFlags,capture){
   const listener = dispatchEvent.bind(null,topLevelType,eventSystemFlags,targetContainer) 
   if(capture){
       // 事件捕获阶段处理函数。
   }else{
       /* TODO: 重要, 这里进行真正的事件绑定。*/
      targetContainer.addEventListener(topLevelType,listener,false) // document.addEventListener('click',listener,false)
   }
}

```
第四步，绑定事件统一处理函数 dispatchEvent ，绑定几个默认参数，事件类型topLevelType 还有绑定容器 document，然后真正的事件绑定，添加事件监听器addEventListener。

### 事件绑定过程总结

* 在react diff dom元素类型的fiber的props的时候，发现是react合成事件，就会按事件系统逻辑单独处理。
* 根据react 合成事件类型，找到对应的原生事件类型，然后调用判断原生事件类型，大部分事件都按照冒泡逻辑处理，少数事件会按照捕获逻辑处理。
* 调用addTrappedEventListener 进行真正的事件绑定，绑定document上，dispatchEvent为统一的事件处理函数。

## 事件触发
### 事件触发处理函数 dispatchEvent
react事件注册时候，统一的监听器dispathchEvent，也就是当按钮被点击之后，首先执行的是dispatchEvent函数，dispatchEvent前三个参数已经被bind了，所以真正的事件源对象event，被默认绑定成第四个参数。
```javascript
function dispatchEvent(topLevelType,eventSystemFlags,targetContainer,nativeEvent){
    /* 尝试调度事件 */
    const blockedOn = attemptToDispatchEvent( topLevelType,eventSystemFlags, targetContainer, nativeEvent);
}
```
```javascript
/*
topLevelType -> click
eventSystemFlags -> 1
targetContainer -> document
nativeEvent -> 原生事件的 event 对象
*/
function attemptToDispatchEvent(topLevelType,eventSystemFlags,targetContainer,nativeEvent){
    /* 获取原生事件 e.target */
    const nativeEventTarget = getEventTarget(nativeEvent)
    /* 获取当前事件，最近的dom类型fiber ，我们 demo中 button 按钮对应的 fiber */
    let targetInst = getClosestInstanceFromNode(nativeEventTarget); 
    /* 重要：进入legacy模式的事件处理系统 */
    dispatchEventForLegacyPluginEventSystem(topLevelType,eventSystemFlags,nativeEvent,targetInst,);
    return null;
}
```
* 首先根据真实的事件源对象,找到e.target 真实的dom元素
* 根据dom元素，找到它对应的fiber对象targetInst.
* 然后正式进去legacy模式的事件处理系统。

react怎么通过原生dom元素，找到对应的fiber的呢？
getClosestInstanceFromNode 可以找到当前传入的dom对应的最近的元素类型的fiber对象。react在初始化真实的dom的时候，用一个随记的key 。
internalInstanceKey指针纸箱了当前dom对应的fiber对象，fiber对象用stateNode指向了当前的dom元素。

```
// 声明随机key
var internalInstanceKey = '__reactInternalInstance$' + randomKey;

// 使用随机key 
function getClosestInstanceFromNode(targetNode){
  // targetNode -dom  targetInst -> 与之对应的fiber对象
  var targetInst = targetNode[internalInstanceKey];
}
```

### legacy 事件处理系统与批量更新
```javascript
/* topLevelType - click事件 ｜ eventSystemFlags = 1 ｜ nativeEvent = 事件源对象  ｜ targetInst = 元素对应的fiber对象  */
function dispatchEventForLegacyPluginEventSystem(topLevelType,eventSystemFlags,nativeEvent,targetInst){
    /* 从React 事件池中取出一个，将 topLevelType ，targetInst 等属性赋予给事件  */
    const bookKeeping = getTopLevelCallbackBookKeeping(topLevelType,nativeEvent,targetInst,eventSystemFlags);
    try { /* 执行批量更新 handleTopLevel 为事件处理的主要函数 */
    batchedEventUpdates(handleTopLevel, bookKeeping);
  } finally {
    /* 释放事件池 */  
    releaseTopLevelCallbackBookKeeping(bookKeeping);
  }
}
```

batchedEventUpdates 是批量更新的主要函数。

```javascript 
export function batchedEventUpdates(fn,a){
    isBatchingEventUpdates = true;
    try{
       fn(a) // handleTopLevel(bookKeeping)
    }finally{
        isBatchingEventUpdates = false
    }
}
```
react 通过isBatchingEventUpdates来控制是否启动批量更新。fn(a)时间上调用的是handleTopLevel(bookKeeping)，js是单线程，因为js是单线程的，所以在组件中写的事件处理函数时机是在handleTopLevel(bookKeeping)中执行的。如果在用户事件处理函数中触发了setState，那么就能读取到 isBatchingEventUpdates = true 。

```
state={number:0}
handerClick = () =>{
    this.setState({number: this.state.number + 1   })
    console.log(this.state.number) //0
    this.setState({number: this.state.number + 1   })
    console.log(this.state.number) //0
    setTimeout(()=>{
        this.setState({number: this.state.number + 1   })
        console.log(this.state.number) //2
        this.setState({number: this.state.number + 1   })
        console.log(this.state.number)// 3
    })
}
```

第一二个setState在批量更新条件之内执行，所以不会打印最新的值。
如果发生在setTimeout中，eventloop放在下一次事件循环中执行，此刻batchedEventUpdates 中已经执行完了isBatchingEventUpdates = false , 批量更新被打破，就可以访问到最新的变化的值。

### 执行事件插件函数

```
// 流程简化后
// topLevelType - click  
// targetInst - button Fiber
// nativeEvent
function handleTopLevel(bookKeeping){
    const { topLevelType,targetInst,nativeEvent,eventTarget, eventSystemFlags} = bookKeeping
    for(let i=0; i < plugins.length;i++ ){
        const possiblePlugin = plugins[i];
        /* 找到对应的事件插件，形成对应的合成event，形成事件执行队列  */
        const  extractedEvents = possiblePlugin.extractEvents(topLevelType,targetInst,nativeEvent,eventTarget,eventSystemFlags)  
    }
    if (extractedEvents) {
        events = accumulateInto(events, extractedEvents);
    }
    /* 执行事件处理函数 */
    runEventsInBatch(events);
}
```
handleTopLevel最后的处理逻辑是执行事件处理插件中的处理函数 extractEvents, react是采用事件合成，事件统一绑定，并且在组件中的时间处理函数，也不是真正的执行函数dispatchAction,那么我们在点击事件对象event，也是react单独合成处理的，里面封装了stopPropagetion和preventDefault。这样的好处是不需要跨浏览器处理兼容问题，统一交给react底层处理。

### extractEvents 形成事件对象和是按处理函数队列

extraEvent 是整个事件系统核心代码。

``` javascript
const  SimpleEventPlugin = {
    extractEvents:function(topLevelType,targetInst,nativeEvent,nativeEventTarget){
        const dispatchConfig = topLevelEventsToDispatchConfig.get(topLevelType);
        if (!dispatchConfig) {
            return null;
        }
        switch(topLevelType){
            default:
            EventConstructor = SyntheticEvent;
            break;
        }
        /* 产生事件源对象 */
        const event = EventConstructor.getPooled(dispatchConfig,targetInst,nativeEvent,nativeEventTarget)
        const phasedRegistrationNames = event.dispatchConfig.phasedRegistrationNames;
        const dispatchListeners = [];
        const {bubbled, captured} = phasedRegistrationNames; /* onClick / onClickCapture */
        const dispatchInstances = [];
        /* 从事件源开始逐渐向上，查找dom元素类型HostComponent对应的fiber ，收集上面的React合成事件，onClick / onClickCapture  */
         while (instance !== null) {
              const {stateNode, tag} = instance;
              if (tag === HostComponent && stateNode !== null) { /* DOM 元素 */
                   const currentTarget = stateNode;
                   if (captured !== null) { /* 事件捕获 */
                        /* 在事件捕获阶段,真正的事件处理函数 */
                        const captureListener = getListener(instance, captured);
                        if (captureListener != null) {
                        /* 对应发生在事件捕获阶段的处理函数，逻辑是将执行函数unshift添加到队列的最前面 */
                            dispatchListeners.unshift(captureListener);
                            dispatchInstances.unshift(instance);
                            dispatchCurrentTargets.unshift(currentTarget);
                        }
                    }
                    if (bubbled !== null) { /* 事件冒泡 */
                        /* 事件冒泡阶段，真正的事件处理函数，逻辑是将执行函数push到执行队列的最后面 */
                        const bubbleListener = getListener(instance, bubbled);
                        if (bubbleListener != null) {
                            dispatchListeners.push(bubbleListener);
                            dispatchInstances.push(instance);
                            dispatchCurrentTargets.push(currentTarget);
                        }
                    }
              }
              instance = instance.return;
         }
          if (dispatchListeners.length > 0) {
              /* 将函数执行队列，挂到事件对象event上 */
            event._dispatchListeners = dispatchListeners;
            event._dispatchInstances = dispatchInstances;
            event._dispatchCurrentTargets = dispatchCurrentTargets;
         }
        return event
    }
}

```
* 首先形成react事件独有的合成事件源对象，这个对象保存整个事件的信息，将作为参数传递给真正的事件处理函数 。
* 然后去声明事件执行队列，按照冒泡 和 捕获 逻辑。从事件源开始逐渐向上，查找dom元素类型HostComponent对应的fiber，收集上面的react合成事件。
* 最后将事件执行队列，保存到react事件源对象上，等待执行。

### 事件触发总结

* 通过统一的事件处理函数 dispatchEvent 进行批量更新batchUpdate
* 然后执行事件对应的处理插件中的extractEvents，合成事件源对象，每次react会从事件源开始，从上遍历类型为hostComponent【dom类型的fiber对象】，判断props中是否有当前响应的事件，最后形成一个事件执行队列。
* 最后通过runEventsInBatch执行队列，如果发现阻止冒泡，就会跳出循环，最后重置事件源，完成流程。

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/68a8f1b7f35c4ecbb58cf9d676cd29ad~tplv-k3u1fbpfcp-watermark.awebp)

### react 17 改版

事件统一绑定到了挂载的根节点上，目标是为了适应微前端框架。


## 总结
本文从事件合成，事件绑定，事件触发三个方面详细介绍了React事件系统原理。
贴一下原文地址
> https://juejin.cn/post/6955636911214067720#heading-23
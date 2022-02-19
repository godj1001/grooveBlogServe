# promise

## 初版
大家都知道promise.先实现一个简单的，满足最基本的要求。

那么我们来看一下 promise是怎么用的。

```javascript
let promise1 = new Promise((resolve,reject) => {
    resolve(1)
}).then(res => {
    console.log(res)
},err => {
    console.log(err)
})
```

我们使用class来实现。

```javascript
class NewPromise{
}
```
看一下传入的参数，传入了一个方法，方法的参数是resolve,reject;

```javascript
class NewPromise{
    constructor(fn){
        // resolve,reject 待补充
        fn(this.resolve,this.reject)
    }
    resolve(){}
    resject(){}
}
```
这个方法的参数 resolve和reject 是做什么的呢？ 
Promise的内部有一个状态，初始值是 pending ，可以通过 resolve 方法改变成 fulfilled 或者通过reject 方法改变成 rejected ；

```javascript
class NewPromise{
    constructor(fn){
        this.promiseState = 'pending'
        this.promiseResult = null;
        this.promiseReason = null;
        //  这里注意改变传入方法的this指向。
        fn(this.resolve.bind(this),this.reject.bind(this))
    }
    resolve(result){
        if(this.promiseState !== 'pending') return ;

        this.promiseState = 'fulfilled';
        this.promiseResult = result;

    }

    reject(reason){
        if(this.promiseState !== 'pending') return ;
        this.promiseState = 'rejected';
        this.promiseReason = reason;
    }
}
```
现在还差then方法。
来看看 then 方法来做了什么？

then 方法接受两个方法，一个是成功的处理函数，一个是失败的处理函数。

```javascript
class NewPromise{
    ...

    then(onFulfilled,onRejected){
        if(this.promiseState === 'fulfilled'){
            onFulfilled(this.promiseResult);
        }else if(this.promiseState === 'rejected'){
            onRejected(this.promiseReason);
        }
    }
}
```
来看看目前代码 运行的效果
```javascript
console.log(1);
let promise1 = new NewPromise((resolve, reject) => {
    console.log(2);
    resolve(3);
});

promise1.then(res => {
    console.log(res);
}, err => {
    console.log(err);
});

console.log(4);

// 输出结果 1  2  3  4
```
为什么会出现这个情况呢？ 按道理来说应该输出为 1 ， 2 ， 4， 3 。

原来是这样的，我们实现的promise都是同步代码，但是真实的promise都是异步代码，那使用setTimeout来模拟异步实现。
```javascript
 resolve(result){
        if(this.promiseState !== 'pending'){
            return ;
        }
        setTimeout(() => {
            this.promiseState = 'fulfilled';
            this.promiseResult = result;
        })
    }
```
增加了setTimeout后打印 1 2 4 ；缺少了resolve回调的内容。

因为是异步代码的原因，所以在then方法触发的时候，promiseState还是 pending ,并不会触发，所以改变状态时已经错过了触发时机了。

修改一下 ，保证在 promise 改变的时候,then 中的方法已经被储存。

```javascript

class NewPromise {
    constructor(fn) {
        this.promiseState = 'pending';
        this.promiseResult = null;
        this.promiseReason = null;
        this.fulfilledCallback = [];
        this.rejectedCallback = [];
        //  这里注意改变传入方法的 this 指向。
        fn(this.resolve.bind(this), this.reject.bind(this));
    }
    resolve(result) {
        if (this.promiseState !== 'pending') return;
        setTimeout(() => {
            this.promiseState = 'fulfilled';
            this.promiseResult = result;
            this.fulfilledCallback.forEach(callback => {
                callback(this.promiseResult);
            });
        });
    }

    reject(reason) {
        if (this.promiseState !== 'pending') return;
        setTimeout(() => {
            this.promiseState = 'rejected';
            this.promiseReason = reason;
            this.rejectedCallback.forEach(callback => {
                callback(this.promiseReason);
            });
        });
    }

    then(onFulfilled, onRejected) {
        if (this.promiseState === 'fulfilled') {
            onFulfilled(this.promiseResult);
        } else if (this.promiseState === 'rejected') {
            onRejected(this.promiseReason);
        } else if (this.promiseState === 'pending') {
            this.fulfilledCallback.push(onFulfilled);
            this.rejectedCallback.push(onRejected);
        }
    }
}


console.log(1);
let promise1 = new NewPromise((resolve, reject) => {
    console.log(2);
    resolve(3);
});

promise1.then(res => {
    console.log(res);
}, err => {
    console.log(err);
});

console.log(4);
// 输出为 1 2 4 3 
```

到这里，promise的基本功能已经实现了。

还差什么呢？ 就是Promise链式的这个能力。


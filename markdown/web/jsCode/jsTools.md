## 工具方法

### 数组去重
数据去重是个老问题了，解决数组去重最高效的方法就是利用对象的特性来实现去重。

``` javascript
// 考虑到数组中的内容不一定是字符串或者数字，所以增加参数 key ，去唯一标识数组内容
const unqiue = (arr,key) => {
    let obj = {};
    let newArr = []
    for(let arrItem of arr){
        if(key){
            if(!obj[arrItem[key]]){
                obj[arrItem[key]] = true
                newArr.push(arrItem)
            }
        }else {
            if(!obj[arrItem]){
                obj[arrItem] = true
                newArr.push(arrItem)
            }
        }
    }
    return newArr
}
let arr1 = [1, 3, 1, 4, 5];
let arr2 = [
    {id: 1}, {id: 3}, {id: 1}, {id: 4}, {id: 5}
];
console.log(unqiue(arr1)); //[ 1, 3, 4, 5 ]
console.log(unqiue(arr2, 'id')); //[ { id: 1 }, { id: 3 }, { id: 4 }, { id: 5 } ]
```

### 防抖

``` javascript
const debounce = (fn,time) => {
    let timer = null;
    return function(){
        clearTimeout(timer);
        timer = setTimeout(()=>{
            fn.apply(this,arguments);
        },time)
    }
}
```

### 节流
```javascript
const throttle = (fn,time) => {
    let flag = true;
    return function(){
        if(!flag) return ;
        fn.apply(this,arguments)
        flag = false;
        setTimeout(() => {
            flag = true
        },time)
    }
}
```

### instanceOf
```javascript
const getInstanceof = (left,right) => {
    if(typeof left !== 'object' || left === null ) return false;

    let proto = Object.getPrototypeOf(left);
    while(true){
        if(proto === null) return false;
        if(proto === right.prototype) return true;
        proto = Object.getPrototypeOf(proto)
    }
}
```

### 深拷贝

深拷贝不仅是面试中常被问及到的，还是工作中常用到的内容
```javascript
const deepClone = (obj) => {
    if(typeof obj !== 'object' || obj === null){
        return obj;
    }
    let clone = Array.isArray(obj)?[]:{}
    for(let item in obj){
        clone[item] = typeof obj[item] === 'object' && obj[item] !== null ? deepClone(obj[item]):obj[item]
    }
    return clone;
}
```

### JSONP
jsonP 是一个过时的跨域手段，但是仍被广大的面试管所喜欢。

```javascript
const jsonp = (url,params,callbackName) => {
const buildUrl = () => {
    let dataSrc = '';
    for (let key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        dataSrc += `${key}=${params[key]}&`;
      }
    }
    dataSrc += `callback=${callbackName}`;
    return `${url}?${dataSrc}`;
  }
    return new Promise((resolve,reject) => {
        const script = document.createElement('script')
        script.src = buildUrl();
        document.body.appendChild(script)
        window[callbackName] = data => {
            resove(data);
            document.removeChild(script)
        }
    })
}
```

### ajax
前端的发展也得益于ajax技术的出现。大家可能比较熟悉axios，但是原生的ajax可能是比较难用。封装一个自己的ajax方法是工作中的利器。
```javascript
const ajax = (methon, path, data) => {

    return new Promise((resolve,reject) => {
        let xhr = new XMLHttpRequest()
        xhr.open(methon.toUpperCase(), path, true);
        //设置发送数据的请求格式
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.onreadystatechange = function () {
            //  todo something 
            if (xhr.readyState !== 4) return;
            if (xhr.status === 200 || xhr.status === 304) {
                resolve(xhr.responseText);
            } else {
                reject(new Error(xhr.responseText));
            }
        }
        //将用户输入值序列化成字符串
        xhr.send(JSON.stringify(data));
    })
}
```
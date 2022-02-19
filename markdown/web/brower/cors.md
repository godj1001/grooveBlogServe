# 跨域 

曾经，作为一个菜鸡，听到跨域这两个字就会浑身颤抖，成为了我迈向更高境界的一个心魔。

如今，我已修炼多年，今日便要斩这心魔于笔下。

## 为什么会有跨域？

跨域来源于浏览器的一个机制，叫做 同源策略 。

## 同源策略 
> 在Web浏览器中，允许某个网页脚本访问另一个网页的数据，但前提是这两个网页必须有相同的URI、主机名和端口号，一旦两个网站满足上述条件，这两个网站就被认定为具有相同来源。此策略可防止某个网页上的恶意脚本通过该页面的文档对象模型访问另一网页上的敏感数据。

注意这里的浏览器哦

#### 为什么会有同源策略
同源策略主要是为了限制js的能力，限制js非法读取非同源的cookie，storage，indexDB的内容。

## 跨域方案
随着前后端分离，跨域问题也随之越来越多。

### 为什么前后端分离会引发跨域问题？
在我游历的时候，学过一本 javaWeb 的秘籍，在那本秘籍的描述下，前端页面是由后端服务返回给浏览器的，浏览器访问网址，服务器返回对应的内容。

但是随着前后端分离，前端成为静态资源被储存在服务器的某个文件夹下，后端服务则在某个端口中。这个是请求前端资源，前端资源再向服务器发送请求，因为两个资源的端口号可能不一样，这个时候就会发生跨域问题。


既然说了将它斩于笔下，那么我们就来说说如何解决跨域。
### CORS 
跨域资源共享，也是当今解决跨域问题的主流方案。

浏览器将cors请求分成两类： 简单请求和非简单请求。

#### 简单请求
请求头为 
* HEAD
* GET
* POST

请求的头信息不超出：
* Accept
* Accept-Language
* Content-Language
* Last-Event-ID
* Content-Type: application/x-www-form-urlencoded、multipart/form-data、text/plain.

对于简单请求，cors的处理是在头部信息中加入一个origin，来表示本次请求是从哪个网址来,由服务器来判断是否要返回。

如是origin不在允许的范围内，服务器就会返回一个http回应，这个时候，浏览器会判断这个http回应中有没有Access-Control-Allow-Origin 且 有没有包含请求的 origin。

浏览器是关键，是执行同源策略的守卫。

#### 非简单请求
既然明确了什么是简单请求，那么其他的请求就是非简单请求。

对于非简单请求， 浏览器 会在正式访问之前，有一个预检请求，预检请求使用的就是 OPTIONS 这个方法。

那么预检请求做什么呢？
简单来说，就是核查服务器接受不接受这次非简单请求。若是能够接受，则会正式发送请求，若是不能，则会报错。

#### cors总结
浏览器是同源策略的执行者，也是cors的执行者。
浏览器会核验服务器是否允许该地址向服务器发送请求，来去维护同源策略。

### jsonP
在cors出现之前，人们是如何解决跨域的呢？就是这把上古传下来的宝剑 - jsonP。

在说jsonP之前，再来聊聊同源策略。同源策略究竟限制的是什么呢？
在定义里面，看到了这么一句话 '此策略可防止某个网页上的恶意脚本通过该页面的文档对象模型访问另一网页上的敏感数据。';

同源策略仅适用于脚本，那么其他的内容是否可以跨域呢？比如html，比如css。
原来 所有的带有src的html标签都可以绕过同源策略的检查。
在这个前提下，就诞生了jsonP。

通过动态的创建前端script标签，然后将请求地址和数据放入，同时设置一个回调函数。
```javascript
function jsonp({ url, params, callback }) {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script')
    window[callback] = function(data) {
      resolve(data)
      document.body.removeChild(script)
    }
    params = { ...params, callback } // wd=b&callback=show
    let arrs = []
    for (let key in params) {
      arrs.push(`${key}=${params[key]}`)
    }
    script.src = `${url}?${arrs.join('&')}`
    document.body.appendChild(script)
  })
}
```
我被问过这么一个问题，为什么jsonP一定要一个回调函数。

因为script脚本回去执行，然后怎么将数据回传给之前的处理方法呢，就需要将数据传入一个回调函数中，这样，我们就能感知到jsonP的返回。

### Websocket
websocket的跨域方法就是 我使用另一套规则，来战胜跨域 。。

websocket 使用ws://这样的方式进行连接，并不是使用http协议来进行数据传输，所以浏览器并不能限制它，再者，websocket本身就是设计成支持跨域的协议。

### PostMessage
PostMessage 跨域的方向和前面的还是有些不同，是在不同网页的脚本之前做跨域。

例如 在浏览器中，有两个网页 a 和 b 。在 a 网页点击一个按钮，在 b 网页弹出消息。这样的场景就可以使用postMessage来实现。
现在一些iframe也可以通过这个方式实现通信。

### IFrame 跨域三兄弟
既然有了Postmessage这样的方式，那么在iframe相关的其他方式也就没有那么多使用场景了。但是也列出来，让跨域这个心魔死的干干净净。
* document.domain + iframe
* window.location.hash + iframe
* window.name + iframe

上面三种方式应对跨域的方式都是通过可以将某些信息传递出来做到跨域的。

## 总结 
跨域问题，老生常谈，文章一写，心魔溃散。

> 博客传送门： http://groove-zhang.cn/#/web/brower/cors

如有错误，欢迎指正。
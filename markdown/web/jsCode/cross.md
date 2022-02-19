# 跨域问题相关

## 为什么会有跨域问题
### 浏览器的同源策略
同源策略是浏览器的一个重要的安全策略，用于限制一个origin的文档或他家在的脚本如何能够和另一个源的资源进行就交互。
这样能够有效的鳄梨恶意文档，减少被攻击媒介。（洁身自好）

### 同源的定义

什么是同源？质的是协议，主机，端口元组都相同。

### 源的更改
在满足某些限制条件的情况情况下，页面是可以修改他的源的，当然不是随意修改。
脚本可以将document.domain的值设置为当前域或者当前域的父域。
任何对document.domain的赋值操作，包括 document.domain = document.domain 都会导致端口号被重写为 null

### 跨域网络访问
跨域写操作（Cross-origin writes）一般是被允许的。例如链接（links），重定向以及表单提交。特定少数的HTTP请求需要添加 preflight。
跨域资源嵌入（Cross-origin embedding）一般是被允许，各种标签资源，如script，link，img，video，object等。
跨域读操作（Cross-origin reads）一般是不被允许的，但常可以通过内嵌资源来巧妙的进行读取访问。例如，你可以读取嵌入图片的高度和宽度，调用内嵌脚本的方法，或availability of an embedded resource.

### 如何允许跨源访问
* 使用cors来允许跨源访问。
  
  cors是http的一部分，它允许服务端指定那些主机可以从这个服务器上加载资源（原来他是这样的).
  #### cors跨域原理
主要是定义了客户端和服务端的沟通机制。
cors需要浏览器和服务器同时支持。

  #### cors的两种请求
浏览器将cors请求分为两类：简单请求和非简单请求（预检请求）
只要满足一下两大条件，就属于简单请求。
1. 请求方法是一下三种方法之一
    HEAD
    GET
    POST
2. http请求头信息不超出一下几种字段：
    Accept
    Accept-Language
    Content-Language
    Last-Event-ID
    Content-Type
只限于application/x-www-form-urlencoded , multipart/form-data , text/plain

3. cors非简单请求- 预检请求
非简单请求时那种对服务器有特殊要求的请求，比如说Put或Delete，或者content-type的类型是application/json

  #### cors的工作原理
  web资源设计到两个角色：浏览器和服务器。、
  1. 若是浏览器发送的是个跨域请求，http请求中就会携带一个名为origin的头表明自己的‘位置’。
  2. 浏览器接到请求后，就可以根据传过来的origin头做逻辑，决定是否将资源共享给这个源。这个决定通过响应头Access-Control-Allow-Origin来承载，它的只可以是任何值。
    a. 无此头：不共享给次origin
    b. 有此头：值为一下
      ⅰ. 值为* ，所有origin共享
      ⅱ. 值为origin相同，共享给origin
      ⅲ. 值为非origin，不同享给origin
  3. 浏览器接收到response响应后，会去提取Access-Control-Allow-Origin这个头。根据上述规则来决定是否要响应还是拒绝。



* jsonp

    利用script标签的跨域能力,可以得到其他源的json数据。
    jsonp请求一定需要对方服务器支持才行。
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
jsonp({
  url: 'http://localhost:3000/say',
  params: { wd: 'Iloveyou' },
  callback: 'show'
}).then(data => {
  console.log(data)
})

// server.js
let express = require('express')
let app = express()
app.get('/say', function(req, res) {
  let { wd, callback } = req.query
  console.log(wd) // Iloveyou
  console.log(callback) // show
  res.end(`${callback}('我不爱你')`)
})
app.listen(3000)

```

* postMessage

postMessage 是 html5 中的api，是为数不多的可以跨域操作的window属性。
用于在同一个浏览器中，和不同的tab进行数据传递。
// todo 待完善

* websocket

[我很疑惑] 一番调查后，原来websocket本来就存在跨域的这个设计
// todo 待完善


* node两次代理

node层转发请求，避免跨域问题

* nginx 反向代理
// todo 
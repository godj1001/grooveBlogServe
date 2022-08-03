# 背景
因为没有仔细看设计稿，突然发现有这么一个 UI 细节，左侧省略号。这个就触及到了我的知识盲区了。

# 实现
在我的常规认知中，一般都是右侧省略号。

我们先初始化一下这个结构。
```javascript
<style>
    .box{
        max-width: 150px;
        background: rgb(157, 157, 156);
        padding: 8px;
    }
</style>
<body>
    <div class="box" id="box">
        这里是一个超长文本，用于测试省略功能。
    </div>
</body>
```
![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c91519ea9278412db41a4653c9eb89db~tplv-k3u1fbpfcp-watermark.image?)

对于左侧省略号，我第一反应是用js对字符串进行剪切，然后进行补充。

```javascript
<script>
    const box = document.getElementById('box')
    
    const innerTextLength = box.outerText.length;
    const newContent = box.outerText.slice(Math.max(0,innerTextLength-8),innerTextLength)
    if(innerTextLength > 8){
        box.innerHTML = '...'+ newContent;
    }
</script>
```

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/86f1432b2a0043e5a882be7496b3d55d~tplv-k3u1fbpfcp-watermark.image?)

功能是实现了，但是这种方案会出现很多的问题，比如国际化切换语言后，文本长度变化以及各种适配等等。

在上网搜索一番后，找到了css这边的解决方案。那就是 **css direction** 。

> CSS 属性 **`direction`** 用来设置文本、表列水平溢出的方向。 `rtl` 表示从右到左 (类似希伯来语或阿拉伯语)， `ltr` 表示从左到右 (类似英语等大部分语言).

我们先实现右侧省略
```
    .box{
        max-width: 150px;
        background: rgb(157, 157, 156);
        padding: 8px;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
```

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5b67a0cd338b4dbe89c99299ffd0e3e7~tplv-k3u1fbpfcp-watermark.image?)

我们通过添加 css 属性 `dirction: rtl ; ` 后，就可以实现了左侧省略号。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1f4567197ffd4ce6ac4ebd252dac273a~tplv-k3u1fbpfcp-watermark.image?)

但是如果文本不够长的时候，会出现文本右对齐，这个时候就添加 `text-align: left;`就可以解决这个问题。

# 最终
```html 
<style>
    .box{
        max-width: 150px;
        background: rgb(157, 157, 156);
        padding: 8px;
        /* 溢出文本省略 */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        /* 溢出文本左侧省略 */
        text-align: left;
        direction: rtl;
    }
</style>

<body>
    <div class="box" id="box">
        这里是一个超长文本，用于测试省略功能。
    </div>
</body>
```
# 总结

在前端效果实现中，css的优先级是非常高的。

今天学到了新知识，分享一哈
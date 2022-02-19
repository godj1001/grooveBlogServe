## html2canvas 踩坑

> 近期做项目需求，需要进行dom的截图分享；还是比较简单的一个需求。但实际的过程中还是踩了一些坑；
> 使用的是html2canvas进行开发。

### 链接图片无法被html2canvas捕获

在截取网络资源图片时，截图功能是失效的。查明原因后，原来是html2canvas对于网络图片会产生跨域情况；所以将图片展示为base64就可以解决该问题。
```javascript
export const getBase64Image = (img, width, height) => { // width、height调用时传入具体像素值，控制大小 ,不传则默认图像大小
  const canvas = document.createElement('canvas')
  canvas.width = width || img.width
  canvas.height = height || img.height

  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL()
}
```

这样，网络图片就可以顺利加载出来了。

### 在ios中进行截图，会无响应

这个问题还是满奇怪的，在搜索一番后，大多的回复都是html2canvas版本问题，我也做了降版本的事情，但是并没有什么卵用。
最终定位到的问题是，图片资源不能以background-image的方式，只能以img标签的形式来作为背景。

### html2canvas原理

粗略的看了一下html2canvas的源码，大体上是这么做的；

get dom、options -> create iframe  -> clone dom -> copy style -> render in iframe -> dom to canvas 

这样也就能解释 为什么我已经加载完成的资源文件，还会产生跨域问题。

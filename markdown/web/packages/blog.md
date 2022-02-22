## 前言
之前使用[docsify](https://docsify.js.org/#/)来写自己的博客。

docsify 核心的使用方法就是使用 markdown 来编写博客，加载一个html，根据页面的路由，去请求对应的 markdown 文件，将 markdown 文件转换 html 结构 ，然后加载到对应位置。

使用了一段时间后，发现加载时间非常的长，总的来说就是需要加载很多文件，影响了速度。

于是，我决定放弃 docsify 。自己去写一个服务，去实现自己的博客。

## 设想

借用 docsify 的 markdown 文件转换成 html 这个思路，我来实现一套服务器预渲染，读取 markdown 文件，将 markdown 内容转换成 html 内容，最后输出到一个模板当中，生成 html 。

思路可行，开工！

## 起步

首先，先实现一个服务，我这边使用的是 koa 。
```javascript
const Koa = require('koa');
const app = new Koa();
const path = require('path');
const {readFileSync} = require('fs');

app.use(async ctx => {
    const html = await readFileSync(path.join(__dirname, ctx.path));
    ctx.body = html.toString();
});
```
这是一个最基本的服务，实现了基本的请求 html 返回资源。

创建三个文件夹，一个 markdown ，一个 html ，一个 template ，分别去存储 markdown 文件 ，html 文件 和 模板文件。 

## 构建
### 转换 markdown 内容
这边我使用 markdown-it 来进行 markdown 文件内容的转换 。

```javascript
const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');

function transformMarkdown2Html(markdownContent) {
        let renderCore = new MarkdownIt({
            // 保留html标签
            html: true,
            // 代码块高亮
            highlight: function (str, lang = 'javascript') {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(str, {language: lang}).value;
                    } catch (__) { }
                }
                return '';
            }
        });
        return renderCore.render(markdownContent);
}
```
### 构建目录栏
每个博客网站都需要导航栏或者一个目录栏。

那么，我将文件夹作为目录结构，文件名作为路径，去构建一个目录栏。

```javascript
// 读取文件
async function readMarkdownFile(markdownFilePath) {
    const markdownBuffer = await fs.readFileSync(markdownFilePath);
    return markdownBuffer.toString();
}
// 构建markdown内目录结构和markdown信息
async function getMarkdownDirContent(markdownFolderPath) {
    async function dep(dirPath) {
        const dir = await fs.readdirSync(dirPath);
        let dirList = [];
        for (let item of dir) {
            const itemPath = path.join(dirPath, item);
            const itemStat = await fs.statSync(itemPath);
            let itemObj = {
                name: item,
                path: itemPath,
                isDirectory = itemStat.isDirectory()
            };
            if (itemObj.isDirectory) {
                itemObj.children = await dep(itemPath);
            } else {
                itemObj.markdownContent = await readMarkdownFile(itemPath);
                itemObj.htmlContent = await transformMarkdown2Html(itemObj.markdownContent);
            }
            dirList.push(itemObj);
        }
        return dirList;
    }
    return await dep(markdownFolderPath);
}
```
通过上面的递归方法，就可以获取到 markdown 文件夹下的结构，内容以及对应的html内容。

接下来 将结构转换成 目录。

```javascript
function buildSidebar(markdownFolderInfo, deepCount = 1) {
    const sidebar = [];
    for (let info of markdownInfo) {
        if (info.isDirectory) {
            let obj = {
                name: info.name,
                element: `<div class='level-${deepCount} folder'>${info.name}</div>`
            };
            obj.children = buildSidebar(info.children, deepCount + 1);
            sidebar.push(obj);
        } else {
                let htmlPath = transformMarkdownPath2HtmlPath(info.path);
                let hrefPath = buildHrefPath(htmlPath, deepCount);
                // 通过层级来去控制目录级别
                const element = `<div class='level-${deepCount}'><a href="${basePath + hrefPath}">${info.name}</a></div>`;
                const obj = {
                    name: info.name,
                    hrefPath,
                    element: element
                };
                sidebar.push(obj);
        }
    }
    return sidebar;
}
// 转换成相对路径
function buildHrefPath(htmlPath, deep) {
    const htmlPathList = htmlPath.split('/');
    return htmlPathList.slice(htmlPathList.length - deep - 1).join('/');
}
// markdown 路径转换成 html 文件路径
function transformMarkdownPath2HtmlPath(markdownFilePath) {
    const filePath = markdownFilePath.split('/');
    const htmlPath = filePath.map(dir => {
        if (dir === 'markdown') {
            dir = 'html';
        }
        if (dir && dir.indexOf('.') > -1) {
            dir = dir.replace(/.md/, '.html');
        }
        return dir;
    });
    return htmlPath.join('/');
}
```

### 组装数据
哦吼、现在我们已经拥有了 目录 和 博客内容 的 html 代码的。 

我使用 template.html 作为模板，承接上面的这些 html 代码。
```html
...
<body>
    <div class="page">
        <div class="sider"> siderCode </div>
        <div class="content">
            <section>
                contentCode
            </section>
        </div>
    </div>
</body>
...
```
``` javascript
async function handleMarkdownInfo(markdownInfo, sidebarCode) {
    // 判断是否是文件夹 
    if (markdownInfo.isDirectory) {
        await fs.mkdirSync(transformMarkdownPath2HtmlPath(markdownInfo.path));
        for (let markdownChild of markdownInfo.children) {
            handleMarkdownInfo(markdownChild, sidebarCode);
        }
    } else {
        // 读取template文件 进行字符串替换 然后存储
        const templateCode = await fs.readFileSync(path.join(__dirname, '../template/template.html'));
        let htmlFileContent = templateCode.toString().replace(/siderCode/, sidebarCode).replace(/contentCode/, markdownInfo.htmlContent).replace(/blogTitle/, markdownInfo.name);
        saveTransformResultForHtml(transformMarkdownPath2HtmlPath(markdownInfo.path), htmlFileContent);
    }
}
// 存储文件
async function saveTransformResultForHtml(htmlPath, htmlContent) {
    const res = await fs.writeFileSync(htmlPath, htmlContent);
    return res;
}
```
到目前，我们已经能实现将 markdown 文件转换成 html 文件。

## 填坑
### 样式
我直接将样式写在了 template 内，这样就省去了一个css文件的请求，因为css内容并不多。

### oss
静态资源这块，我通过最初创建的服务进行返回。
不过，在处理svg文件的时候，需要将svg的返回格式设置为 svg 。前端才能正常读取。

### 目录名称
因为我这边都是markdown文件，文件名都是英文，怎么转换中文，或者 有一些草稿内容，怎么做？

我使用一个json文件，将要发布的放在其内，并且在读取内容的时候，判断是否在json中，这样不仅可以做转换，还可以实现本地草稿。例如：
```json
{
    "home.md": "首页",
}
```
### 激活效果
这个我直接在 template 中写了一点js
```javascript
<script>
    document.addEventListener('DOMContentLoaded', () => {
        let url = location.href;
        let aEl = document.getElementsByTagName('a');
        for (let el of aEl) {
            if (el.href === url) {
                el.style.color = 'rgb(66, 185, 131)'
            }
        }
    })
</script>
```

### 首页
这个东西是没有做首页相关的，所以需要自己指定，在koa的应用中直接返回写死。【未来看怎么优化】

## 最终效果

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ee89481695ed494e9273453890bd8e88~tplv-k3u1fbpfcp-watermark.image?)

## 未来优化点
* koa的中间件
    * 统计功能接入
    * 首页 优化
 * 增加额外的 nav
 * 直接编写 html 作为内容
 * 抽离成包 共享大家

 ## 总结
 
 博客从第一版 前后端分离 到 第二版 doscifly 再到最新的这一版本，感觉是逐步在优化的。现在这个版本的服务器预渲染，生成，应该对seo也有点好处，看能不能通过啥推广一下。嘿嘿。
 
 自己搞搞事情还是很开心的。
 
 
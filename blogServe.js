const MarkdownIt = require('markdown-it');
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
const hljs = require('highlight.js');
const KoaLogger = require('koa-logger');
const Koa = require('koa');

const defautOptions = {
    markdownFilePath: path.join(__dirname, './markdown'),
    htmlOutputPath: path.join(__dirname, './html'),
    templateHtmlPath: path.join(__dirname, './template/template.html'),
    ossPath: '',
    port: 3000,
    homePagePath: '',
    transformPath: path.join(__dirname, './sidebar.json'),
    location: 'http://groove-zhang.cn/',
    failHtmlPath: path.join(__dirname, './template/404.html')
};
async function blogServe(option) {
    const options = Object.assign(defautOptions, option);
    let mdNameJson = {};
    try {
        mdNameJson = require(options.transformPath);
    } catch (e) {
        mdNameJson = {};
    }
    const templateHtmlPath = options.templateHtmlPath;
    const basePath = options.location;
    const markdownRender = new MarkdownIt({
        html: true,
        highlight: function (str, lang = 'javascript') {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(str, {language: lang}).value;
                } catch (__) { }
            }

            return '';
        }
    });
    // 转换 markdown 内容的方法 
    // TODO 增加事件广播
    function transformMarkdown2Html(markdownContent) {
        return markdownRender.render(markdownContent);
    }

    // 构建相对路径 
    function buildHrefPath(htmlPath, deep) {
        const htmlPathList = htmlPath.split('/');
        return htmlPathList.slice(htmlPathList.length - deep - 1).join('/');
    }

    // 构建侧边栏内容
    function buildSidebar(markdownInfo, deepCount = 1) {
        const sidebar = [];
        for (let info of markdownInfo) {
            if (info.isDirectory) {
                let obj = {
                    name: info.name,
                    element: `<div class='level-${deepCount} folder'>${mdNameJson[info.name] || info.name}</div>`
                };
                obj.children = buildSidebar(info.children, deepCount + 1);
                sidebar.push(obj);
            } else {
                // 通过判断是否存在 来做缓存和过滤操作
                if (mdNameJson[info.name]) {
                    let htmlPath = transformMarkdownPath2HtmlPath(info.path);
                    let hrefPath = buildHrefPath(htmlPath, deepCount);

                    const element = `<div class='level-${deepCount}'><a href="${basePath + hrefPath}">${mdNameJson[info.name] || info.name}</a></div>`;
                    const obj = {
                        name: info.name,
                        hrefPath,
                        element: element
                    };
                    sidebar.push(obj);
                }
            }
        }
        return sidebar;
    }

    // 组装侧边栏代码
    function buildSidebarCode(sidebarInfo) {
        let code = "";
        if (Array.isArray(sidebarInfo)) {
            for (let sidebarItem of sidebarInfo) {
                code += sidebarItem.element;
                if (sidebarItem.children) {
                    sidebarItem.children.forEach(child => {
                        code += buildSidebarCode(child);
                    });
                }
            }
        } else {
            code += sidebarInfo.element;
            if (sidebarInfo.children) {
                sidebarInfo.children.forEach(child => {
                    code += buildSidebarCode(child);
                });
            }
        }

        return code;
    }

    // 读取markdown文件内容
    async function readMarkdownFile(markdownFilePath) {
        const markdownBuffer = await fs.readFileSync(markdownFilePath);
        return markdownBuffer.toString();
    }

    // 存储文件内容
    async function saveTransformResultForHtml(htmlPath, htmlContent) {
        const res = await fs.writeFileSync(htmlPath, htmlContent);
        return res;
    }

    // 
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

    async function removeDir(removePath) {
        await execSync(`rm -rf ${removePath}/*`);
    }

    async function getMarkdownDirContent(inputPath) {
        async function dep(dirPath) {
            const dir = await fs.readdirSync(dirPath);
            let dirList = [];
            for (let item of dir) {
                const itemPath = path.join(dirPath, item);
                const itemStat = await fs.statSync(itemPath);
                let itemObj = {
                    name: item,
                    path: itemPath,
                };
                if (itemStat.isDirectory()) {
                    itemObj.isDirectory = true;
                    itemObj.children = await dep(itemPath);
                } else {
                    itemObj.isDirectory = false;
                    itemObj.markdownInfo = await readMarkdownFile(itemPath);
                    itemObj.htmlContent = await transformMarkdown2Html(itemObj.markdownInfo);
                }
                dirList.push(itemObj);
            }
            return dirList;
        }
        return await dep(inputPath);
    }

    async function handleMarkdownInfo(markdownInfo, sidebarCode) {
        if (markdownInfo.isDirectory) {
            await fs.mkdirSync(transformMarkdownPath2HtmlPath(markdownInfo.path));
            for (let markdownChild of markdownInfo.children) {
                handleMarkdownInfo(markdownChild, sidebarCode);
            }
        } else {
            const templateCode = await fs.readFileSync(templateHtmlPath);
            let htmlFileContent = templateCode.toString().replace(/siderCode/, sidebarCode).replace(/contentCode/, markdownInfo.htmlContent).replace(/blogTitle/, mdNameJson[markdownInfo.name]);
            saveTransformResultForHtml(transformMarkdownPath2HtmlPath(markdownInfo.path), htmlFileContent);
        }
    }
    async function folderExist(inputPath) {
        let pathList = inputPath.split('/');
        let currentPath = '/';
        for (let addPath of pathList) {
            currentPath = path.join(currentPath, `./${addPath}`);
            let exist = await fs.existsSync(currentPath);
            if (!exist) {
                await fs.mkdirSync(currentPath);
            }
        }
        return true;
    }
    async function init(options) {
        // 判断输出路径是否存在 不存在便创建
        await folderExist(options.htmlOutputPath);
        // 清空文件夹 保证输入内容
        await removeDir(options.htmlOutputPath);

        const markdownDirContentInfoList = await getMarkdownDirContent(options.markdownFilePath);
        let sidebar = buildSidebar(markdownDirContentInfoList);
        const sidebarCode = buildSidebarCode(sidebar);
        for (let markdownInfo of markdownDirContentInfoList) {
            markdownInfo.sidebarCode = sidebarCode;
            handleMarkdownInfo(markdownInfo, sidebarCode);
        }
        //  build index html
        const failFile = await fs.readFileSync(options.failHtmlPath);
        await saveTransformResultForHtml(path.join(options.htmlOutputPath, '404.html'), failFile.toString());
    }

    const handleCtx = async (ctx) => {
        if (ctx.path === '/') {
            const content = await readFileSync(path.join(__dirname, '/html/about.html'));
            ctx.body = content.toString();
            return;
        }

        let pathList = ctx.path.split('/');
        if (pathList.includes('oss')) {
            const content = await readFileSync(path.join(__dirname, ctx.path));
            if (pathList[pathList.length - 1].indexOf('.svg') > -1) {
                ctx.type = 'svg';
                ctx.body = content.toString();
            } else {
                ctx.body = content;
            }
            return;
        }
        try {
            const content = await readFileSync(path.join(__dirname, ctx.path));
            ctx.body = content.toString();
        } catch (e) {
            const fail = await readFileSync(path.join(__dirname, './html/404.html'));
            ctx.body = fail.toString();
        }
    };

    const app = new Koa();

    app.use(KoaLogger());

    app.use(handleCtx);

    await init(options);

    app.listen(options.port, () => {
        console.log('blog serve is open at port: ' + options.port);
    });
}

module.exports = {
    blogServe,
    defautOptions
};
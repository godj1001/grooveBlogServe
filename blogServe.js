const MarkdownIt = require('markdown-it');
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
const hljs = require('highlight.js');
const defautOptions = {
    markdownFilePath: path.join(__dirname, './markdown'),
    htmlOutputPath: path.join(__dirname, './html'),
    templateHtmlPath: path.join(__dirname, './template/template.html'),
    ossPath: '',
    homePagePath: '',
    transformPath: path.join(__dirname, './sidebar.json'),
    location: 'http://groove-zhang.cn/'
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


    function transformMarkdown2Html(markdownContent) {
        let renderCore = new MarkdownIt({
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
        return renderCore.render(markdownContent);
    }

    function buildHrefPath(htmlPath, deep) {
        const htmlPathList = htmlPath.split('/');
        return htmlPathList.slice(htmlPathList.length - deep - 1).join('/');
    }
    //  
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

    async function readMarkdownFile(markdownFilePath) {
        const markdownBuffer = await fs.readFileSync(markdownFilePath);
        return markdownBuffer.toString();
    }


    async function saveTransformResultForHtml(htmlPath, htmlContent) {
        const res = await fs.writeFileSync(htmlPath, htmlContent);
        return res;
    }

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

    async function init(options) {
        await removeDir(options.htmlOutputPath);
        const markdownDirContentInfoList = await getMarkdownDirContent(options.markdownFilePath);
        let sidebar = buildSidebar(markdownDirContentInfoList);
        const sidebarCode = buildSidebarCode(sidebar);
        for (let markdownInfo of markdownDirContentInfoList) {
            markdownInfo.sidebarCode = sidebarCode;
            handleMarkdownInfo(markdownInfo, sidebarCode);
        }
    }

    await init(options);
}

module.exports = {
    blogServe,
    defautOptions
};
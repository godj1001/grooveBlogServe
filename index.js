const Koa = require('koa');
const app = new Koa();
const tool = require('./utils/index.js');
const path = require('path');
const {readFileSync} = require('fs');

app.use(async ctx => {
    const content = await readFileSync(path.join(__dirname, ctx.path));
    let pathList = ctx.path.split('/');
    if (pathList.includes('oss')) {
        if (pathList[pathList.length - 1].indexOf('.svg') > -1) {
            ctx.type = 'svg';

            ctx.body = content.toString();
        } else {
            ctx.body = content;
        }
        return;
    }
    ctx.body = content.toString();
});

async function init() {
    // rm html file
    await tool.removeDir(path.join(__dirname, './html'));
    // build markdown handler 
    const markdownDirContentInfoList = await tool.getMarkdownDirContent(path.join(__dirname, './markdown'));
    let sidebar = tool.buildSidebar(markdownDirContentInfoList);
    const sidebarCode = tool.buildSidebarCode(sidebar);
    for (let markdownInfo of markdownDirContentInfoList) {
        markdownInfo.sidebarCode = sidebarCode;
        tool.handleMarkdownInfo(markdownInfo, sidebarCode);
    }
}

init();

//  启动服务
app.listen(3000);
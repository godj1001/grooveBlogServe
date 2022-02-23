const Koa = require('koa');
const app = new Koa();
const path = require('path');
const {readFileSync} = require('fs');
const {blogServe} = require('./blogServe');
const logger = require('koa-logger');
app.use(logger());
app.use(async ctx => {
    if (ctx.path === '/') {
        const content = await readFileSync(path.join(__dirname, '/html/about.html'));
        ctx.body = content.toString();
        return;
    }
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
    try {
        const content = await readFileSync(path.join(__dirname, ctx.path));
        ctx.body = content.toString();
    } catch (e) {
        const fail = await readFileSync(path.join(__dirname, './html/404.html'));
        ctx.body = fail.toString();
    }
});

blogServe({
    // location: 'http://localhost:3000/'
});

//  启动服务
app.listen(3000, () => {
    console.log('serve is open in 3000');
});
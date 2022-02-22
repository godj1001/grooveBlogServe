const Koa = require('koa');
const app = new Koa();
const path = require('path');
const {readFileSync} = require('fs');
const {blogServe} = require('./blogServe');
app.use(async ctx => {
    if (ctx.path === '/') {
        const content = await readFileSync(path.join(__dirname, '/html/about.html'));
        ctx.body = content.toString();
        return;
    }
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

blogServe({
    // location: 'http://localhost:3000/'
});

//  启动服务
app.listen(3000);
console.log('serve is open in 3000');
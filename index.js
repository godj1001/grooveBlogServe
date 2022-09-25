const {blogServe} = require('./blogServe');

const argv = process.argv.slice(2)


blogServe({
    location: argv.includes('local')?undefined: 'http://groove-zhang.cn/'
});

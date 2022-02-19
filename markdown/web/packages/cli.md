## 前言
最近开发并不繁忙，顺手学学如何写一个脚手架。那好，我们来看看脚手架的定义。

> 脚手架必须按照楼层与结构，垃圾牢固，垃圾点的垂直距离不能够超过4米，水平距离不能够超过6米。脚手架垃圾所使用的材料强度不能够低于两根8号钢丝的强度，高大的架子不能够使用柔性材料进行连接。脚手架的操作面必须铺满脚，手板离墙面不能够大于20厘米，不能够有空隙和探头板非跳板。脚手板下层要设置水平网操作面外设置两道防护栏杆和一道挡脚板或设置一道护身栏杆，挂上安全网。脚手架必须保证整体结构不变形，高度在20米以上的脚手架纵向必须设置十字盖，宽度不能够超过7根，立杆离水平角角最好为45度到60度。

emmm，好像哪里出了点问题。虽然咱是农民工，但是工种还是不太一样。

> 在计算机中使用的脚手架指的是两种技术之一：第一种是与某些MVC框架中的数据库访问相关的代码生成技术；第二种是由各种工具支持的项目生成技术。

咱们大多认知上的脚手架大概就是这个意思吧。

## 写一个脚手架到底多么容易
接下来，进入主题： 写一个脚手架到底多么容易。

创建一个文件，index.js、然后进行 npm init。

我们可以看到在package.json中加入这么一个值 - bin。
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/80036902edb14848b80d8a0c24de3815~tplv-k3u1fbpfcp-watermark.image)
然后在index.js文件的开头加入
```
#! /usr/bin/env node
```
那么它是什么呢？

`#！`这个符号通常在第一行开头中出现，用于指明这个脚本文件的解释程序。
`/usr/bin/env`就是告诉系统可以在PATH目录中查找，所以配置`#!/usr/bin/env node`, 就是解决了不同的用户node路径不同的问题，可以让系统动态的去查找node来执行你的脚本文件。
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/339168fed16d407098665f2bcf40433a~tplv-k3u1fbpfcp-watermark.image)

我们使用 `npm link`来做本地调试。

接下来 见证奇迹的时候到了。
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b151004db4eb4e67a4fefcadf70c41aa~tplv-k3u1fbpfcp-watermark.image)

哦吼~ 这难道就是最基础的脚手架了么！！

## 脚手架相关的三方依赖库（一部分）

| 名称 | 简介 |
| --- | --- |
|[ commander ](https://www.npmjs.com/package/commander)| 命令行自定义指令，也是大多脚手架都会使用的工具 |
| [inquirer](https://www.npmjs.com/package/inquirer)| 提供问答式的命令行交互方法，可以收集获取命令行的回答的结果，然后进行操作 |
| [chalk](https://www.npmjs.com/package/chalk) | 命令行多彩打印，谁不想拥有一个骚的飞起的脚手架|
| [cross-spawn](https://www.npmjs.com/package/cross-spawn) | 一个跨平台的命令执行的解决方案 |

还有很多优秀的三方依赖库，这里就不多说了，上述的几个三方库会在后文中有所用到。

## 实现一个可以初始化项目的脚手架
看到可以如此简单的实现一个脚手架，工友们有没有手痒啊。那咱们开始实现一个脚手架最基本的功能，初始化项目。
### 接受参数
首先，我们先实现 命令行自定义指令，用到的三方库的就是 `commander`。

```
yarn add commander
```

```javascript
// 引入commander
const program = require('commander')
// 声明命令行指令 
program.command('create <project-name>').alias('c')
       .description('create a new project')
       .action((name)=> {
           console.log(name)
       })
// 开启命令行解析
program.parse(process.argv)
```
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b054906f67d74b1aa856be8708eab508~tplv-k3u1fbpfcp-watermark.image)

### 远程下载模板
在远程下载模板这块，我们使用`cross-spawn`，实现一个运行命令方法。【核心的原理就是 使用 git clone 命令来实现远程下载】
```
function runCommand({ cmd, args, cwd = process.cwd() }) {
  try {
    const res = spawn.sync(cmd, args, {
      cwd,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

```
然后在原来定义的命令行事件中加入如下代码
```
...
// 构建地址
const path = `${process.cwd()}/${name}`;
// 运行下载指令
runCommand({
  cmd: 'git',
  args: [
    'clone',
    gitUrl,
    `${path}/`
  ]
})
...
```
运行一下看一下效果。

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/15a7dcc967fe4ecab66c69bba6970bed~tplv-k3u1fbpfcp-watermark.image)

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/27ad351f93114afcb439357e7071adcd~tplv-k3u1fbpfcp-watermark.image)

到这里，我们大概实现了一个下载远程模板的脚手架了。

## 总结
写一个脚手架真的不是一个难事，开发的难点也大多是在代码堆积上，不过 灵巧的使用三方库，可以事半功倍。一个适合自己，自己十分了解的脚手架，对于开发绝对是一把利刃。

最后 留一个自己刚写的脚手架 - 能够快速定位和切换项目，里面录入了一点点自己的文件模板和项目模板，有想用的工友可以看看。
> 传送门 [groove-cli](https://www.npmjs.com/package/groove-cli) 

# groove-cli 中文文档
致力于打造优质的前端开发体验，简化开发过程中无效的工作，根据项目提供更多的帮助和服务。

## 安装
```
npm install groove-cli -g 
yarn add groove-cli -g 
```

## 功能

| command         | argv         | descript                         |
| --------------- | ------------ | -------------------------------- |
| log             | NULL         | 打印 groove-cli 中的所有操作记录 |
| remove-log      | NULL         | 清除操作记录                     |
| add             | app-name     | 记录当前路径，记作快速访问路径   |
| remove          | app-name     | 清除指定路径                     |
| checkout        | app-name     | 快速切换终端路径，切换到项目地址 |
| list            | NULL         | 展示所有项目路径记录             |
| init            | project-name | 初始化新项目                     |
| save-template   | project-name | 将本地项目存为模板               |
| remove-template | project-name | 移出指定本地项目模板             |
| list-templat    | NULL         | 展示本地所有项目模板             |
| init-page       | page-name    | 初始化react page 页面            |
| web-serve       | NULL         | 可视化项目管理                   |

使用方式：
```
groove log 
```

## 未来规划
* 接入微前端相关内容
  * 支持创建微服务主项目
  * 支持创建微服务子项目
  * 自动添加依赖
* 推荐包管理
* 前端包管理相关内容
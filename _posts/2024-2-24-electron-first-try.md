---
layout:     post
title:      "electron-first-try"
subtitle:   " \"Hello World, Hello Blog\""
date:       2024/2/24
author:     "David"
header-img: "img/snow.jpg"
catalog: true
tags:
    - Meta
---

这一篇博客是关于如何将通过 Html,Css,JavaScripts 原生开发的网页打包成 exe 文件的教程，在这个过程中踩了许多的坑，总结一下，以便以后来使用。

### 第一步

确保已经安装了Node.js（包含npm），在项目根目录下打开终端预览，运行`npm init`，这将在项目目录中创建一个package.json文件。

### 第二步

使用以下命令来安装Electron依赖

`npm install electron --save-dev`

### 第三步

在项目根目录中创建一个名为 main.js 的文件，作为 Electron 应用程序的入口文件，然后在其中添加以下代码：(复制即可)

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
 
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
 
  const indexPath = url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  });
 
  win.loadURL(indexPath);
}
 
app.whenReady().then(createWindow);
 
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
 
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
// 这个文件将创建一个 Electron 窗口并加载您的项目的 index.html 文件。
```

### 第四步 

修改package.json文件，将 main 属性更改为 "main": "main.js"，然后在 scripts 属性中添加一个新的 start 脚本

```javascript
{
	"name": "jiujinji",
	"version": "1.0.0",
	"description": "",
	"main": "main.js",             //这里
	"scripts": {
		"start": "electron .",     // 这里
		"test": "echo \"Error: no test specified\" && exit 1",
	},
	"author": "",
	"license": "ISC",
	"devDependencies": {
		"electron": "^24.1.2",
	}
}
//使用以下命令运行 Electron 应用程序并确保一切正常：npm start
//此命令将启动 Electron 应用程序，您应该能够看到您的项目在新窗口中运行。
```

### 第五步

使用以下命令来安装 Electron Builder，用于将项目打包成可执行文件

`npm install electron-builder --save-dev`

在 package.json 文件中添加 build 配置和 dist 脚本

```javascript
{
  "name": "tengfeibei",
  "version": "1.0.0",
  "description": "",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "test": "echo \"Error: no test specified\" && exit 1",
    "dist": "electron-builder"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "electron": "^28.2.1",
    "electron-builder": "^24.12.0"
  },
  "build": {
    "electronDownload": {
      "mirror": "https://npmmirror.com/mirrors/electron/"
    },
    "appId": "com.example.your-app",
    "win": {
      "target": "nsis"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}

```

### 第六步

运行命令

`npm run dist`

## 实际过程中遇到的问题

#### 1、镜像源过期

2024年1 月 22 日，淘宝原镜像域名（registry.npm.taobao.org）的 [HTTPS](https://so.csdn.net/so/search?q=HTTPS&spm=1001.2101.3001.7020) 证书正式到期。这就导致旧的 npm 淘宝镜像在使用时出错了。

**解决方法：将npm淘宝源切换到新的镜像域名**

```c
//清空缓存
npm cache clean --force
//切换新源
npm config set registry https://registry.npmmirror.com
//查看源是否设置成功
npm config get registry
```

切换不生效的原因：项目根目录中写了.npmrc文件这个文件是配置npm远程镜像地址的，**优先级高于命令行设置**

### 2、下载 winCodeSign-2.6.0、 nsis-3.0.4.1 失败

具体操作方法是将这两个文件直接去GitHub下载下来，然后放到C盘里AppData的Cache文件夹里，具体操作见博客

`https://blog.csdn.net/wanghuasunyong/article/details/132520207?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522170870922916800182186628%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=170870922916800182186628&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~baidu_landing_v2~default-2-132520207-null-null.142^v99^pc_search_result_base5&utm_term=winCodesign%E4%B8%8B%E8%BD%BD%E5%A4%B1%E8%B4%A5&spm=1018.2226.3001.4187`

`https://blog.csdn.net/yusha123/article/details/114929834?ops_request_misc=&request_id=&biz_id=102&utm_term=winCodesign%E4%B8%8B%E8%BD%BD%E5%A4%B1%E8%B4%A5&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-1-114929834.142^v99^pc_search_result_base5&spm=1018.2226.3001.4187`


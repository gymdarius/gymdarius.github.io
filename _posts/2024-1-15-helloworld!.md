---
layout:     post
title:      "Hello World!"
subtitle:   " \"Hello World, Hello Blog\""
date:       2024/1/15
author:     "David"
header-img: "img/snow.jpg"
catalog: true
tags:
    - Meta
---

> The First Blog

这是我第一篇博客，也宣布我拥有了自己的博客，非常有意义，希望以后可以多在上面写点东西，分享点感悟。今天先把自己如何搭建博客的历程梳理一下，大家想搭建的可以参考参考。

> 首先要感谢[Huxpro](https://github.com/huxpro)提供的模板
>
> [我的博客](https://gymdarius.github.io/)

首先，先快速总览一下搭建自己博客的教程

1. 注册一个GitHub账号，注册完成后进入[Huxpro](https://github.com/Huxpro/huxpro.github.io)的仓库，将该仓库fork下来
2. fork成功后，修改仓库名，进入settings，修改为`你的Github账号名.github.io`，在仓库名修改正确以后，在浏览器中输入`你的Github账号名.github.io`，便可以看到博客页面显示出来了，成功完成了一半hh，接下来就是要修改其中的内容，来使这个博客变成自己的博客了。
3. 关于修改网页里的内容，可以直接在github仓库中实现，也可以pull到本地来修改，我是用后一种方法来实现的，这样顺便锻炼一下自己的git能力
4. 关于修改网页展示格式
5. 关于修改博客文章
6. 关于修改自我介绍
7. 关于在本地预览网页

[TOC]

# 注册账号，fork仓库

注册一个GitHub账号，注册完成后进入[Huxpro](https://github.com/Huxpro/huxpro.github.io)的仓库，将该仓库fork下来

# 修改设置，成功一半

fork成功后，修改仓库名，进入settings，修改为`你的Github账号名.github.io`，在仓库名修改正确以后，在浏览器中输入`你的Github账号名.github.io`，便可以看到博客页面显示出来了，成功完成了一半hh，接下来就是要修改其中的内容，来使这个博客变成自己的博客了。

# 修改内容，化为己用

关于修改网页里的内容，可以直接在github仓库中实现，也可以pull到本地来修改，我是用后一种方法来实现的，这样顺便锻炼一下自己的git能力

# 修改格式
根据原项目的文档，可以按照自己的需求来设计，目前我的修改主要是修改图片方面，其他CSS、JS格式还没有想法，同时也感觉自己的审美比较差劲。
# 修改文章+图片
有一个rake命令,可以快速生成一篇md格式的博客，只不过需要修改一下配置文件才好用，直接去看rake的文档。

`rake post title="Title" subtitle="Hello World, Hello Blog"`

# 修改自我介绍
在/_includes/about里面两篇里面修改
# 本地预览网页+图片

直接`jekyll serve`可以本地预览看到效果



所有的修改实现后，记得

`git add . `

`git commit -m "20240911-modify01"`

`git push`
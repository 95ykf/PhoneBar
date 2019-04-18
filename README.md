## 九五云客服话条SDK
电话条SDK对底层通讯和上层业务逻辑深度封装，简化WEB页面集成流程，降低WEB编程难度。开放话务API和基础通话事件，可灵活自定义个性化功能。

文档：[集成解决方案](https://github.com/95ykf/PhoneBar/blob/master/doc/%E9%B8%BF%E8%81%94%E4%B9%9D%E4%BA%94%E4%BA%91%E5%AE%A2%E6%9C%8D-%E7%94%B5%E8%AF%9D%E6%9D%A1%E9%9B%86%E6%88%90%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88.docx)

## 使用方法

### 引用文件
需要引用的js和css可以通过releases下载，也可以通过npm run build:prod命令重新打包获得。
```html
<!--引入css-->
<link rel="stylesheet" type="text/css" href="./css/PhoneBar.css">
<!--引入js-->
<script src='./PhoneBar.js'></script>
```
### 创建组件
创建组件时需要配置服务器信息、坐席信息、坐席配置信息和自定义事件回调等，该组件提供了默认配置，可以只写入服务器连接和坐席账号即可生成电话条。如下示例：
```javascript
phoneBar = new PhoneBar({
    renderTo: 'test1',
    proxyUrl: 'ws://192.168.1.111:8787/websocket',
    sipServerUrl: '192.168.1.111:5188',
    startupSoftPhone: true,
    tid: 'xxxxx',
    thisDN: 'xxxxx',
    agentID: 'xxxxx',
    password: 'xxxxx',
    thisQueues: ['xxxxx', 'xxxxx'],
    defaultQueue: 'xxxxx'
})
```
![示例图片](https://github.com/95ykf/PhoneBar/blob/master/doc/phonebar.png)

## 开发
### 安装
```
npm install
```
### 启动调试
```
npm start
```
### 构建打包
构建用于生产环境
```
npm run build:prod
```
构建用于开放环境
```
npm run build:dev
```


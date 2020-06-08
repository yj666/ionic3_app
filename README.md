2020了还在用ionic3...  说多了都是泪。
要求做一个检查更新的功能，这是app基本的功能，在网上找了很多关于ionic3的相关，绕了很多弯，现在整理出来，供大家参考

## 1. 开发环境搭建

安装 ionic, cordova

```bash
npm install -g ionic@3.20.0
npm install -g cordova
```

下载项目源代码至本地

```bash
git clone https://github.com/yj666/ionic3_app.git
cd ionic3_app
npm install
```

启动项目

```bash
ionic serve
```

## 2.ionic快速集成极光推送

[PhoneGap 的插件文档地址](https://github.com/jpush/jpush-phonegap-plugin)

通过 Cordova Plugins 安装，要求 Cordova CLI 5.0+：

请先安装 v1.2.0 以下版本（建议安装 v1.1.12）的 cordova-plugin-jcore，再安装旧版本插件（比如 v3.3.2），否则运行会报错。
```bash
cordova plugin add cordova-plugin-jcore@1.1.12
```

```bash
cordova plugin add jpush-phonegap-plugin@3.3.2 --variable APP_KEY=your_jpush_appkey
```


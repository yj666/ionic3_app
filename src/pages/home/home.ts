import { Component } from '@angular/core';
import { NavController, LoadingController, Platform, AlertController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { FileOpener } from '@ionic-native/file-opener';
import { NgZone } from '@angular/core';
import { File } from '@ionic-native/file'
// import { SharedDataServiceProvider } from '../../share/shared-data.service';
import { UpdateService } from '../../core/service/update.service';
import { SharedDataServiceProvider } from '../../share/shared-data.service';

declare var window: any;
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  version_data: any;
  msgList: Array<any> = [];

  constructor(
    public navCtrl: NavController,
    private inAppBrowser: InAppBrowser,
    public Share: SharedDataServiceProvider,
    private fileOpener: FileOpener,
    private zone: NgZone,
    private loadingCtrl: LoadingController,
    private file: File,
    private platform: Platform,
    private alertCtrl: AlertController,
    private updateService: UpdateService
  ) {

  }

  async ionViewDidLoad() {
    this.initJPush()
  }
  //启动极光推送
  initJPush() {
    if (window.plugins && window.plugins.jPushPlugin) {
      window.plugins.jPushPlugin.init()
      document.addEventListener("jpush.receiveNotification", () => {
        this.msgList.push({ content: window.plugins.jPushPlugin.receiveNotification.alert })
      }, false)
    }
  }

    //检查app是否需要升级
    update() {
      this.updateService.getVersion().then(data => {
        this.version_data = data.item
        // 判断当前版本号否大于服务器的版本号
        let serveVersion = data.item.versionName
        console.log(serveVersion)
        console.log(this.Share.appVersion)
        if (this.version(serveVersion, this.Share.appVersion)) {
          console.log("检查到新版本，是否更新APP")
          this.update_alert()
      } else {
          this.latest_alert()
        }
      })
    }
  
    //更新版本弹框
    update_alert() {
      let alert1 = this.alertCtrl.create({
        title: '检查到新版本可以安装',
        message: this.version_data.content,
        buttons: [
          {
            text: '下次再说',
            role: 'cancel',
            handler: () => {
              console.log('不进行更新')
            }
          },
          {
            text: '安装',
            handler: () => {
              console.log('更新APP')
              let url = 'http://youjianwu.com.cn/android/youjianwu.apk'
              console.log(url)
              if (this.isIos()) {
                console.log('打开iOS下载地址----------------------------')
                this.inAppBrowser.create('https://apps.apple.com/cn/app/%E6%9C%89%E9%97%B4%E5%B1%8B/id1506014513', '_system')
              } else {
                console.log('开始下载Android代码----------------------------')
                this._xhr()
              }
            }
          }
        ]
      })
      alert1.present()
    }
  
    //已是最新版弹框
    latest_alert() {
      let alert2 = this.alertCtrl.create({
        message: '已是最新版本',
        buttons: ['确定'],
      })
      alert2.present()
    }
  
    //下载apk请求
    _xhr() {
      const xhr = new XMLHttpRequest()
      let url = 'http://youjianwu.com.cn/android/youjianwu.apk'
      xhr.open("GET",url)
      xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded")
      xhr.responseType = "blob"
      
      xhr.addEventListener("progress", (ev) => {
        // 下载中事件：计算下载进度
        let downloadProgress =  Math.floor((ev.loaded / ev.total) * 100)
        console.log('当前进度为：' + downloadProgress)
        let loadProgress = this.loadingCtrl.create({
          spinner: 'ios',
          content: "下载：0%",
          cssClass: "loadingProgress"
        })
        if(downloadProgress != 0) {
          //同步修改loading显示的进度值
          this.zone.run(() => {
            loadProgress.setContent("下载："  + downloadProgress + "%")
            loadProgress.present()
          })
          console.log("downloadProgress:" + downloadProgress)
        }
        //进度为100消失
        if(downloadProgress == 100) {
          loadProgress.dismiss()
        }
      })
      xhr.addEventListener("load", (ev) => {
          console.log(ev)
          // 下载完成事件：处理下载文件
          var blob = xhr.response;
          console.log(blob)
      })
      xhr.addEventListener("loadend", (ev) => {
        // 结束下载事件：下载进度条的关闭
        console.log('结束下载事件：下载进度条的关闭', ev)
      });
      xhr.addEventListener("error", (ev) => {
        console.log(ev);
      })
      xhr.addEventListener("abort", () => {
      })
      xhr.send()
  
  
      xhr.addEventListener("load", () => {
        // 下载完成事件：处理下载文件
        const blob = xhr.response; 
        const fileName = 'youjianwu.apk'
        console.log(blob)
        if(blob){
          let path = this.file.externalDataDirectory;
          this.file.writeFile(path, fileName, blob, {
            replace: true
          }).then(()=>{
            // window.cordova.plugins.FileOpener.openFile(path + 'temp.apk', ()=>alert('success'), (err)=>console.log(err));
            this.fileOpener.open(
              path + fileName, 
              'application/vnd.android.package-archive'
            );
          }).catch(err=>{
            console.log('报错' + err)
          })
        }
      })
    }
  
    // 比较版本号
    version (a: string, b: string) {
      var _a = this.toNum(a), _b = this.toNum(b)
      if(_a == _b) {
        console.log("版本号相同！版本号为："+a)
        return false
      } else if(_a > _b) {
        console.log("版本号"+a+"是新版本！")
        return true
      } else {
        console.log("版本号"+b+"是新版本！")
        return false
      }
    }
  
    toNum (a: string) {
      var a = a.toString()
      //也可以这样写 var c=a.split(/\./)
      var c = a.split('.')
      var num_place = ["","0","00","000","0000"], r = num_place.reverse()
      for (var i = 0; i< c.length; i++) {
        var len = c[i].length
        c[i] = r[len] + c[i]
      }
      var res = c.join('')
      return res;
    }
  
    /**
       * 是否真机环境
       * @return {boolean}
       */
      isMobile(): boolean {
        return this.platform.is('mobile') && !this.platform.is('mobileweb')
    }
  
    /**
     * 是否android真机环境
     * @return {boolean}
     */
    isAndroid(): boolean {
        return this.isMobile() && this.platform.is('android')
    }
  
    /**
     * 是否ios真机环境
     * @return {boolean}
     */
    isIos(): boolean {
        return this.isMobile() && (this.platform.is('ios') || this.platform.is('ipad') || this.platform.is('iphone'))
    }

}

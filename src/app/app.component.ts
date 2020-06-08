import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { SharedDataServiceProvider } from '../share/shared-data.service';
import { AppVersion } from '@ionic-native/app-version';
import { Device } from '@ionic-native/device';
import { File } from '@ionic-native/file';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = TabsPage;

  constructor(
    private platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen,
    private appVersion: AppVersion,
    private Share: SharedDataServiceProvider,
    private file: File,
    private device: Device,
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
  appStart() {
    return this.platform.ready().then(() => {

      /*储存版本信息及判断存储路径开始*/
      // 读取所用的平台
      //获取当前平台信息   this.device.platform
      this.appVersion.getVersionNumber().then(data => {
        //当前app版本号  data，存储该版本号
        this.Share.appVersion = data
        console.log(data)
      }, 
      // error => console.error((error: any) => {
      //   //获取当前版本号失败进行的操作
      // })
      )
      this.appVersion.getPackageName().then(data => {
        //当前应用的packageName：data，存储该包名
        this.Share.packageName = data
        console.log(data)
      }, 
      // error => console.error((error: any) => {
      //   //获取该APP id 失败
      // })
      )

      this.Share.platform = this.device.platform;
      this.Share.savePath = this.Share.platform == 'iOS' ? this.file.documentsDirectory : this.file.externalDataDirectory
      //存储的沙盒地址：this.Share.savePath
    })
  }
}

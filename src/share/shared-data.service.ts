import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class SharedDataServiceProvider {
  platform: string; //平台
  savePath: string; //存储路径

  packageName: string;  //包名
  appVersion: string = '1.5';  //版本号

    constructor(public http: HttpClient) {
        
    }

}

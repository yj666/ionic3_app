    import { Injectable } from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import 'rxjs/add/operator/timeout';
    import { HttpErrorResponse } from '@angular/common/http';
    import { Network } from '@ionic-native/network';
    import { Storage } from '@ionic/storage';
    import { Events, Platform, LoadingController, App } from 'ionic-angular';

    import * as md5 from 'md5';
    /**
     * ApiService
     *
     * @export
     * @class ApiService
     */
    @Injectable()
    export class ApiService {
    /**
     * 当前浏览器的域名
     */
    public host: string = ``;
    private queue = new Map<string, Promise<any>>();
    private isconnect: boolean = false; // 网络是否链接
    constructor(
        private events: Events,
        private http: HttpClient,
        private network: Network,
        public storage: Storage,
        private platform: Platform,
        public loadingCtrl: LoadingController,
        public app: App,
        // private toastCtrl: ToastController
    ) {
        this.platform.ready().then(source => {
        if (source == 'cordova') {
            this.host = '' //接口地址
        } else {
            this.host = ``; // pwa
        }
        });
        // 监听断网事件
        this.network.onDisconnect().subscribe(() => {
        this.isconnect = false;
        });
    }

    /**
     * 判断是否链接网络
     *
     * @returns {boolean}
     * @memberof ApiService
     */
    private _hasNetwork(): boolean {
        if (this.network.type === 'none') {
        this.isconnect = false;
        return false;
        }
        this.isconnect = true;
        return true;
    }
    /**
     * 请求后台api的统一接口
     *
     * @param {string} url 请求的url
     * @param {any} [body] 请求的参数
     * @returns {Promise<any>}
     * @memberof PlatformService
     */
    async post(url: string, body?: any): Promise<any> {
        let storageKey: string = url;
        if (body) {
        let { access_token, ...storageKeyBody } = body;
        storageKey = storageKey + md5(JSON.stringify(storageKeyBody));
        }
        // 同一时间内相同请求不重复发送
        let promise = this.queue.get(storageKey);
        if (promise != undefined) {
        return promise;
        }
        if (this.isconnect || this._hasNetwork()) {
        promise = new Promise(async (resolve, reject) => {
            await this.platform.ready();
            //加载数据中
            // let loading = this.loadingCtrl.create({
            //   content: '加载数据中...'//数据加载中显示
            // });
        //显示等待样式
        // loading.present();
            this.http
            .post(this.host + url, body)
            .timeout(30000)
            .subscribe(
                (data: any) => {
                if (data.is_success) {
                    this.storage.set(storageKey, data);
                    resolve(data);
                } else {
                    if (data.code == '98') {
                    let _body = body;
                    Promise.all([this.storage.get('username'), this.storage.get('password')]).then(data => {
                        const body = { user_name: data[0], password: md5(data[1]), type: 1 };
                        this.http.post(this.host + '/customer/user/login', body).subscribe((data: any) => {
                        let access_token = data['access_token'];
                        _body.access_token = access_token;
                        _body._retry = Date.now();
                        this.events.publish('api:relogin', access_token);
                        this.post(url, _body).then(data => resolve(data));
                        });
                    });
                    } else {
                    reject(data);
                    }
                }
                //当数据加载完成后，影藏等待样式
                // loading.dismiss();//显示多久消失
                },
                (err: HttpErrorResponse) => {
                // access_token失效，重新获取
                if (err.status === 401 || err.status === 500) {
                    // this.app.getRootNavs()[0].setRoot(LOGIN_PAGE)
                    // this.toastCtrl.create({ message: '请重新登录', duration: 3000, position: 'top' }).present();
                    // let _body = body;
                    // Promise.all([this.storage.get('username'), this.storage.get('password')]).then(data => {
                    //   const body = { user_name: data[0], password: md5(data[1]), type: 1 };
                    //   this.http.post(this.host + '/customer/user/login', body).subscribe((data: any) => {
                    //     let access_token = data['access_token'];
                    //     _body.access_token = access_token;
                    //     _body._retry = Date.now();
                    //     this.events.publish('api:relogin', access_token);
                    //     this.post(url, _body).then(data => resolve(data));
                    //   });
                    // });
                } else if (err.error instanceof Error) {
                    reject({ message: `客户端错误!${err.error.message}` });
                } else {
                    reject({ message: `服务器错误!${err.status}` });
                }
                }
                
            );
        });
        } else {
        promise = new Promise((resolve, reject) => {
            this.storage.get(storageKey).then(data => {
            if (data) {
                resolve(data);
            } else {
                reject(new Error(`网络未连接`));
            }
            });
        });
        }

        this.queue.set(storageKey, promise);
        // 请求完成后，把请求从队列中移除，这样下次同样的请求来了可以正常去请求后台
        promise
        .then(() => {
            this.queue.delete(storageKey);
        })
        .catch(() => {
            this.queue.delete(storageKey);
        });
        return promise;
    }
    
}

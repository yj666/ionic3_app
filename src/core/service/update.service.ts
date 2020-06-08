import { Injectable } from '@angular/core';

import { ApiService } from './api.service';
import "rxjs/add/operator/map";

    @Injectable()
    export class  UpdateService {
    constructor(private apiService: ApiService) {}

    //获取当前最新版本
    async getVersion() {
        const data = await this.apiService.post('/global/getLasterVersion')
        return data;
    }

}

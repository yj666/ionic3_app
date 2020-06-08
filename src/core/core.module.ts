import { ModuleWithProviders, NgModule } from '@angular/core';
import { SharedDataServiceProvider } from '../share/shared-data.service'
import { ApiService } from './service/api.service';
import { UpdateService } from './service/update.service';
    const PROVIDERS = [
        SharedDataServiceProvider,
        ApiService,
        UpdateService
    ];
    // 核心模块，只提供服务，只能在appModule中依赖一次
    @NgModule({})
    export class CoreModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CoreModule,
            providers: [...PROVIDERS]
        };
    }
}

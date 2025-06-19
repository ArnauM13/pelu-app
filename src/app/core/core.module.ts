import { NgModule, Optional, SkipSelf } from '@angular/core';

@NgModule({})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule ja està carregat. Importa’l només un cop, a AppModule.');
    }
  }
}

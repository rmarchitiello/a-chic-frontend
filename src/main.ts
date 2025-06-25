// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

import { environment } from './environments/environment';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';

/* In produzione azzera i log della console per evitare di mostrare informazioni sensibili */
if (environment.production) {
  console.log  = () => {};
  console.warn = () => {};
  console.error= () => {};
}

console.log('Avvio Angular con environment:', environment);

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    /* provider già definiti in app.config.ts */
    ...(appConfig.providers || []),

    /* Abilita le animazioni Angular Material / Angular Core */
    provideAnimations(),

    /* Espone HttpClient e collega gli interceptor registrati nel DI */
    provideHttpClient(withInterceptorsFromDi()),

    /* Registra l’interceptor basato su classe nel dependency-injection */
    {
      provide : HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi   : true      // mantiene eventuali altri interceptor
    }
  ]
}).catch(err => console.error(err));

import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// ✅ Importa il file environment per sapere se sei in produzione
import { environment } from './environments/environment';

// ✅ Se sei in produzione, disabilita i log
if (environment.production) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

console.log('Avvio Angular con environment:', environment);

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideAnimations()
  ]
}).catch((err) => console.error(err));

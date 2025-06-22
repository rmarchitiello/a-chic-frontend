import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CloudinaryComponent } from './pages/cloudinary/cloudinary.component';
import { ChiSiamoComponent } from './pages/chi-siamo/chi-siamo.component';
import { RecensioniComponent } from './pages/recensioni/recensioni.component';
import { ContattiComponent } from './pages/contatti/contatti.component';
import { CookiePolicyComponent } from './pages/cookie-policy/cookie-policy.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { CmsLoginComponent } from './cms/cms-login/cms-login.component';


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'chi-siamo', component: ChiSiamoComponent },
  { path: 'recensioni', component: RecensioniComponent },
  { path: 'contatti', component: ContattiComponent },
  { path: 'cookie-policy', component: CookiePolicyComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'cms-login', component: CmsLoginComponent },

  // route con 1 parametro: solo categoria
  { path: ':categoria', component: CloudinaryComponent },
  // route con 2 parametri: categoria + sottoCategoria
  { path: ':categoria/:sottoCategoria', component: CloudinaryComponent },


];



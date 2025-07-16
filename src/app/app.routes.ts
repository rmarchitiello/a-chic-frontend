import { Routes } from '@angular/router';

// Import dei componenti del sito pubblico
import { HomeComponent } from './pages/home/home.component';
import { CloudinaryComponent } from './pages/cloudinary/cloudinary.component';
import { ChiSiamoComponent } from './pages/chi-siamo/chi-siamo.component';
import { ContattiComponent } from './pages/contatti/contatti.component';
import { CookiePolicyComponent } from './pages/cookie-policy/cookie-policy.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';

// Import dei componenti del CMS
import { CmsLoginComponent } from './cms/cms-login/cms-login.component';
import { CmsDashboardComponent } from './cms/cms-dashboard/cms-dashboard.component';
import { CmsMediaComponent } from './cms/cms-media/cms-media.component';
import { CmsUploadComponent } from './cms/cms-upload/cms-upload.component';
import { AuthGuard  } from './auth.guard'; //serve per bloccare tutte le chiamate se non ci siamo prima loggati
import { LoginAdminComponent } from './admin/login-admin/login-admin.component';

export const routes: Routes = [
  // Redirect iniziale alla home
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Pagine statiche pubbliche
  { path: 'home', component: HomeComponent },
  { path: 'chi-siamo', component: ChiSiamoComponent },
  { path: 'contatti', component: ContattiComponent },
  { path: 'cookie-policy', component: CookiePolicyComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },

  // Pagina di login del CMS
  { path: 'cms-login', component: CmsLoginComponent },

  // Area CMS con routing separato (dashboard)
  {
    path: 'cms',
    children: [
      { path: 'dashboard', component: CmsDashboardComponent, canActivate: [AuthGuard] },
      { path: 'upload', component: CmsUploadComponent, canActivate: [AuthGuard] },
      { path: 'media', component: CmsMediaComponent, canActivate: [AuthGuard] }
      // Altri componenti CMS (es. upload, media) possono essere aggiunti qui in seguito
    ]
  },

  { path: 'admin', component: LoginAdminComponent },
  // Route dinamiche per categorie e sottocategorie (devono restare in fondo)
  { path: ':categoria', component: CloudinaryComponent },
  { path: ':categoria/:sottoCategoria', component: CloudinaryComponent }
];

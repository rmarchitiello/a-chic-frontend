/* ============================================================================
   AggiungiCaroselloComponent — TS semplice con Reactive Forms
   - Creo una form con i campi richiesti.
   - La sezione "plugins" è un FormGroup annidato.
   - Non uso costrutti avanzati: solo new FormGroup / new FormControl.
============================================================================= */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
// Questi tipi li prendo dalla tua codebase (li importi da dove li hai definiti)
import { AlignType, CarouselMode } from '../../../shared/factories/manage-carousel/flicking/options.factory';
import { MatDialogRef } from '@angular/material/dialog';
// L'interfaccia MakePluginsOpts la usi per capire la forma "di dominio" dei plugin.
// Per la FORM, però, ho bisogno di una mappa di CONTROLLI.
// Creo quindi un tipo molto semplice per i controlli della sezione plugins.
type PluginsForm = {
  // Tengo le cose semplici:
  // - fade: boolean
  // - arrow: boolean (se poi vorrai opzioni avanzate per Arrow, le mapperai dopo)
  // - bullet: boolean (lo userò per decidere se pagination = 'bullet' oppure false)
  // - autoplay: number (0 = disattivato; >0 = durata in ms)
  fade: FormControl<boolean>;
  arrow: FormControl<boolean>;
  bullet: FormControl<boolean>;
  autoplay: FormControl<number>;
};

// Questo è il tipo dei CONTROLLI della form principale.
// È fedele alla struttura che mi hai passato, con "plugins" come FormGroup.
type SettingCarouselForm = {
  name: FormControl<string>;
  titoloSezione: FormControl<string>;

  // Opzioni del carosello
  mode: FormControl<CarouselMode>;
  circular: FormControl<boolean>;
  align: FormControl<AlignType>;
  duration: FormControl<number>;

  // Gruppo annidato per i plugin
  plugins: FormGroup<PluginsForm>;

  // Classi CSS e flag zoom
  wrapperClass: FormControl<string>;
  panelClass: FormControl<string>;
  zoomMediaCarosello: FormControl<boolean>;
};

@Component({
  selector: 'app-aggiungi-carosello',
  standalone: true,
  imports: [    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatButtonModule,
    MatExpansionModule,
    MatTooltipModule
    ],
  templateUrl: './aggiungi-carosello.component.html',
  styleUrls: ['./aggiungi-carosello.component.scss']
})
export class AggiungiCaroselloComponent {



  constructor(private dialogRef: MatDialogRef<AggiungiCaroselloComponent>){

  }

  // 1) Creo prima il gruppo dei plugin, così è chiaro e riusabile.
  //    Metto default sensati: fade ON, arrow OFF, bullet OFF, autoplay 0 (disattivo).
  pluginsGroup: FormGroup<PluginsForm> = new FormGroup<PluginsForm>({
    fade: new FormControl<boolean>(false, { nonNullable: true }),
    arrow: new FormControl<boolean>(false, { nonNullable: true }),
    bullet: new FormControl<boolean>(false, { nonNullable: true }),
    autoplay: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(0)] }),
  });

  // 2) Creo la form principale. Ogni campo ha il suo default.
  //    Uso Validators.required dove ha senso (stringhe e select).
  form: FormGroup<SettingCarouselForm> = new FormGroup<SettingCarouselForm>({
    // Metadati UI
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[\p{L}\p{N}\s_-]+$/u)],
      
    }),
    titoloSezione: new FormControl<string>('', {
      nonNullable: true,
      // opzionale: se vuoi obbligatorio, aggiungi Validators.required
    }),

    // Opzioni carosello
    mode: new FormControl<CarouselMode>('no-scroll', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    circular: new FormControl<boolean>(false, { nonNullable: true }),
    align: new FormControl<AlignType>('center', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    duration: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),

    // Gruppo plugins annidato
    plugins: this.pluginsGroup,

    // Classi CSS (come stringa semplice; potrai splittare in array al submit)
    wrapperClass: new FormControl<string>('wrapper-carosello by-2', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    panelClass: new FormControl<string>('pannelli-carosello', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    // Flag per animazione zoom: ON = userò 'zoom-enter' in mapping
    zoomMediaCarosello: new FormControl<boolean>(false, { nonNullable: true }),
  });

  // 3) Questo metodo mostra come leggere i valori della form in modo pulito.
  //    Qui preparo il JSON "pronto per createCarousel", ESCLUDENDO "data".
  //    Tengo la logica semplice, senza casi avanzati.
  buildConfigPerCreateCarousel() {
    // Estraggo TUTTI i valori (compresi quelli del gruppo plugins).
    const raw = this.form.getRawValue();

    // Converto le stringhe di classi in array (split su spazi o virgole).
    const toClassArray = (s: string) =>
      s.split(/[\s,]+/).map(x => x.trim()).filter(Boolean);

    // Mappo "bullet" e "autoplay" ai tipi attesi da createCarousel.
    // - bullet: boolean → pagination: 'bullet' | false
    // - autoplay: number (0 = off) → false | number
    const pagination = raw.plugins.bullet ? 'bullet' : false;
    const autoplay = raw.plugins.autoplay > 0 ? raw.plugins.autoplay : false;

    // Se zoomMediaCarosello è true, uso 'zoom-enter' come classe animazione.
    const onChangedCarosello = raw.zoomMediaCarosello ? 'zoom-enter' : '';

    // Preparo l'oggetto CONFIG (senza data).
    // Questo oggetto è pronto per: createCarousel({ data: QUALCOSA, ...config })
    const config = {
      mode: raw.mode,
      circular: raw.circular,
      align: raw.align,
      duration: raw.duration,

      plugins: {
        fade: raw.plugins.fade,
        arrow: raw.plugins.arrow,
        pagination,   // 'bullet' oppure false
        autoplay,     // number oppure false
      },

      // Metadati UI e classi
      titoloSezione: raw.titoloSezione,
      wrapperTitoloSezioneClass: ['wrapper-titolo'],
      titoloSezioneClass: ['titolo'],
      wrapperClass: toClassArray(raw.wrapperClass),
      panelClass: toClassArray(raw.panelClass),

      // Animazione al cambio slide
      onChangedCarosello,
    };

    return config;
  }

  // 4) Esempio di submit minimalista:
  //    - Se la form è invalida, marco come touched e mi fermo.
  //    - Altrimenti costruisco il config e lo uso come voglio.
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const config = this.buildConfigPerCreateCarousel();

    // Qui decidi tu cosa farne:
    // - chiudere un dialog e restituire config
    // - chiamare direttamente createCarousel({ data: X, ...config })
    // - loggare per test
    console.log('CONFIG PER createCarousel (senza data):', config);
  }

  chiudiDialog(){
      this.dialogRef.close();
  }

}


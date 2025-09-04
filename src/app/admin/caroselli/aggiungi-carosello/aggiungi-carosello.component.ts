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

  

  // 4) Esempio di submit minimalista:
  //    - Se la form è invalida, marco come touched e mi fermo.
  //    - Altrimenti costruisco il config e lo uso come voglio.
  onSubmit() {
      console.log("Form value: ", JSON.stringify(this.form.getRawValue()));
  }


  chiudiDialog(){
      this.dialogRef.close();
  }

}


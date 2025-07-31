/*
  Questo componente viene utilizzato per editare i metadati (context) associati a un file.
  È usato in due casi principali:
  - Durante l'upload, per permettere all'utente di modificare i metadati prima dell'invio.
  - Per modificare i metadati di file già presenti su Cloudinary (via EditDataComponent).

  Per questo component, che deve avere una form dinamica con validazione usiamo direttamente ReactiveForm
  Vediamo che cosa sono le reactive form in angular passo dopo passo.

  A primo appunto una ReactiveForm in angular si sviluppa all'interno del typescript, ovvero supponiamo di avere una rappresentazione di un json

  Ogni singolo campo è considerato un oggetto e sul quel campo/oggetto possiamo fare logica, se è valido oppure no ecc.. Esempio grafico

  FormGroup
    │
    ├── FormControl: "nome"
    ├── FormControl: "email"
    └── FormControl: "password"
    
    Ogni FormControl sono reattivi ed emettono valori, sono degli observable, infatti possiamo leggerne i valori se invocati in subscribe mode in un ngOnInit
    Come Funziona il ciclo di vita:

    1) Si crea la Form in typescrypt, li diciamo se quel campo è un oggetto FormGroup o un semplice campo FormControl o un array FormArray ecc.. per questo
    prima dicevo consideriamo la rappresentazione JSON, se il mio MediaContext e un singolo oggetto con campi statici avro che i campi statici sono dei
    FormControl, ma i metadati dinamici (che non so apriori quali sono), sono FormGroup (oggetto chiave valore) che creano un FormArray
      Per utilizzare FormControl nel typescript quindi nel component si importa FormControl
    2) Collegare il form di typescript al template usando le direttive [formGroup] se è un FormGroup o [formControlName] per un FormControl e cosi via..
        Per collegare bisogna importare il modulo ReactiveFormModule
    3) Posso usare RxJS per osservare i cambiamenti . . . . .

    - - - FormControl - - -
    Un form control, è un singolo campo del json per esempio la descrizione mentre context rappresenta il form group perche sarebbe il mio oggetto context-
    Si tradute in html con un campo di input semplicemente
    Di un form control posso saperne:
      - Il valore, valore corrente del campo
      - Validita, se il valore è valido
      - Stato, per capire se è stato toccato
      - Stream, usare observable, per fare la subscribe e ottenere i valori reattivamente valueChanges e statusChanges.
    
    Supponiamo abbia un json del genere:
    {
      display_name: 'Conchiglia',
      quantita: '0'
      }
    Il FormControl lo creo cosi:

    const display_name = new FormControl('Conchiglia');
    const quantita = new FormControl('0');

    Per recuperare il valore di display_name faccio:
    console.log("Il nome è: ", this.display_name.value)

    Oppure se voglio stare in ascolto dei suoi cambiamenti ogni volta faccio

    this.display_name.valueChanges.subscribe(valoreAttuale =>{
      console.log("Il valore attuale è: ", valoreAttuale);
    })

    Se voglio collegare il formControl alla form HTML faccio cosi

    <input id="nome" [formControl]="nome" placeholder="Inserisci il tuo nome" />  di solito si inserisce un id per rendere il valore accessibile

        - - - FormGroup - - -
        Viene usato per definizio un oggetto dove al cui interno abbiamo i campi, supponiamo quest oggetto qua 
        {
          context: 
              display_name: 'Conchiglia',
              quantita: '0',
              descrizione: 'Da inserire'
        }
        
        La logica di base è questa

        context (FormGroup)
          │
          ├── display_name (FormControl) → 'Conchiglia'
          ├── quantita      (FormControl) → '0'
          └── descrizione   (FormControl) → 'Da inserire'
        
        Utilizzando FormGroup e i vari FormControl, è come rappresentare una forma reattiva (HTML + TS) del mio JSON.
        
        Domanda: perche conviene usare FormGroup ? perche supponiamo che la mia form sia da sottomettere, io invece di validare campo per campo,
        mi affido al gruppo dicendo, senti ma è valida la form, cioe tu FormGroup sei valido ? e lui va a controllare campo per campo

        Posso accedere anche ai dati del gruppo in questo modo form.get('context.display_name')
        Ovviamente un FormGroup po contenere piu FormGroup e ogni FormGroup annidato contiene i vari FormControl (bisogna pensare come se fosse un vero e proprio JSON).

        Posso usare i metodi 

        Proprietà	    |Significato
        .value	          Un oggetto con tutti i valori attuali dei controlli figli
        .valid	          true se tutti i controlli sono validi
        .invalid	        true se almeno un controllo è invalido
        .pending	        true se almeno un controllo è in stato PENDING (es. validatore asincrono)
        .pristine	        true se nessun controllo è stato modificato
        .dirty	          true se almeno un controllo è stato modificato
        .touched	        true se almeno un controllo è stato toccato (focus perso)
        .untouched	      true se nessun controllo è stato toccato
        .errors	          Oggetto con gli errori a livello di gruppo (es. validatori personalizzati)

       Metodi principali
        Metodo	        |  Cosa fa
        .get(path)	        Recupera un controllo figlio, anche annidato. Es: get('context.quantita')
        .setValue(obj)	    Imposta tutti i valori. L’oggetto deve avere tutte le chiavi

        Anche qui posso usare observable per ricevere gli aggiornamenti

        Creo un form group cosi

        contextForm = new FormGroup({
          display_name: new FormControl('Conchiglia'),
          quantita: new FormControl('0'),
          descrizione: new FormControl('Da inserire')
        });

        this.contextForm.valueChanges.subscribe(valori => {
          console.log('Valori aggiornati del gruppo:', valori);
          ricevendo il nuovo oggetto json

          Oppure recuperare il suo valore direttamente this.contextForm.value
          Oppure di un figlio
          this.contextForm.value                      // tutti i valori
          this.contextForm.get('quantita')?.value     // valore del campo 'quantita'

          Se invece ho un FormGroup padre faccio

          formPrincipale = new FormGroup({
            contextForm: new FormGroup({
            display_name: new FormControl('Conchiglia'),
            quantita: new FormControl('0'),
            descrizione: new FormControl('Da inserire')
       })
      });
    });

    creo un gettere per formPrincipale
    get form(){
        return this.formPrincipale.get('contextForm') as FormGroup
    }

    cosi per recuperare i valori faccio
    this.form.value ed è come se stessi facendo this.contextForm.value oppure this.formPrincipale.get('contextForm')?.value

    cosi:

    <form [formGroup]="contextForm">
        <label>Nome</label>
        <input formControlName="display_name" />

        <label>Quantità</label>
        <input formControlName="quantita" />

        <label>Descrizione</label>
        <input formControlName="descrizione" />
    </form>

    Se pero ho un form padre ? 

    formPrincipale = new FormGroup({
  contextForm: new FormGroup({ ... })
});

faccio

<form [formGroup]="formPrincipale">
  <div formGroupName="contextForm">
    <input formControlName="display_name" />
    <input formControlName="quantita" />
    <input formControlName="descrizione" />
  </div>
</form>

      --- FormArray - - -
      Un FormArray puo essere un array fi formControl quindi di campi o di form group
      Esempio supponiamo in una form devo inserire numeri di telefono, ora di quella persona non sai quanti telefoni ha e quindi non sai a priori il numero
      (come per il mio caso i metadata) non so quanti ce ne sono quindi rappresento i metadata dinamici come array di form control
      
      come per il form group

      new FormArray([
        new FormControl('estate'),
        new FormControl('spiaggia'),
        new FormControl('vacanze')
      ])

    Supponiamo di avere:

    formPrincipale = new FormGroup({
        tags: new FormArray([
                  new FormControl('estate'),
                  new FormControl('spiaggia')
      ])
    });

    JSON
    
    {
    formPrincipale: {
            tags: ['estate','spiaggia']
        }
}

la rappresentazione html è 
<!-- Colleghiamo il form principale -->
<form [formGroup]="formPrincipale">

  <!-- Sezione FormArray -->
  <div formArrayName="tags">

    <!-- Cicliamo su ogni elemento dell'array -->
    <div *ngFor="let tagCtrl of tags.controls; let i = index">
      <!-- Ogni input è legato al FormControl in posizione i -->
      <input [formControlName]="i" placeholder="Inserisci un tag" />
      <button type="button" (click)="rimuoviTag(i)">Rimuovi</button>
    </div>

    <!-- Pulsante per aggiungere un nuovo tag -->
    <button type="button" (click)="aggiungiTag()">Aggiungi Tag</button>

  </div>

</form>

Vediamo bene let tagCtrl of tags.controls; let i = index" per accedere a un valore dell array si indica la posizione e non il valore 

Mentre nel type script per accedere al valore faccio cosi 
(this.formPrincipale.get('tags') as FormArray).at(1).value
per leggere tutti i valori this.tags.value

In definitiva se ho dei campi dinamici posso rappresentare un formControl dinamico, mentre il FormArray si usa per questo tipo di rappresentazione
{
  indirizzi: [
    { via: "Roma", cap: "00100" },
    { via: "Milano", cap: "20100" }
  ]
}

Posso aggiungere dinamicamente negli indirizzi esempio:
  formPrincipale = new FormGroup({
    indirizzi: new FormArray([
      new FormGroup({
        via: new FormControl('Roma'),
        cap: new FormControl('00100')
      }),
      new FormGroup({
        via: new FormControl('Milano'),
        cap: new FormControl('20100')
      })
    ])
  });

    // Getter per accedere facilmente al FormArray nel template e nel codice
  get indirizzi(): FormArray {
    return this.formPrincipale.get('indirizzi') as FormArray;
  }

  // Metodo per aggiungere un nuovo gruppo di indirizzo (via + cap)
  aggiungiIndirizzo(): void {
    const nuovoIndirizzo = new FormGroup({
      via: new FormControl(''),
      cap: new FormControl('')
    });

    this.indirizzi.push(nuovoIndirizzo);
  }


    - - -  FormBuilder - - -
 Cos’è FormBuilder?
FormBuilder è una utility di Angular che ti semplifica la creazione di FormGroup, FormControl e FormArray.

Senza FormBuilder usi:

ts
Copia
Modifica
new FormGroup({
  nome: new FormControl('Mario'),
  eta: new FormControl(30)
});
Con FormBuilder puoi scrivere in modo più compatto:

ts
Copia
Modifica
this.fb.group({
  nome: ['Mario'],
  eta: [30]
});
e opzionale usarlo..


      */


/* In base a quanto detto sopra l'idea di base è creare un formGroup padre chiamato contextGroup all intenro abbiamo due form group uno con
   i metadati di input quindi dal component padre al figlio (questo) con n form control per quanti dati sono passati dal padre
   e un altro form group con  due form control statici formControlKey e formControlValue per gestire la chiave e il valore ovvero avere una situazione del genere:

   contextForm (FormGroup)
      ├── metadatiDiInput (FormGroup)
      │       ├── display_name (FormControl)
      │       ├── descrizione (FormControl)
      │       └── ...
      └── metadatiAggiunti (FormGroup)
              ├── nuovaChiave1 (FormControl)
              ├── nuovaChiave2 (FormControl)
              └── ...

              Ottenere quindi un oggetto del genere:
              {
  "metadatiFromFather": {
    "display_name": "carosello2",
    "descrizione": "Da inserire",
    "quantita": "0",
    "type": "image"
  },
  "metadatiAggiunti": [
    {
      "key": "prezzo",
      "value": "10"
    },
    {
      "key": "materiale",
      "value": "pelle"
    }
  ]
}
*/
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

// Interfaccia context usata nel componente padre
import { MediaContext, MediaCollection } from '../../../pages/home/home.component';

//Reactive Form
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
//material
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { chiaviValidatorEsteso } from '../../validators/chiavi-duplicate.validator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedDataService } from '../../../services/shared-data.service';
import { AdminService } from '../../../services/admin.service';
@Component({
  selector: 'app-edit-context-before-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltip
  ],
  templateUrl: './edit-data-admin.component.html',
  styleUrl: './edit-data-admin.component.scss'
})
export class EditDataAdminComponent implements OnInit {
  /* Per gestire l'invalidita della form contextGroup, creo un Validator custom sul FormsArray per gestire le chiavi duplicate*/

  //Recupero il context in input
  contextInputFromFather: MediaContext = {};

  //Contiene l'array di tutte le chiavi
  contextInputFromFatherKeys: string[] = [];

  //Salvo una copia di backup in fase di chiusura o distruzione del pop up
  backUpContextFromFather: MediaContext = {};




  //per ogni chiave devo creare un suo form control quindi creo una mappa
  //Quindi a ogni chiave associamo un form control
  formControlsFromFather: { [key: string]: FormControl } = {};

  //dichiaro la variabile senza inizializzarla questo form group rappresenta il gruppo di metadati in ingresso dal padre
  contextFormGroupFromFather!: FormGroup;


  //contiene l'insieme del contextFormGroupFromFather e del medatatiAggiuntiGroup
  contextFormGroup!: FormGroup;



  //per gestire chiave e valore dinamici perche form control devo sapere apriori la chiave invece nei dinamici non la conosco a priori
  //altrimenti avrei dovuto settare una chiave con date e poi modificarla
  metadatiAggiuntiFormArray!: FormArray

  /*
  Questa variabile serve perche, se mi chiama l'upload allora quando confermo, invece di inviare i dati in response, 
  sono in ascolto sul subscribeConfig settato da AppComponent per capire se posso rinominare quel display_name 
  perche se gia esiste una foto frontale con lo stesso nome devo inviare l'errore al chiamante
  */
  mediaCollectionsFromAppComponent: MediaCollection[] = [];
  //mi serve per creare un array di soli display name frontali da confrontale in modo da non poter fare la rinomina in fase di conferma se siamo in edit
  //di metadati gia esistenti  in realta è una mappa chiave valore display name url

  onlyDisplayNameAndUrlFrontale: { [display_name: string]: string } = {};


  //variabile che mi consente se display name è cambiato altrimetni non posso fare l'edit (lo spiego giu nel metodo di conferma)
  onChangeDisplayName: boolean = false;

  /*mi salvo il nome originale sia percche in fase di edit ne ho bisogno perche
  nel caso in cui voglio modificare carosello1, pero poi da carosello1 porto a carosello2 e poi carosello1
  se in effetti sto modificando veramente la card carosello1 deve modificarla altrimenti dice che quel media e gia presente
  ma carosello1 e il media cliccato.*/
  nomeOriginale: string = '';

  constructor(
    private dialogRef: MatDialogRef<EditDataAdminComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { context: { [key: string]: string }, isUploadComponent: boolean },
    private sharedDataService: SharedDataService,
    private snackBar: MatSnackBar,
    private adminService: AdminService
  ) { }




  ngOnInit(): void {
    // se this.data.isUploadComponent e tyrue vuol dire che mi sta chiamando l'upload e quindi quando chiudo il pop up non chiamo direttamente qui media-update ma do i dati al padre
    console.log("Mi sta chiamando l'[UploadDataAdminComponent? ], se false allora recupero tutte le media collections ", this.data.isUploadComponent)

    this.sharedDataService.mediasCollectionsConfig$.subscribe(data => {
      this.mediaCollectionsFromAppComponent = data;

      if (this.mediaCollectionsFromAppComponent.length > 0) {
        // Reset della mappa dei display_name → URL frontale
        this.onlyDisplayNameAndUrlFrontale = {};

        for (const collezione of this.mediaCollectionsFromAppComponent) {
          for (const item of collezione.items) {
            // Verifica che display_name esista ed è una stringa valida
            const displayName = item.context?.display_name;

            // Cerca l'immagine con angolazione 'frontale'
            const mediaFrontale = item.media.find(m => m.angolazione === 'frontale');

            // Se display_name è definito e la URL della frontale esiste, salva nella mappa
            if (typeof displayName === 'string' && mediaFrontale?.url) {
              this.onlyDisplayNameAndUrlFrontale[displayName] = mediaFrontale.url;
            }
          }
        }
      }


      console.log("Array di nomi immagine frontale: ", this.onlyDisplayNameAndUrlFrontale);


    })



    this.contextInputFromFather = this.data.context;
    console.log("[EditDataAdmin] sto ricevento questo context: ", this.contextInputFromFather);

    this.backUpContextFromFather = { ...this.contextInputFromFather };
    console.log("BackUp del context: ", this.backUpContextFromFather);

    //recupero le chiavi di contextInput
    this.contextInputFromFatherKeys = Object.keys(this.contextInputFromFather);
    console.log("Chiavi inizializzate: ", this.contextInputFromFatherKeys);

    //recuperate le chiavi inizio a creare i miei form control da inserire nel group
    this.contextInputFromFatherKeys.forEach(chiave =>
      this.formControlsFromFather[chiave] = new FormControl(this.contextInputFromFather[chiave], Validators.required)
    )
    /* Capiamo un attimo perche viene cosi sopra:
      Quando creo una mappa 
      const miaMappa: { [key: string]: string } = {};

      se voglio assegnare un qualcosa alla mia mappa faccio map["miaChiave"] = "valroe";
      stessa cosa sto facendo sopra 
      display_name = new FormControl

    */



    console.log("Form control creati: ", this.formControlsFromFather);

    //associamo gli n form control al form group
    this.contextFormGroupFromFather = new FormGroup(this.formControlsFromFather); // funziona perche form group si aspetta chiave valore e qui in effetti sto passando             this.formControlsFromFather[chiave] = new FormControl(this.contextInputFromFather[chiave], Validators.required) chiave valore anche perche   formControlsFromFather: { [key: string]: FormControl } = {};


    console.log("From Group generato: ", this.contextFormGroupFromFather);

    //lo istanzio vuoto per il momento //non so cosa conterra il mio array quindi any
    this.metadatiAggiuntiFormArray = new FormArray<any>([], chiaviValidatorEsteso(this.contextInputFromFatherKeys));

    //inizio a creare il primo gruppo e lo assegno al gruppo padre
    this.contextFormGroup = new FormGroup({
      'metadatiFromFather': this.contextFormGroupFromFather,
      'metadatiAggiunti': this.metadatiAggiuntiFormArray
    });

    /*Ottenendo una cosa del genere:
    {
      metadatiFromFather: FormGroup {
              display_name: FormControl,
              descrizione: FormControl,
              ...
              },
      metadatiAggiunti: FormGroup {
            // dinamico
      }
} */


    // -----------------------------------------------------------------------------
    // ASCOLTO DEL CAMPO “display_name”  (versione senza distinctUntilChanged)
    // -----------------------------------------------------------------------------

    // 1. Salvo il valore originale quando apro il dialog
    this.nomeOriginale = this.contextFormGroupFromFather
      .get('display_name')
      ?.value
      ?.toString()
      .trim();

    console.log('Nome originale:', this.nomeOriginale);

    // 2. Mi metto in ascolto su tutti i cambiamenti dell’input
    this.contextFormGroupFromFather
      .get('display_name')
      ?.valueChanges
      .subscribe(nuovoValore => {

        const nuovoNormalizzato = nuovoValore?.toString().trim();
        console.log('Sta cambiando display_name →', nuovoNormalizzato);

        /* onChangeDisplayName diventa true se il valore è diverso
           dall’originale; altrimenti resta/torna false                */
        this.onChangeDisplayName = nuovoNormalizzato !== this.nomeOriginale;

        console.log('Display name è cambiato?', this.onChangeDisplayName);
      });

    /* Se gestisci unsubscribe:
       - crea un Subject destroy$  (private destroy$ = new Subject<void>();)
       - usa takeUntil(this.destroy$) nella pipe
       - chiama this.destroy$.next() in ngOnDestroy()                      */




  }

  /**
* Trasforma una chiave tecnica in una label leggibile
* Esempi:
*  'pippo_franco'   → 'Pippo Franco'
*  'ciao mondo'     → 'Ciao Mondo'
*  'display_name'   → 'Display Name'
*/
  normalizzaChiave(chiave: string): string {
    return chiave
      // sostituisce underscore o più spazi con uno spazio singolo
      .replace(/[_\s]+/g, ' ')
      // divide in parole
      .split(' ')
      // capitalizza la prima lettera di ogni parola
      .map(parola => parola.charAt(0).toUpperCase() + parola.slice(1).toLowerCase())
      // ricompone la frase
      .join(' ');
  }

  //prende come input una stringa e, vede se è display_name e la mette come nome
  normalizzaDisplayName(input: string) {
    let cambioNome;
    if (input === 'display_name') {
      cambioNome = 'nome file';
    }
    else {
      return input;
    }
    return cambioNome;
  }






 
  chiudiDialog() {
    this.contextInputFromFather = this.backUpContextFromFather;
    console.log("Context ripristinato: ", this.contextInputFromFather);
    this.errorEditMetadata = false;
    this.onChangeDisplayName = false;
    this.dialogRef.close();
  }


  chiudiAfterEditOK(){
    this.dialogRef.close();
  }


  //per generare un messaggio di errore che l'edit è fallito
  errorEditMetadata: boolean = false;
  onConferma() {

    //vuol dire che se è false (non mi sta chiamando l'upload allora qui sara true e chiama il service admin che esegue l'update dei metadata)
    if (!this.data.isUploadComponent) {
      console.log("Non mi sta chiamando l'upload");
      //non mi sta chiamando l'upload cio vuol dire che devo invocare media la put('/admin/media-images del backend per modificare i metadati
      //e notificare l'app component col servizio di notify, prima però verifico se esiste gia quel display_name altrimenti non devo modificare
      //i metdadati e devo dare errore
      /* Ma deve anche verificare che in effetti sia stato cambiato il valore di display_name e che quindi devo stare in ascolto
      ai cambiamenti di display_name perche altrimenti andrei sempre in errore
      verifica anche se è lo stesso file con const nomeFileOriginale*/
      const displayNameOttenuto = this.contextFormGroupFromFather.get('display_name')?.value
      console.log("Display Name Ottenuto: ", displayNameOttenuto);
      const checkExistImage = Object.keys(this.onlyDisplayNameAndUrlFrontale).some(
        nome => nome === displayNameOttenuto
      ); if (checkExistImage && this.onChangeDisplayName) {
        console.log("Non puoi cambiare il nome all immagine perche gia esiste una frontale cosi. . .")
        this.errorEditMetadata = true;
        this.mostraMessaggioSnakBar('Il media è già presente nella raccolta. Si prega di indicare un nome differente.', true);
      } else {
        const contextAggiornato: MediaContext = this.trasformInMediaContext();
        console.log("MediaContext aggiornato . . .", contextAggiornato);
        const url = this.onlyDisplayNameAndUrlFrontale[this.nomeOriginale];
        console.log("Url del media da aggiornare: ", url);
        this.adminService.updateImageMetadata(url, contextAggiornato, true).subscribe({ //ahahahaahha
          next: (response) => {
            console.log('Metadati aggiornati con successo:', response);
            this.mostraMessaggioSnakBar('Dati aggiornati con successo', false);
            this.sharedDataService.notifyConfigCacheIsChanged();
            this.chiudiAfterEditOK();
          },
          error: (error) => {
            console.error('Errore durante l\'aggiornamento dei metadati:', JSON.stringify(error));
            this.mostraMessaggioSnakBar('Errore generico', true);

          }
        });
      }

      }else{
        console.log("siamo nella fase di upload e quindi non di edit: ");
        const contextAggiornato: MediaContext = this.trasformInMediaContext();
        console.log("Aggiorno il context da inviare all'upload: ", contextAggiornato);
            this.dialogRef.close(contextAggiornato);

    }

  }

  /* Devo trasformare la form in MediaContext
    La form è questa {
  "metadatiFromFather": {
    "display_name": "carosello2",
    "descrizione": "Da inserire",
    "quantita": "0",
    "type": "image"
  },
  "metadatiAggiunti": [
    {
      "key": "prezzo",
      "value": "10"
    },
    {
      "key": "materiale",
      "value": "pelle"
    }
  ]
}
  */
  //La invoco nella conferma
  /**
  * Metodo per trasformare i dati presenti nel FormGroup padre (`contextFormGroupFromFather`)
  * e nel FormArray (`getMetadatiAggiuntiFormArray`) in un unico oggetto piatto
  * conforme all'interfaccia `MediaContext`, che unisce i metadati statici e quelli dinamici.
  *
  */
  trasformInMediaContext(): MediaContext {
    // 1. Recupera i metadati principali (statici) dal FormGroup padre
    const metadatiPrincipali = this.contextFormGroupFromFather.value;

    // 2. Recupera i metadati aggiuntivi (dinamici) dal FormArray, come array di oggetti { key, value }
    const metadatiAggiunti = this.getMetadatiAggiuntiFormArray.value;

    // 3. Costruisce un oggetto a partire dai metadati aggiuntivi, ignorando quelli con key o value vuoti
    const aggiuntiviObj = metadatiAggiunti.reduce((acc: { [key: string]: string }, curr: any) => {
      if (curr.key && curr.value) {
        // Normalizza la chiave: trim e rimozione spazi multipli
        const chiaveNormalizzata = curr.key.toString().trim().replace(/\s+/g, '_');
        acc[chiaveNormalizzata] = curr.value;
      }
      return acc;
    }, {});

    // 4. Unisce i metadati statici e dinamici in un unico oggetto `MediaContext`
    const contextAggiornato: MediaContext = {
      ...metadatiPrincipali,
      ...aggiuntiviObj
    };

    // 5. Stampa di debug per verifica

    // 6. Ritorna il contesto unificato
    return contextAggiornato;
  }


  /* Ora per l'aggiunta dei metadata facciamo cosi:
    Creiamo un nuovo FormGroup
    Creo un form array 
    */
  addMetadata: boolean = false;
  //metodo per aggiungere nuovi  metadati:
  onAggiungiCampo() {
    // ✅ Mostra il template per aggiungere un metadato
    this.addMetadata = true;

    // ✅ Crea un FormGroup per il nuovo campo con validazioni
    const nuovoMetadato = new FormGroup({
      key: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9_-]+$/)  // ✅ Nessuno spazio o carattere speciale
      ]),
      value: new FormControl('', Validators.required)
    });

    // ✅ Aggiunge il nuovo gruppo al FormArray
    this.getMetadatiAggiuntiFormArray.push(nuovoMetadato);
  }


  onRimuoviCampo(index: number): void {
  this.getMetadatiAggiuntiFormArray.removeAt(index);
}

  // Getter per accedere facilmente al FormArray dei metadati aggiunti
  get getMetadatiAggiuntiFormArray(): FormArray {
    return this.contextFormGroup.get('metadatiAggiunti') as FormArray;
  }


  // Metodo per verificare se una chiave inserita nel FormArray è già presente
  isChiaveDuplicata(indexDaEscludere: number = -1): boolean {
    // Estrai l'elenco delle chiavi attualmente presenti nel FormArray
    const keys = this.getMetadatiAggiuntiFormArray.controls
      .map((control, index) => {
        const keyValue = control.get('key')?.value?.trim();
        return { key: keyValue, index };
      })
      .filter(item => item.key); // Filtra chiavi non vuote

    // Crea un Set per controllare i duplicati
    const chiaviVisitate = new Set<string>();

    for (const { key, index } of keys) {
      if (index === indexDaEscludere) continue; // escludi l'indice attuale (se serve)
      if (chiaviVisitate.has(key)) {
        return true; // Trovato duplicato
      }
      chiaviVisitate.add(key);
    }

    return false; // Nessun duplicato trovato
  }


  //snackbar
  mostraMessaggioSnakBar(messaggio: string, isError: boolean) {
    let panelClassCustom;
    if (isError) {
      panelClassCustom = 'snackbar-errore';
    }
    else {
      panelClassCustom = 'snackbar-ok';
    }
    this.snackBar.open(messaggio, 'Chiudi', {
      duration: 4000, // durata in ms
      panelClass: panelClassCustom, // classe CSS personalizzata
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

}

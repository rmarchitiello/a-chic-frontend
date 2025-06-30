import { Component, OnInit,ViewChild, ElementRef } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CmsService } from '../../services/cms.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; //abilito ngForm e ngNodel pwe il two way data binding 

//stilizzo le form con material
import { MatFormFieldModule } from '@angular/material/form-field'; // Per <mat-form-field>
import { MatInputModule } from '@angular/material/input';           // Per <input matInput>
import { MatSelectModule } from '@angular/material/select';         // Per <mat-select>
import { MatButtonModule } from '@angular/material/button';         // Per <button mat-button>
import { Router } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';   // <-- nuovo import

//request per l'upload dei media
/* a backend la request è questa {
    "local": {
        "folder": "C:/temp",
        "fileName" : "Panna.jpg"
    },
    "cloudinary": {
            "folder": "a/pippo/baudo",
            "context": {
                    "nome_file": "Panna",
                    "descrizione": "Elegante borsa in paglia",
                    "quantita": "3",
                    "angolazione": "frontale"
  }
    }
    
    

}
e quindi preparo l interfaccia */


export interface ContextDataCloudinary {
       
          nome_file: string,
          descrizione: string,
          quantita: string,
          angolazione: string
      
}

export interface CloudinaryDataUpload {
  folder: string;
  context: ContextDataCloudinary;
}


//request finale 
export interface BodyUploadMedia {
  file: File,   //passo il file da locale
  cloudinary: CloudinaryDataUpload 
}


@Component({
  selector: 'app-cms-upload',
  templateUrl: './cms-upload.component.html',
  styleUrl: './cms-upload.component.scss', // Corretto da "styleUrl" a "styleUrls"
  imports: [CommonModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule
  ]        
})
export class CmsUploadComponent implements OnInit {


  // Flag che indica se l'utente è su un dispositivo mobile
  isMobile: boolean = false;

  // Oggetto che conterrà tutte le cartelle con le immagini caricate da Cloudinary
foldersCaricate: string[] = []; // inizializzato come array vuoto

  //variabili per costruire la form per upoloadare
  selectedFile: File | null = null;

  folderCloudinary: string = '';
  fileNameCloudinary: string = '';
  descrizioneCloudinary: string = '';
  quantitaCloudinary: string = '';
  angolazioneCloudinary: string = '';

  constructor(
    private cmsService: CmsService,
    private breakpointObserver: BreakpointObserver,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.quantitaCloudinary = '0';

    // Verifica se la visualizzazione è su dispositivo mobile (max-width 768px)
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });

        // Chiamo entrambe le funzioni separatamente, ma unisco i risultati alla fine
        const tutteLeCartelle: string[] = [];
    // Recupera tutte le immagini/cartelle dal servizio CMS
this.cmsService.getFolders(false).subscribe({
    next: data => {
      const normali = this.getCartelleFinali(data);
      tutteLeCartelle.push(...normali);

      // Dopo la prima, aspetto anche la seconda
      this.cmsService.getFolders(true).subscribe({
        next: data2 => {
          const config = this.getCartelleFinali(data2);
          tutteLeCartelle.push(...config);

          // Unisco ed elimino i duplicati, poi aggiorno l'array principale
          this.foldersCaricate = Array.from(new Set(tutteLeCartelle)).sort();
          console.log('Cartelle combinate:', this.foldersCaricate);
        },
        error: err2 => {
          console.error('Errore nella getFolders config:', err2);
        }
      });
    },
    error: err => {
      console.error('Errore nella getFolders normale:', err);
    }
  });


  }

  menuATendinaFolder: boolean = true;
        checkInputFolder(){
          if(this.folderCloudinary.length > 0){
            this.menuATendinaFolder = false;
          }
          else{
          this.menuATendinaFolder = true;

          }
        }




 

@ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>; //mi serve per azzerare il template quando carico il file

 //metodo che prende il json delle folder 
  /*{
    "Accessori": {
        "Charm": [],
        "Manici Conchiglia Special": []
    },
    "Audio": [],
    "Baby": {
        "Carillon": []
    },
    "Borse": {
        "Conchiglia": {
            "Cono": [],
            "Naturale": [],
            "Perlata": []
        },
        "Pochette": {
            "Clutch Farfalla": [],
            "Clutch Grande": [],
            "Clutch Paillettes Grande": [],
            "Clutch Paillettes Piccola": [],
            "Clutch Piccola": [],
            "Flora Grande": [],
            "Flora Piccola": []
        }
    },
    "Carosello": [],
    "Recensioni": [],
    "Video": []
} e lo trasforma in array */
getCartelleFinali(structure: any): string[] {
  const result: string[] = [];

  const visita = (nodo: any, path: string) => {
    for (const key in nodo) {
      const figlio = nodo[key];
      const nuovoPath = path ? `${path}/${key}` : key;

      const isFoglia =
        Array.isArray(figlio) ||
        (typeof figlio === 'object' && figlio !== null && Object.keys(figlio).length === 0);

      if (isFoglia) {
        result.push(nuovoPath);
      } else {
        visita(figlio, nuovoPath);
      }
    }
  };

  visita(structure, '');
  return result;
}



  uploadFile() {
    console.log("cartella dest", this.folderCloudinary);
    const config = this.folderCloudinary.toLocaleLowerCase().includes('config');
    //controllo categorie e sottocategorie se superano le 3 non faccio caricare nulla
    const maxLivelliConsentiti = 3;
    const livelliCartella = this.folderCloudinary.split('/').filter(part => part.trim() !== '');
    if (livelliCartella.length > maxLivelliConsentiti) {
        console.warn(`Percorso troppo profondo: massimo ${maxLivelliConsentiti} livelli consentiti. Inserito: ${this.folderCloudinary}`);
         alert(`Errore: puoi usare al massimo ${maxLivelliConsentiti} livelli di cartella (es. "Borse/Conchiglia/Grande")`);
      return;
}


  if (!this.selectedFile) {
    console.warn("Nessun file selezionato per l'upload.");
    alert("Errore: devi prima selezionare un file da caricare.");

    return;
  }

  // Creo il FormData da inviare al backend
  const formData = new FormData();

  // Allego il file selezionato dal browser
  formData.append('file', this.selectedFile);

  let angolazione;
  if(this.isAudioOrVideo){
    angolazione = 'frontale'
  }

  // Allego i dati di Cloudinary come stringa JSON
const cloudinaryData: CloudinaryDataUpload = {
  folder: this.folderCloudinary,
  context: {
    nome_file: this.fileNameCloudinary,
    descrizione: this.descrizioneCloudinary,
    quantita: this.quantitaCloudinary,
    angolazione: angolazione || this.angolazioneCloudinary
  }
};

  // Convertiamo il JSON in stringa per inserirlo in FormData
  formData.append('cloudinary', JSON.stringify(cloudinaryData));

  console.log("Upload in corso con questi dati:", cloudinaryData);


  this.cmsService.uploadMedia(formData,config).subscribe({
    next: (response) => {
      console.log("Upload riuscito:", response);
      alert("Upload ruscito");
      this.refreshFolders();
      // Svuoto la form dopo upload riuscito
      this.fileInput.nativeElement.value = '';
      this.fileNameCloudinary = '';
      this.descrizioneCloudinary = '';
      this.quantitaCloudinary = '0';
      this.angolazioneCloudinary = '';
      //aggiorno anche menu a tendina perche deve ricomparire la tendina 
      this.folderCloudinary = '';
      this.menuATendinaFolder = true;    // campo vuoto → mostra tendina

      // Reset anche del campo file nel DOM (se serve)
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    },
    error: (error) => {
      console.error("Errore durante l’upload:", error);
          if (error.error?.message) {
        alert(error.error.message);
      } else {
        alert("Errore durante l'upload. Riprova.");
      }
    }

    
  });
}

refreshFolders() {
  this.cmsService.getFolders(false).subscribe({
    next: data1 => {
      const normali = this.getCartelleFinali(data1);

      this.cmsService.getFolders(true).subscribe({
        next: data2 => {
          const config = this.getCartelleFinali(data2);

          // Unisci e rimuovi duplicati
          this.foldersCaricate = Array.from(new Set([...normali, ...config])).sort();
          console.log('Folders aggiornate post-upload:', this.foldersCaricate);
        },
        error: err2 => console.error('Errore nelle config:', err2)
      });
    },
    error: err1 => console.error('Errore nelle normali:', err1)
  });
}


onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;

  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];
    console.log('File selezionato:', this.selectedFile.name);
  }
}

//se mettono un valore negativo imposta a 0
checkQuantita(valore: string | number) {
  const numero = Number(valore);
  if (numero < 0) {
    console.warn('Quantità negativa, impostata a 0');
    setTimeout(() => {
      this.quantitaCloudinary = '0';
    });
  }
}

goToMedia(cmsMediaPath: string){
  this.router.navigate([cmsMediaPath]);
}


//se video o audio tolgo pulsante frontale o laterale cosi posso caricare sempre.
isAudioOrVideo: boolean = false;
isImageBox: boolean = false;


// Gestore cambio per audio/video
onAudioOrVideoChange(value: boolean): void {
  this.isAudioOrVideo = value;
  if (value) this.isImageBox = false;
}

// Gestore cambio per immagine
onImageBoxChange(value: boolean): void {
  this.isImageBox = value;
  if (value) this.isAudioOrVideo = false;
}

}

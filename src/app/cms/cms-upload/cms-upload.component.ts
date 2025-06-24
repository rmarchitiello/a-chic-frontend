import { Component, OnInit } from '@angular/core';
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
    MatFormFieldModule
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
    this.angolazioneCloudinary = 'frontale';
    this.quantitaCloudinary = '0';

    // Verifica se la visualizzazione è su dispositivo mobile (max-width 768px)
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    // Recupera tutte le immagini/cartelle dal servizio CMS
      this.loadFolders();
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


  //per refreshare le folder col tasto di refresh 
  refreshFolders(){
    this.loadFolders();
  }

  loadFolders(){
        this.cmsService.getFolders().subscribe({
      next: (data) => {
        this.foldersCaricate = this.getCartelleFinali(data);
        console.log("Folders caricate . . . ", JSON.stringify(this.foldersCaricate));
      },
      error: (err) => {
        console.error('Errore nel recupero delle immagini:', err);
      }
    });
  }

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

  // Allego i dati di Cloudinary come stringa JSON
const cloudinaryData: CloudinaryDataUpload = {
  folder: this.folderCloudinary,
  context: {
    nome_file: this.fileNameCloudinary,
    descrizione: this.descrizioneCloudinary,
    quantita: this.quantitaCloudinary,
    angolazione: this.angolazioneCloudinary
  }
};

  // Convertiamo il JSON in stringa per inserirlo in FormData
  formData.append('cloudinary', JSON.stringify(cloudinaryData));

  console.log("Upload in corso con questi dati:", cloudinaryData);

  this.cmsService.uploadMedia(formData).subscribe({
    next: (response) => {
      console.log("Upload riuscito:", response);
      alert("Upload ruscito");
      this.refreshFolders();
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

}

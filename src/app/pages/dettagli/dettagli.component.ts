import { Component, Input, Output,OnInit, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // ✅ importa qui

@Component({
  selector: 'app-dettagli',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './dettagli.component.html',
  styleUrl: './dettagli.component.scss'
})
export class DettagliComponent {



//espongo questo campo al padre
@Input() dettaglio!: { display_name: string; url: string };

//Quando si utilizza l approccio input e output, se il padre deve ricevere se l'evento è sttato ricevuto dal figlio si usa Output
//quindi output serve per dire al padre si ho ricevuto
@Output() chiudiDettaglio = new EventEmitter<void>();


// nel template dei dettagli c e il pulsante chiudi per chiudere la windows che chiama chiudi dettagli emit cioe
//quanod premo il pulsane emetto un evento di output verso il padre il padre ha (chiudiDettaglio)="metto quello che voglio in questo caso setto la variabile immagine selezionata a false cosi si chiude il template"
panelClosing = false; // serve a controllare la classe dinamica

closeWindow() {
  this.panelClosing = true;
  setTimeout(() => {
    this.chiudiDettaglio.emit(); // notifica il padre dopo l'animazione
  }, 400); // durata in ms dell'animazione
}




}

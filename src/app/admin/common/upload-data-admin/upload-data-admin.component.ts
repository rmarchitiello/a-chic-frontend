//questa classe esegue l'upload di un documento immagine audio o video da pop up nella console quando siamo in modalita admin

import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CmsService } from '../../../services/cms.service';

@Component({
  selector: 'app-upload-data-admin',
  imports: [],
  templateUrl: './upload-data-admin.component.html',
  styleUrl: './upload-data-admin.component.scss'
})
export class UploadDataAdminComponent implements OnInit {


  constructor(
    private cmsService: CmsService,
    private dialogRef: MatDialogRef<UploadDataAdminComponent>
  ) {}

  ngOnInit(): void {
    
  }

}

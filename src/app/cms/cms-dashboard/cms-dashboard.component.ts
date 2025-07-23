import { Component,OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
@Component({
  selector: 'app-cms-dashboard',
  standalone: true,
  imports: [MatButtonModule,CommonModule,MatCardModule],
  templateUrl: './cms-dashboard.component.html',
  styleUrl: './cms-dashboard.component.scss'
})
export class CmsDashboardComponent implements OnInit {

  constructor(
    private breakpointObserver: BreakpointObserver,    private router: Router
  ) {}

isMobile: boolean = false;


goToCmsGetMedia(){
  this.router.navigate(['/cms/media']);

}

goToCmsUpload(){
  this.router.navigate(['/cms/upload']);
}

  ngOnInit(): void {
        // Rileva se la finestra è in modalità mobile (<=768px)
    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  logout(): void {
    sessionStorage.removeItem('admin-cms');
    this.router.navigate(['/cms-login']);
  }

  }


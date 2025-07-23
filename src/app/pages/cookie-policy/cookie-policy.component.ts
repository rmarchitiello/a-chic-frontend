import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import {  Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookie-policy',
  standalone: true,
  imports: [MatCardModule,MatListModule,CommonModule],
  templateUrl: './cookie-policy.component.html',
  styleUrl: './cookie-policy.component.scss'
})
export class CookiePolicyComponent implements OnInit {


  email: string =   'achicnapoli@gmail.com';
  isMobile: boolean = false;


  constructor(private router: Router, private breakpointObserver: BreakpointObserver
) {}

  ngOnInit(): void {
        // Esegue scroll in alto all'apertura del componente
    window.scrollTo({ top: 0, behavior: 'smooth' });
    //rilevo disp mobile anziche pc
  this.breakpointObserver
    .observe(['(max-width: 768px)'])
    .subscribe(result => {
      this.isMobile = result.matches;
    });
        window.scrollTo({ top: 0, behavior: 'smooth' });  // Rileva se il dispositivo è mobile

  }

  goHome(){
            this.router.navigate(['/home']);

}


}




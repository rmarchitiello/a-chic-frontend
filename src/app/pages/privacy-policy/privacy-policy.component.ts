import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import {  Router } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  imports: [MatCardModule,MatListModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent implements OnInit{


  email: string =   'achicnapoli@gmail.com';


  constructor(private router: Router) {}


  goHome(){
            this.router.navigate(['/home']);
}

  goToCookie(cookies: string){
            this.router.navigate([cookies]);
}

  ngOnInit(): void {
        window.scrollTo({ top: 0, behavior: 'smooth' });  // Rileva se il dispositivo è mobile

  }

}

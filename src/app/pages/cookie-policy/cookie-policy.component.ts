import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import {  Router } from '@angular/router';

@Component({
  selector: 'app-cookie-policy',
  imports: [MatCardModule,MatListModule],
  templateUrl: './cookie-policy.component.html',
  styleUrl: './cookie-policy.component.scss'
})
export class CookiePolicyComponent implements OnInit {


  email: string =   'achicnapoli@gmail.com';


  constructor(private router: Router) {}

  ngOnInit(): void {
        window.scrollTo({ top: 0, behavior: 'smooth' });  // Rileva se il dispositivo è mobile

  }

  goHome(){
            this.router.navigate(['/home']);

}


}




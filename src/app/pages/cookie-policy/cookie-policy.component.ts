import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-cookie-policy',
  imports: [MatCardModule,MatListModule],
  templateUrl: './cookie-policy.component.html',
  styleUrl: './cookie-policy.component.scss'
})
export class CookiePolicyComponent {


  email: string =   'achicnapoli@gmail.com';


  constructor(private router: Router) {}


  goHome(){
            this.router.navigate(['/home']);

}
}




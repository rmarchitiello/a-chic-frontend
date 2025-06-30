import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  constructor(private router: Router, private breakpointObserver: BreakpointObserver,
) {}


    isMobile = false;

  goToContatti(percorso: string) {
    this.router.navigate([percorso]);
  }

  ngOnInit(): void {
    this.breakpointObserver
    .observe(['(max-width: 768px)'])
    .subscribe(result => {
      this.isMobile = result.matches;
    });
  }
}

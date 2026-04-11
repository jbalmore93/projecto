import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicios/auth'; 

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.html',
})
export class Layout implements OnInit {

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {

    const user = await this.auth.loadUser();

    if (!user) {
      this.router.navigate(['/login']);
    }

  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }

}
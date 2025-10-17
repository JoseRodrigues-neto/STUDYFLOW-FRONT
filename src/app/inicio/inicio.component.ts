import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Para o input de e-mail

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  standalone: true,
  imports: [
    FormsModule, // Adicionado para o formulário
    RouterLink   // Adicionado para usar routerLink no template, se necessário
  ]
})
export class InicioComponent {
  email: string = '';

  constructor(private router: Router) {}

  
  irParaCadastro() {
    this.router.navigate(['/cadastro'], { queryParams: { email: this.email } });
  }
}
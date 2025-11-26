import { Component } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // <-- Importe CommonModule

@Component({
 selector: 'app-layout',
 standalone: true,
  // --- Adicione CommonModule ---
 imports: [CommonModule, SidebarComponent, NavbarComponent, RouterOutlet],
 templateUrl: './layout.component.html',
 styleUrls: ['./layout.component.css'] // <-- Mude de styleUrl para styleUrls
})
export class LayoutComponent {

  // --- NOVO: Variável de estado ---
  isSidebarCollapsed = false;

  
  ngOnInit(): void {
    // Verifica a largura da tela ao iniciar
    this.checkScreenSize();
  }

  // --- NOVO: Função que troca o estado ---
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  private checkScreenSize() {
    if (window.innerWidth < 768) {
      this.isSidebarCollapsed = true; // Começa fechado no celular
    } else {
      this.isSidebarCollapsed = false; // Começa aberto no PC
    }
  }
}
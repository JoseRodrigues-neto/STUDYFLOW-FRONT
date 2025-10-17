import { Component, Input } from '@angular/core';

// Importações do Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon'; // Para usar ícones, se desejar

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.css'],
  standalone: true,
  imports: [MatCardModule, MatIconModule] // Importa os módulos que o template usa
})
export class KpiCardComponent {
  @Input() title: string = '';
  @Input() value: number | null = 0; // Permite valor nulo durante o carregamento
  @Input() icon: string = '';
  @Input() color: string = ''; // Ex: 'primary', 'accent', 'warn'
}
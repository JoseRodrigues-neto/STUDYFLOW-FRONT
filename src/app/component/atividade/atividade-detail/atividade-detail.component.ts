import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-atividade-detail',
  imports: [],
  templateUrl: './atividade-detail.component.html',
  styleUrl: './atividade-detail.component.css'
})
export class AtividadeDetailComponent {
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}

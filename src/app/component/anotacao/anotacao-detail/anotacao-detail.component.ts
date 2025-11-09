import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { Anotacao } from '../../../models/anotacao.model';
import { AnotacaoService } from '../anotacao.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-anotacao-detail',
  imports: [],
  templateUrl: './anotacao-detail.component.html',
  styleUrl: './anotacao-detail.component.css'
})
export class AnotacaoDetailComponent implements OnChanges {

  @Input() anotacaoParaEditar: Anotacao | null = null;
  @Input() atividadeId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  isEditMode = false;

  constructor(
    private anotacaoService: AnotacaoService,
    private fb: FormBuilder
  ) { }

  // 3. ngOnChanges: Reage quando o @Input muda
  ngOnChanges(): void {
    if (this.anotacaoParaEditar) {
      this.isEditMode = true;
    } else {
      this.isEditMode = false;
      this.anotacaoForm.reset();
    }
  }

  // 4. Lógica de Salvar
  salvarAnotacao(): void {
    const formData = this.anotacaoForm.value;

    if (this.isEditMode && this.anotacaoParaEditar) {
      const dadosAtualizados = { ...this.anotacaoParaEditar, conteudo: formData.conteudo };
      this.anotacaoService.update(dadosAtualizados).subscribe(() => {
        this.save.emit(); // Avisa o "pai" que salvou
      });

    } else {
      const novaAnotacao = { conteudo: formData.conteudo, atividadeId: this.atividadeId };
      this.anotacaoService.create(novaAnotacao).subscribe(() => {
        this.save.emit(); // Avisa o "pai" que salvou
      });
    }
  }

  fecharPainel(): void {
    this.close.emit();
  }

  // (Você também precisará de uma lógica para DELETAR, se for o caso)
}
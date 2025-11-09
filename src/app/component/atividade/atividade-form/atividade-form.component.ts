import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Atividade } from '../../../models/atividade.model';
import { StatusAtividade } from '../../../models/status-atividade.model';
import { AtividadeService } from '../atividade.service';

@Component({
  selector: 'app-atividade-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './atividade-form.component.html',
  styleUrls: ['./atividade-form.component.css']
})
export class AtividadeFormComponent implements OnInit, OnChanges {

  @Input() atividade: Atividade | null = null;
  @Output() save = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  atividadeForm: FormGroup;
  isEditMode = false;
  statusOptions = Object.values(StatusAtividade); // Para o dropdown de status

  constructor(
    private fb: FormBuilder,
    private atividadeService: AtividadeService
  ) {
    this.atividadeForm = this.fb.group({
      titulo: ['', Validators.required],
      descricao: [''],
      dataInicio: [null],
      dataFim: [null],
      status: [StatusAtividade.PENDENTE, Validators.required]
    });
  }

  ngOnInit(): void {
    this.setFormValues();
  }

  ngOnChanges(): void {
    this.setFormValues();
    this.isEditMode = !!this.atividade;
  }

  private setFormValues(): void {
    if (this.atividade) {
      this.atividadeForm.patchValue({
        titulo: this.atividade.titulo,
        descricao: this.atividade.descricao,
        dataInicio: this.formatDateForInput(this.atividade.dataInicio),
        dataFim: this.formatDateForInput(this.atividade.dataFim),
        status: this.atividade.status
      });
    } else {
      this.atividadeForm.reset({
        status: StatusAtividade.PENDENTE
      });
    }
  }

  private formatDateForInput(date: Date | string | undefined): string | null {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.atividadeForm.invalid) {
      return;
    }

    const formValues = this.atividadeForm.value;
    const roadmapId = 1; 

    if (this.isEditMode && this.atividade) {
      const atividadeAtualizada = {
        id: this.atividade.id,
        roadmapId: this.atividade.roadmapId,
        ...formValues,
      };

      this.atividadeService.update(atividadeAtualizada as Atividade).subscribe({
        next: () => this.save.emit(),
        error: (err) => console.error('Erro ao atualizar atividade', err)
      });

    } else {
      const novaAtividade = {
        ...formValues,
        roadmapId: roadmapId
      };

      this.atividadeService.create(novaAtividade as Atividade).subscribe({
        next: () => this.save.emit(),
        error: (err) => console.error('Erro ao criar atividade', err)
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }
}

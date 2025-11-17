import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Atividade } from '../../../models/atividade.model';
import { StatusAtividade } from '../../../models/status-atividade.model';
import { AtividadeService } from '../atividade.service';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-atividade-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './atividade-form.component.html',
  styleUrls: ['./atividade-form.component.css']
})
export class AtividadeFormComponent implements OnInit {

  atividadeForm: FormGroup;
  isEditMode = false;
  isViewMode = false;
  statusOptions = Object.values(StatusAtividade);
  roadmapId: number | null = null;
  atividadeId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private atividadeService: AtividadeService,
    private route: ActivatedRoute,
    private location: Location
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
    combineLatest([this.route.params, this.route.queryParams]).subscribe(([params, queryParams]) => {
      this.atividadeId = params['id'] ? +params['id'] : null;
      this.roadmapId = queryParams['roadmapId'] ? +queryParams['roadmapId'] : null;
      this.isViewMode = queryParams['view'] === 'true';

      if (this.atividadeId) {
        this.isEditMode = true;
        this.atividadeService.getById(this.atividadeId).subscribe((atividade: Atividade) => {
          console.log('Atividade recebida do serviço:', atividade);
          this.setFormValues(atividade);
          if (this.isViewMode) {
            this.atividadeForm.disable();
          }
        });
      } else {
        this.isEditMode = false;
        this.setFormValues(null);
      }
    });
  }

  private setFormValues(atividade: Atividade | null): void {
    if (atividade) {
      this.atividadeForm.patchValue({
        titulo: atividade.titulo,
        descricao: atividade.descricao,
        dataInicio: this.formatDateForInput(atividade.dataInicio),
        dataFim: this.formatDateForInput(atividade.dataFim),
        status: atividade.status
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
    
    if (this.isEditMode && this.atividadeId) {
      const atividadeAtualizada = {
        id: this.atividadeId,
        ...formValues,
      };

      this.atividadeService.update(atividadeAtualizada as Atividade).subscribe({
        next: () => this.location.back(),
        error: (err) => console.error('Erro ao atualizar atividade', err)
      });

    } else if (this.roadmapId) {
      const novaAtividade = {
        ...formValues,
        roadmapId: this.roadmapId
      };

      this.atividadeService.create(novaAtividade as Atividade).subscribe({
        next: () => this.location.back(),
        error: (err) => console.error('Erro ao criar atividade', err)
      });
    } else {
      console.error('ID do Roadmap ou da Atividade não encontrado.');
    }
  }

  onClose(): void {
    this.location.back();
  }
}

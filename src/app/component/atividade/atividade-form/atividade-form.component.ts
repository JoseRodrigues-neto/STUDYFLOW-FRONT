import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Atividade } from '../../../models/atividade.model';
import { StatusAtividade } from '../../../models/status-atividade.model';
import { AtividadeService } from '../atividade.service';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { AnotacaoListComponent } from '../../anotacao/anotacao-list/anotacao-list.component';

@Component({
  selector: 'app-atividade-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AnotacaoListComponent],
  templateUrl: './atividade-form.component.html',
  styleUrls: ['./atividade-form.component.css']
})
export class AtividadeFormComponent implements OnInit {

  atividadeForm: FormGroup;
  isEditMode = false;
  isViewMode = false;
  statusOptions = Object.values(StatusAtividade);
  roadmapId: number | null = null;
  usuarioId: number | null = null;
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
      this.usuarioId = queryParams['usuarioId'] ? +queryParams['usuarioId'] : null;
      this.isViewMode = queryParams['view'] === 'true';

      console.log('ngOnInit - roadmapId from queryParams:', this.roadmapId);
      if (this.atividadeId) {
        this.isEditMode = true;
        this.atividadeService.getById(this.atividadeId).subscribe((atividade: Atividade) => {
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
    const effectiveUsuarioId = this.usuarioId;

    if (!effectiveUsuarioId) {
      console.error('ERRO CRÍTICO: ID do usuário não fornecido para a operação.');
      return;
    }

    // Preparação correta do RoadmapId
    // Se for nulo (atividade diária), transformamos em undefined para o Service entender
    const roadmapIdParam = this.roadmapId ? this.roadmapId : undefined;

    let operation$: Observable<Atividade[]>;

    console.log(`Tentando salvar. UserID: ${effectiveUsuarioId}, RoadmapID: ${roadmapIdParam}`);

    // 1. Lógica de Edição
    if (this.isEditMode && this.atividadeId) {
      const atividadeAtualizada = { 
        id: this.atividadeId, 
        ...formValues,
        usuarioId: effectiveUsuarioId,
        roadmapId: this.roadmapId ?? null 
      };

      console.log('Payload Update:', atividadeAtualizada);
      
      operation$ = this.atividadeService.update(atividadeAtualizada as Atividade, effectiveUsuarioId, roadmapIdParam);

      // 2. Lógica de Criação (Roadmap ou Diária)
    } else {
      const novaAtividade: Atividade = {
        ...formValues,
        usuarioId: effectiveUsuarioId,
        roadmapId: this.roadmapId ? this.roadmapId : null
      };
      console.log('onSubmit - Nova Atividade:', novaAtividade);
      operation$ = this.atividadeService.create(novaAtividade, effectiveUsuarioId, roadmapIdParam);
    }

    operation$.subscribe({
      next: (listaAtualizada) => {
        console.log('Sucesso! Lista atualizada recebida do servidor:', listaAtualizada);
        this.location.back();
      },
      error: (err) => {
        console.error('Falha na operação:', err);
      }
    });
  }

  onClose(): void {
    this.location.back();
  }
}

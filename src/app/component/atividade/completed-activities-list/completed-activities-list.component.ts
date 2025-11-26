import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Atividade } from '../../../models/atividade.model';
import { StatusAtividade } from '../../../models/status-atividade.model';
import { AtividadeService } from '../atividade.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-completed-activities-list',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './completed-activities-list.component.html',
  styleUrls: ['./completed-activities-list.component.css']
})
export class CompletedActivitiesListComponent implements OnInit, OnDestroy {

  completedAtividades: Atividade[] = [];
  isLoading = true;
  dataAtual: string;
  private atividadesSubscription: Subscription | undefined;

  constructor(
    private atividadeService: AtividadeService,
    private usuarioService: UsuarioService,
    private datePipe: DatePipe,
    private router: Router
  ) {
    const hoje = new Date();
    this.dataAtual = hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    this.dataAtual = this.dataAtual.charAt(0).toUpperCase() + this.dataAtual.slice(1);
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.usuarioService.getMeuPerfil().subscribe(usuario => {
      if (usuario && usuario.id) {
        this.atividadeService.loadInitialAtividades(usuario.id);
        this.subscribeToAtividadesConcluidas();
      } else {
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.atividadesSubscription) {
      this.atividadesSubscription.unsubscribe();
    }
  }

  subscribeToAtividadesConcluidas(): void {
    this.atividadesSubscription = this.atividadeService.atividades$.pipe(
      map(atividades => atividades.filter(a => a.status === StatusAtividade.CONCLUIDO))
    ).subscribe(completedActivities => {
      this.completedAtividades = completedActivities;
      this.isLoading = false;
    });
  }

  verDetalhesAtividade(atividade: Atividade): void {
    this.router.navigate(['/app/atividade-form', atividade.id], { queryParams: { view: 'true' } });
  }

  formatarData(data: Date | string | undefined): string {
    if (!data) return 'Não definida';
    return this.datePipe.transform(data, 'dd/MM/yyyy') || 'Inválida';
  }
}
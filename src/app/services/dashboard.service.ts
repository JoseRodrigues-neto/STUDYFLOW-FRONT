import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { DashboardData } from '../models/dashboard-data.model';

// 1. Importe o seu serviço de autenticação
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'https://9ec610758ec0.ngrok-free.app/dashboard/me';

  // 2. Injete o AuthService no construtor
  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) { }

  getDashboardData(): Observable<DashboardData> {
    // 3. Usa o AuthService para obter o token de forma reativa e segura
    return this.authService.getIdToken().pipe(
      take(1), // Pega apenas o primeiro valor emitido (o token atual) e completa.
      switchMap(token => {
        // Se não houver token (usuário deslogado), lança um erro.
        if (!token) {
          return throwError(() => new Error('Usuário não autenticado. Token não encontrado.'));
        }

        // O token agora é dinâmico e vem do usuário logado!
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        // Continua com a chamada HTTP, agora com o token correto.
        return this.http.get<DashboardData>(this.apiUrl, { headers: headers });
      })
    );
  }
}
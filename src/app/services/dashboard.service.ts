import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { DashboardData } from '../models/dashboard-data.model';

import { AuthService } from './auth.service'; // Ajuste o caminho se necessário (ex: ../atividade/auth.service)
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  // 2. Usar a URL dinâmica do environment
  private apiUrl = `${environment.apiUrl}/dashboard/me`;

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) { }

  getDashboardData(): Observable<DashboardData> {
    return this.authService.getIdToken().pipe(
      take(1),
      switchMap(token => {
        if (!token) {
          return throwError(() => new Error('Usuário não autenticado. Token não encontrado.'));
        }

        // 3. Adicionar o cabeçalho do Ngrok junto com o Authorization
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true' // <--- O "Passe Livre"
        });

        return this.http.get<DashboardData>(this.apiUrl, { headers: headers });
      })
    );
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Anotacao } from '../../models/anotacao.model';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnotacaoService {

  private apiUrl = `${environment.apiUrl}/anotacoes`;
 // private apiUrl = 'http://localhost:8080/anotacoes';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Helper para headers
  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    });
  }

  getAnotacoesByAtividade(atividadeId: number): Observable<Anotacao[]> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Sem token'));
        const url = `${this.apiUrl}/search/atividade/${atividadeId}`; 
        return this.http.get<Anotacao[]>(url, { headers: this.getHeaders(token) });
      }),
      catchError(this.handleError)
    );
  }

  getAnotacaoById(id: number): Observable<Anotacao> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Sem token'));
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<Anotacao>(url, { headers: this.getHeaders(token) });
      }),
      catchError(this.handleError)
    );
  }

  create(anotacao: Anotacao): Observable<Anotacao> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Sem token'));
        return this.http.post<Anotacao>(this.apiUrl, anotacao, { headers: this.getHeaders(token) });
      }),
      catchError(this.handleError)
    );
  }

  update(anotacao: Anotacao): Observable<Anotacao> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Sem token'));
        return this.http.put<Anotacao>(`${this.apiUrl}/${anotacao.id}`, anotacao, { headers: this.getHeaders(token) });
      }),
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<any> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Sem token'));
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<any>(url, { headers: this.getHeaders(token) });
      }),
      catchError(this.handleError)
    );
  }

  exportAnotacaoAsTxt(id: number): Observable<any> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Sem token'));
        const url = `${this.apiUrl}/${id}/export/txt`;
        
        // Headers específicos, mas mantendo o ngrok-skip
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
            // Não colocamos Content-Type: application/json aqui porque esperamos texto
        });

        return this.http.get(url, { headers: headers, responseType: 'text', observe: 'response' });
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Ocorreu um erro na chamada da API!', error);
    return throwError(() => new Error('Algo deu errado; por favor, tente novamente mais tarde.'));
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Anotacao } from '../../models/anotacao.model';

@Injectable({
  providedIn: 'root'
})
export class AnotacaoService {

  // A URL base da sua API para o recurso de anotacoes
  private apiUrl = 'https://9ec610758ec0.ngrok-free.app/anotacoes';

  constructor(private http: HttpClient) { }

  getAnotacoesByAtividade(atividadeId: number): Observable<Anotacao[]> {
    // Corrigido para o endpoint correto encontrado no backend
    const url = `${this.apiUrl}/search/atividade/${atividadeId}`; 
    
    return this.http.get<Anotacao[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  getAnotacaoById(id: number): Observable<Anotacao> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Anotacao>(url).pipe(
      catchError(this.handleError)
    );
  }

  create(anotacao: Anotacao): Observable<Anotacao> {
    return this.http.post<Anotacao>(this.apiUrl, anotacao).pipe(
      catchError(this.handleError)
    );
  }

  update(anotacao: Anotacao): Observable<Anotacao> {
    return this.http.put<Anotacao>(`${this.apiUrl}/${anotacao.id}`, anotacao).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    
    return this.http.delete<any>(url).pipe(
      catchError(this.handleError)
    );
  }

  exportAnotacaoAsTxt(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}/export/txt`;
    
    // Faz a requisição esperando um texto e a resposta completa para pegar headers
    return this.http.get(url, { responseType: 'text', observe: 'response' }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Ocorreu um erro na chamada da API!', error);
    return throwError(() => new Error('Algo deu errado; por favor, tente novamente mais tarde.'));
  }
}
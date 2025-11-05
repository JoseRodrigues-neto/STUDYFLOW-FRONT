import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, EMPTY, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Importa o AuthService
import { Usuario, UsuarioRequest } from '../models/usuario.model'; // Importa seu modelo

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  // A URL do seu backend para dados do usuário
  private apiUrl = 'http://localhost:8080/usuarios';

  constructor(
    private http: HttpClient,
    private authService: AuthService // Injete o AuthService para pegar o token
  ) { }

  /**
   * Busca os dados do perfil do usuário logado no backend Java.
   */
  getMeuPerfil(): Observable<Usuario> {
    // 1. Pega o token do AuthService
    return this.authService.getIdToken().pipe(
      switchMap(idToken => {
        // 2. Se não houver token, não faz a chamada
        if (!idToken) {
          console.error('getMeuPerfil: Usuário não autenticado.');
          return throwError(() => new Error('Usuário não autenticado.'));
        }

        // 3. Cria os headers
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        });

        // 4. Faz a chamada GET para o endpoint "meu perfil"
        // (Confirme este endpoint, /me é comum, ou /meuperfil)
        const url = `${this.apiUrl}/me`; 
        
        return this.http.get<Usuario>(url, { headers });
      }),
      catchError(error => {
        console.error("Erro ao buscar perfil no backend:", error);
        return throwError(() => new Error('Falha ao buscar dados do perfil no backend.'));
      })
    );
  }

  atualizarPerfil(id: string, dados: UsuarioRequest): Observable<Usuario> {
    return this.authService.getIdToken().pipe(
      switchMap(idToken => {
        if (!idToken) {
          return throwError(() => new Error('Usuário não autenticado.'));
        }
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        });
        
        // Chama o endpoint PUT /{uid} que você tem no backend
        const url = `${this.apiUrl}/${id}`; 
        
        return this.http.put<Usuario>(url, dados, { headers });
      }),
      catchError(error => {
        console.error("Erro ao atualizar perfil no backend:", error);
        return throwError(() => new Error('Falha ao salvar dados do perfil no backend.'));
      })
    );
  }
}
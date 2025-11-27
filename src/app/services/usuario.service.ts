import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Usuario, UsuarioRequest } from '../models/usuario.model';
import { environment } from '../../environments/environment'; // <--- 1. Import do environment

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  // 2. URL dinâmica (agora pega do environment)
  private apiUrl = `${environment.apiUrl}/usuarios`;
  
 // private apiUrl = 'http://localhost:8080/usuarios';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getMeuPerfil(): Observable<Usuario> {
    return this.authService.getIdToken().pipe(
      switchMap(idToken => {
        if (!idToken) {
          console.error('getMeuPerfil: Usuário não autenticado.');
          return throwError(() => new Error('Usuário não autenticado.'));
        }

        // 3. Adicionado o header do Ngrok
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        });

        const url = `${this.apiUrl}/me`; 
        return this.http.get<Usuario>(url, { headers });
      }),
      catchError(error => {
        console.error("Erro ao buscar perfil no backend:", error);
        return throwError(() => error);
      })
    );
  }

  getMeuPerfilComToken(idToken: string): Observable<Usuario> {
    // 3. Adicionado o header do Ngrok
    const headers = new HttpHeaders({
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    });
    const url = `${this.apiUrl}/me`; 
    return this.http.get<Usuario>(url, { headers }).pipe(
        catchError(error => {
            console.error("Erro ao buscar perfil no backend com token:", error);
            return throwError(() => error);
        })
    );
  }

  verificarLogin(idToken: string): Observable<Usuario> {
    // 3. Adicionado o header do Ngrok
    const headers = new HttpHeaders({
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    });
    const url = `${this.apiUrl}/login`; 
    return this.http.get<Usuario>(url, { headers }).pipe(
        catchError(error => {
            console.error("Erro ao verificar login no backend:", error);
            return throwError(() => error);
        })
    );
  }

  verificarLoginGuard(): Observable<Usuario> {
    return this.authService.getIdToken().pipe(
      switchMap(idToken => {
        if (!idToken) {
          return throwError(() => new Error('Usuário não autenticado para guarda.'));
        }
        // 3. Adicionado o header do Ngrok
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        });
        const url = `${this.apiUrl}/login`;
        return this.http.get<Usuario>(url, { headers });
      })
    );
  }

  atualizarPerfil(uid: string, dados: UsuarioRequest): Observable<Usuario> {
    return this.authService.getIdToken().pipe(
      switchMap(idToken => {
        if (!idToken) {
          return throwError(() => new Error('Usuário não autenticado.'));
        }
        // 3. Adicionado o header do Ngrok
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        });
        
        const url = `${this.apiUrl}/${uid}`; 
        return this.http.put<Usuario>(url, dados, { headers });
      }),
      catchError(error => {
        console.error("Erro ao atualizar perfil no backend:", error);
        return throwError(() => new Error('Falha ao salvar dados do perfil no backend.'));
      })
    );
  }

  salvarAvatarUrl(url: string): Observable<Usuario> {
    return this.authService.getIdToken().pipe(
      switchMap(idToken => {
        if (!idToken) {
          return throwError(() => new Error('Usuário não autenticado.'));
        }

        // 3. Adicionado o header do Ngrok (Mantendo Content-Type text/plain)
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'text/plain',
          'ngrok-skip-browser-warning': 'true'
        });

        const endpointUrl = `${this.apiUrl}/avatar`; 
        return this.http.put<Usuario>(endpointUrl, url, { headers });
      }),
      catchError(error => {
        console.error("Erro ao salvar URL do avatar:", error);
        return throwError(() => new Error('Falha ao salvar a URL da foto.'));
      })
    );
  }

  deleteSelf(): Observable<any> {
    return this.authService.getIdToken().pipe(
      switchMap(idToken => {
        if (!idToken) {
          return throwError(() => new Error('Usuário não autenticado.'));
        }
        // 3. Adicionado o header do Ngrok
        const headers = new HttpHeaders({ 
            'Authorization': `Bearer ${idToken}`,
            'ngrok-skip-browser-warning': 'true'
        });
        
        const url = `${this.apiUrl}/me`; 
        return this.http.delete(url, { headers });
      }),
      catchError(error => {
        console.error("Erro ao deletar usuário no backend:", error);
        return throwError(() => new Error('Falha ao deletar dados no backend.'));
      })
    );
  }
}
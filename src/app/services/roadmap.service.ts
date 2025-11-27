import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Roadmap } from '../models/roadmap.model';
// 1. Importar Environment e AuthService (verifique se o caminho do AuthService está correto)
import { AuthService } from './auth.service'; 
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoadmapService {
 
  // 2. URL dinâmica baseada no arquivo de configuração
  private apiUrl = `${environment.apiUrl}/roadmaps`;
 // private apiUrl = 'http://localhost:8080/roadmaps';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // 3. Método auxiliar atualizado para incluir o header do Ngrok
  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true' // <--- Importante para evitar erro 403 ou HTML
    });
  }

  getRoadmaps(): Observable<Roadmap[]> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Não autenticado'));
        
        return this.http.get<Roadmap[]>(this.apiUrl, {
          headers: this.getHeaders(token)
        });
      })
    );
  }

  getRoadmap(id: number): Observable<Roadmap> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Não autenticado'));

        return this.http.get<Roadmap>(`${this.apiUrl}/${id}`, {
          headers: this.getHeaders(token)
        });
      })
    );
  }

  createRoadmap(roadmap: Roadmap): Observable<Roadmap> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) {
            console.error("Erro: Tentativa de criar roadmap sem login.");
            return throwError(() => new Error('Não autenticado'));
        }

        return this.http.post<Roadmap>(this.apiUrl, roadmap, {
          headers: this.getHeaders(token)
        });
      })
    );
  }

  updateRoadmap(id: number, roadmap: Roadmap): Observable<Roadmap> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Não autenticado'));

        return this.http.put<Roadmap>(`${this.apiUrl}/${id}`, roadmap, {
          headers: this.getHeaders(token)
        });
      })
    );
  }

  deleteRoadmap(id: number): Observable<void> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Não autenticado'));

        return this.http.delete<void>(`${this.apiUrl}/${id}`, {
          headers: this.getHeaders(token)
        });
      })
    );
  }
}
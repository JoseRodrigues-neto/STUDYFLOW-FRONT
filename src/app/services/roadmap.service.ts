import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Roadmap } from '../models/roadmap.model';
import { AuthService } from './auth.service'; // <--- 1. Importamos o AuthService

@Injectable({
  providedIn: 'root'
})
export class RoadmapService {
  private apiUrl = 'https://9ec610758ec0.ngrok-free.app/roadmaps';

  constructor(
    private http: HttpClient,
    private authService: AuthService // <--- 2. Injetamos aqui
  ) { }

  // Método auxiliar para gerar os headers
  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getRoadmaps(): Observable<Roadmap[]> {
    // 3. Usamos switchMap para pegar o token antes da chamada
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

        // AQUI ESTÁ A MÁGICA: Enviamos o roadmap + o token
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
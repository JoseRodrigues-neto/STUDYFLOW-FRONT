import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Roadmap } from '../models/roadmap.model';

@Injectable({
  providedIn: 'root'
})
export class RoadmapService {
  private apiUrl = 'http://localhost:8080/roadmaps';

  constructor(private http: HttpClient) { }

  getRoadmaps(): Observable<Roadmap[]> {
    return this.http.get<Roadmap[]>(this.apiUrl);
  }

  getRoadmap(id: number): Observable<Roadmap> {
    return this.http.get<Roadmap>(`${this.apiUrl}/${id}`);
  }

  createRoadmap(roadmap: Roadmap): Observable<Roadmap> {
    return this.http.post<Roadmap>(this.apiUrl, roadmap);
  }

  updateRoadmap(id: number, roadmap: Roadmap): Observable<Roadmap> {
    return this.http.put<Roadmap>(`${this.apiUrl}/${id}`, roadmap);
  }

  deleteRoadmap(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

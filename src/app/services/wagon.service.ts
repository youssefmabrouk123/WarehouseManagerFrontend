// src/app/services/wagon.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WagonDTO, WagonDetailsDTO } from '../models/wagon.dto';

@Injectable({
  providedIn: 'root'
})
export class WagonService {
  private apiUrl = 'http://localhost:7070/public/api/wagons'; // Adjust port if needed

  constructor(private http: HttpClient) {}

  getAllWagons(): Observable<WagonDTO[]> {
    return this.http.get<WagonDTO[]>(this.apiUrl).pipe(
      catchError(error => throwError(() => new Error('Failed to fetch wagons: ' + error.message)))
    );
  }

  getWagonDetails(wagonId: string): Observable<WagonDetailsDTO> {
    return this.http.get<WagonDetailsDTO>(`${this.apiUrl}/${wagonId}`).pipe(
      catchError(error => throwError(() => new Error('Failed to fetch wagon details: ' + error.message)))
    );
  }
}
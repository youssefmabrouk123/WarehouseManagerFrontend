// src/app/services/caba.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CabaDTO, CabaScanRequest ,ApiScanHistoryItem} from '../models/wagon.dto';

export interface CabaStats {
  totalCabas: number;
  emptyCabas: number;
  inProgressCabas: number;
  filledCabas: number;
}

@Injectable({
  providedIn: 'root'
})
export class CabaService {
  private apiUrl = 'http://localhost:7070/public/api';

  constructor(private http: HttpClient) {}

  getCabaStats(): Observable<CabaStats> {
    return this.http.get<CabaStats>(`${this.apiUrl}/cabas/stats`);
  }

  scanCaba(scanRequest: CabaScanRequest): Observable<CabaDTO> {
    return this.http.post<CabaDTO>(`${this.apiUrl}/cabas/scan`, scanRequest);
  }

  getScanHistory(userId: string): Observable<ApiScanHistoryItem[]> {
    return this.http.get<ApiScanHistoryItem[]>(`${this.apiUrl}/scan-history/user/${userId}`);
  }
}
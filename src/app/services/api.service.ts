// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CabaDTO, CabaScanRequestDTO, ScanHistoryDTO, WagonDTO, WagonDetailsDTO } from '../models/wagon.model';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:7070/public/api'; // Adjust to your backend URL

  constructor(private http: HttpClient) {}

  // Wagon endpoints
  getAllWagons(): Observable<WagonDTO[]> {
    return this.http.get<WagonDTO[]>(`${this.apiUrl}/wagons`);
  }
  // src/app/services/api.service.ts
  getAllCabas(): Observable<CabaDTO[]> {
  return this.http.get<CabaDTO[]>(`${this.apiUrl}/cabas`);
  }

  getWagonDetails(wagonId: string): Observable<WagonDetailsDTO> {
    return this.http.get<WagonDetailsDTO>(`${this.apiUrl}/wagons/${wagonId}`);
  }

  // Caba endpoints
  getCabasByWagonId(wagonId: string): Observable<CabaDTO[]> {
    return this.http.get<CabaDTO[]>(`${this.apiUrl}/cabas/wagon/${wagonId}`);
  }

  scanCaba(scanRequest: CabaScanRequestDTO): Observable<CabaDTO> {
    return this.http.post<CabaDTO>(`${this.apiUrl}/cabas/scan`, scanRequest);
  }

  // Scan History endpoints
  getAllScanHistory(): Observable<ScanHistoryDTO[]> {
    return this.http.get<ScanHistoryDTO[]>(`${this.apiUrl}/scan-history`);
  }

  getScanHistoryByBarcode(barcode: string): Observable<ScanHistoryDTO[]> {
    return this.http.get<ScanHistoryDTO[]>(`${this.apiUrl}/scan-history/barcode/${barcode}`);
  }

  exportScanHistory(startDate?: string, endDate?: string): Observable<Blob> {
    let url = `${this.apiUrl}/scan-history/export`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return this.http.get(url, { responseType: 'blob' });
  }
}
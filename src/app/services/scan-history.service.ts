import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ScanHistory } from '../models/wagon.dto';



@Injectable({
  providedIn: 'root'
})
export class ScanHistoryService {
  private apiUrl = 'http://localhost:7070/public/api/scan-history';
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllScanHistory(): Observable<ScanHistory[]> {
    this.setLoading(true);
    return this.http.get<ScanHistory[]>(this.apiUrl).pipe(
      tap(() => this.setLoading(false)),
      catchError((error) => {
        this.setLoading(false);
        throw error;
      })
    );
  }

  getScanHistoryByWagonId(wagonId: string): Observable<ScanHistory[]> {
    this.setLoading(true);
    return this.http.get<ScanHistory[]>(`${this.apiUrl}/wagon/${wagonId}`).pipe(
      tap(() => this.setLoading(false)),
      catchError((error) => {
        this.setLoading(false);
        throw error;
      })
    );
  }

  getScanHistoryByBarcode(barcode: string): Observable<ScanHistory[]> {
    this.setLoading(true);
    return this.http.get<ScanHistory[]>(`${this.apiUrl}/barcode/${barcode}`).pipe(
      tap(() => this.setLoading(false)),
      catchError((error) => {
        this.setLoading(false);
        throw error;
      })
    );
  }

  getScanHistoryByDateRange(startDate: string, endDate: string): Observable<ScanHistory[]> {
    this.setLoading(true);
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ScanHistory[]>(`${this.apiUrl}/date-range`, {  params }).pipe(
      tap(() => this.setLoading(false)),
      catchError((error) => {
        this.setLoading(false);
        throw error;
      })
    );
  }

  getScanHistoryByUserId(userId: number): Observable<ScanHistory[]> {
    this.setLoading(true);
    return this.http.get<ScanHistory[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(() => this.setLoading(false)),
      catchError((error) => {
        this.setLoading(false);
        throw error;
      })
    );
  }

  exportScanHistoryToCsv(startDate?: string, endDate?: string): Observable<Blob> {
    this.setLoading(true);
    let params = new HttpParams();
    if (startDate && endDate) {
      params = params.set('startDate', startDate).set('endDate', endDate);
    }
    return this.http.get(`${this.apiUrl}/export`, { params, responseType: 'blob' }).pipe(
      tap(() => this.setLoading(false)),
      catchError((error) => {
        this.setLoading(false);
        throw error;
      })
    );
  }
}
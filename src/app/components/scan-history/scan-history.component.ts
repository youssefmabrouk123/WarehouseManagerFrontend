// src/app/components/scan-history/scan-history.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CabaService } from '../../services/caba.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

interface ApiScanHistoryItem {
  id: number;
  barcode: string;
  wagonId: string;
  statusBefore: string;
  statusAfter: string;
  scanTime: string;
  userId: number;
  username: string;
  location: string | null;
}

@Component({
  selector: 'app-scan-history',
  templateUrl: './scan-history.component.html',
  styleUrls: ['./scan-history.component.css']
})
export class ScanHistoryComponent implements OnInit, OnDestroy {
  scanHistory: ApiScanHistoryItem[] = [];
  filteredHistory: ApiScanHistoryItem[] = [];
  isLoading = false;
  errorMessage = '';
  page = 1;
  pageSize = 10;
  sortColumn: keyof ApiScanHistoryItem | '' = 'scanTime'; // Default sort by date
  sortDirection: 'asc' | 'desc' = 'desc'; // Default descending (most recent first)
  searchQuery = ''; // For filtering by barcode or wagonId
  
  private destroy$ = new Subject<void>();
  private userId = JSON.parse(localStorage.getItem('userDetails') || '{}').id || '0'; // Replace with actual user ID from auth service

  constructor(private cabaService: CabaService) {}
  
  ngOnInit() {
    this.loadScanHistory();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadScanHistory() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.cabaService.getScanHistory(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (history: ApiScanHistoryItem[]) => {
          this.scanHistory = history;
          this.applySortAndFilter();
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.errorMessage = 'Erreur lors du chargement de l\'historique des scans.';
          console.error('Error loading scan history:', error);
        }
      });
  }
  
  sort(column: keyof ApiScanHistoryItem) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySortAndFilter();
  }
  
  applySortAndFilter() {
    let filtered = [...this.scanHistory];
    
    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.barcode.toLowerCase().includes(query) ||
        item.wagonId.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (this.sortColumn) {
      filtered.sort((a, b) => {
        const valueA = this.sortColumn ? a[this.sortColumn] : '';
        const valueB = this.sortColumn ? b[this.sortColumn] : '';
        
        if (valueA === null || valueA === undefined) return this.sortDirection === 'asc' ? -1 : 1;
        if (valueB === null || valueB === undefined) return this.sortDirection === 'asc' ? 1 : -1;
        
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return this.sortDirection === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
        return this.sortDirection === 'asc'
          ? (valueA as number) - (valueB as number)
          : (valueB as number) - (valueA as number);
      });
    }
    
    // Apply pagination
    this.filteredHistory = filtered.slice(
      (this.page - 1) * this.pageSize,
      this.page * this.pageSize
    );
  }
  
  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.applySortAndFilter();
    }
  }
  
  onSearchChange() {
    this.page = 1; // Reset to first page on search
    this.applySortAndFilter();
  }
  
  get totalPages(): number {
    return Math.ceil(this.scanHistory.length / this.pageSize);
  }
  
  refresh() {
    this.loadScanHistory();
  }
  
  downloadHistory() {
    const headers = ['ID', 'Code-Barres', 'Wagon', 'Statut Avant', 'Statut Après', 'Date/Heure', 'Utilisateur', 'Emplacement'];
    const csvRows = [
      headers.join(','),
      ...this.scanHistory.map(item =>
        [
          item.id,
          `"${item.barcode}"`, // Quote strings to handle commas
          `"${item.wagonId}"`,
          `"${item.statusBefore}"`,
          `"${item.statusAfter}"`,
          `"${new Date(item.scanTime).toLocaleString('fr-FR')}"`,
          `"${item.username}"`,
          `"${item.location || 'Non spécifié'}"`
        ].join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `scan_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
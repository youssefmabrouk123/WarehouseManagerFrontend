import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ScanHistory } from 'src/app/models/wagon.dto';
import { ScanHistoryService } from 'src/app/services/scan-history.service';

@Component({
  selector: 'app-scan-history-admin',
  templateUrl: './scan-history-admin.component.html',
  styleUrls: ['./scan-history-admin.component.css']
})
export class ScanHistoryAdminComponent implements OnInit {
  scans: ScanHistory[] = [];
  filteredScans: ScanHistory[] = [];
  filterForm: FormGroup;
  isFilterSidebarOpen: boolean = false; // Par défaut, la barre latérale est ouverte

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  constructor(private scanHistoryService: ScanHistoryService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      wagonId: [''],
      barcode: [''],
      startDate: [''],
      endDate: [''],
      userId: ['']
    });
  }

  ngOnInit(): void {
    this.loadAllScans();
  }

  // Charger tous les scans
  loadAllScans(): void {
    this.scanHistoryService.getAllScanHistory().subscribe({
      next: (scans) => {
        this.scans = scans;
        this.applyPagination();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des scans', error);
      }
    });
  }

  // Appliquer les filtres
  applyFilters(): void {
    const { wagonId, barcode, startDate, endDate, userId } = this.filterForm.value;

    if (wagonId) {
      this.scanHistoryService.getScanHistoryByWagonId(wagonId).subscribe({
        next: (scans) => {
          this.scans = scans;
          this.applyPagination();
        },
        error: (error) => {
          console.error('Erreur lors du filtrage par wagonId', error);
        }
      });
    } else if (barcode) {
      this.scanHistoryService.getScanHistoryByBarcode(barcode).subscribe({
        next: (scans) => {
          this.scans = scans;
          this.applyPagination();
        },
        error: (error) => {
          console.error('Erreur lors du filtrage par barcode', error);
        }
      });
    } else if (startDate && endDate) {
      this.scanHistoryService.getScanHistoryByDateRange(startDate, endDate).subscribe({
        next: (scans) => {
          this.scans = scans;
          this.applyPagination();
        },
        error: (error) => {
          console.error('Erreur lors du filtrage par plage de dates', error);
        }
      });
    } else if (userId) {
      this.scanHistoryService.getScanHistoryByUserId(userId).subscribe({
        next: (scans) => {
          this.scans = scans;
          this.applyPagination();
        },
        error: (error) => {
          console.error('Erreur lors du filtrage par userId', error);
        }
      });
    } else {
      this.loadAllScans();
    }
  }

  // Réinitialiser les filtres
  resetFilters(): void {
    this.filterForm.reset();
    this.loadAllScans();
  }

  // Appliquer la pagination
  applyPagination(): void {
    this.totalPages = Math.ceil(this.scans.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.filteredScans = this.scans.slice(start, end);
  }

  // Changer de page
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyPagination();
  }

  // Générer les numéros de page pour la pagination
  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Exporter en CSV
  exportToCsv(): void {
    const { startDate, endDate } = this.filterForm.value;
    this.scanHistoryService.exportScanHistoryToCsv(startDate, endDate).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scan_history.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors de l\'exportation en CSV', error);
      }
    });
  }

  // Basculer la barre latérale de filtres
  toggleFilterSidebar(): void {
    this.isFilterSidebarOpen = !this.isFilterSidebarOpen;
  }
}
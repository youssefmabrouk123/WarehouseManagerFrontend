import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface Caba {
  id: number;
  barcode: string;
  status: 'EMPTY' | 'IN_PROGRESS' | 'FILLED';
  lastScanTime: string;
  lastScannedBy: string;
}

interface WagonDetailsDTO {
  wagonId: string;
  warehouseProduction: string;
  localSiteNumber: string;
  sourceArea: string;
  cabas: Caba[];
  totalCabas: number;
  filledCabas: number;
  inProgressCabas: number;
  fillRate: number;
}

interface WagonDTO {
  wagonId: string;
  fillRate: number;
}


@Component({
  selector: 'app-wagon-dashboard',
  templateUrl: './wagon-dashboard.component.html',
  styleUrls: ['./wagon-dashboard.component.css'],
  animations: [
    trigger('toastAnimation', [
      state('hidden', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden <=> visible', animate('300ms ease-in-out')),
    ]),
  ],
})
export class WagonDashboardComponent implements OnInit {
  wagons: WagonDTO[] = [];
  filteredWagons: WagonDTO[] = [];
  selectedWagon: WagonDetailsDTO | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadWagons();
  }

  loadWagons(): void {
    this.isLoading = true;
    this.http.get<WagonDTO[]>('http://localhost:7070/public/api/wagons').subscribe({
      next: (wagons) => {
        this.wagons = wagons;
        this.filteredWagons = wagons;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des wagons';
        this.isLoading = false;
      },
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filteredWagons = this.wagons.filter((wagon) =>
      wagon.wagonId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  loadWagonDetails(wagonId: string): void {
    this.isLoading = true;
    this.http.get<WagonDetailsDTO>(`http://localhost:7070/public/api/wagons/${wagonId}`).subscribe({
      next: (wagonDetails) => {
        this.selectedWagon = wagonDetails;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des détails du wagon';
        this.isLoading = false;
      },
    });
  }

  emptyWagon(): void {
    if (!this.selectedWagon) return;
    this.isLoading = true;
    this.http.post(`http://localhost:7070/public/api/wagons/${this.selectedWagon.wagonId}/empty`, {}).subscribe({
      next: () => {
        this.successMessage = `Wagon ${this.selectedWagon!.wagonId} vidé avec succès`;
        this.loadWagonDetails(this.selectedWagon!.wagonId);
        this.loadWagons();
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du vidage du wagon';
        this.isLoading = false;
      },
    });
  }
}
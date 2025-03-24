import { Component, OnDestroy, OnInit } from '@angular/core';
import { CabaDTO, CabaScanRequest, WagonDetailsDTO, WagonDTO } from 'src/app/models/wagon.dto';
import { WagonService } from 'src/app/services/wagon.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { SocketService } from 'src/app/services/socket.service';
import { CabaService } from 'src/app/services/caba.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css'],
  animations: [
    trigger('toastAnimation', [
      state('hidden', style({ opacity: 0, transform: 'translateY(100%)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible', animate('300ms ease-out')),
      transition('visible => hidden', animate('200ms ease-in'))
    ]),
    trigger('popupAnimation', [ // Animation pour le popup
      state('hidden', style({ opacity: 0, transform: 'scale(0.9)' })),
      state('visible', style({ opacity: 1, transform: 'scale(1)' })),
      transition('hidden => visible', animate('200ms ease-out')),
      transition('visible => hidden', animate('200ms ease-in'))
    ])
  ]
})
export class TestComponent implements OnInit, OnDestroy {
  wagons: WagonDTO[] = [];
  filteredWagons: WagonDTO[] = [];
  selectedWagon: WagonDetailsDTO | null = null;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  searchTerm = '';
  showScanPopup = false; // Contrôle l'affichage du popup
  scanRequest: CabaScanRequest = { barcode: '', username: 'testuser', location: '' }; // Données du scan
  username = JSON.parse(localStorage.getItem('userDetails') || '{}').fullName || '**********';

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private wagonService: WagonService,
    private socketService: SocketService,
    private cabaService: CabaService // Injection de CabaService
  ) {}

  ngOnInit() {
    this.loadWagons();
    this.setupSearch();
    this.setupSocket();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.socketService.disconnect();
  }

  // Méthode pour ouvrir le popup
  openScanPopup() {
    this.showScanPopup = true;
    this.scanRequest = { barcode: '', username: '', location: '' }; // Réinitialiser les champs
  }

  // Méthode pour fermer le popup
  closeScanPopup() {
    this.showScanPopup = false;
  }

  // Méthode pour scanner le code-barres
  scanBarcode() {
    if (!this.scanRequest.barcode) {
      this.errorMessage = 'Veuillez entrer un code-barres';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    this.isLoading = true;
    this.cabaService.scanCaba(this.scanRequest).subscribe({
      next: (result: CabaDTO) => {
        this.isLoading = false;
        this.successMessage = `Caba ${result.barcode} scanné avec succès (${result.status})`;
        this.closeScanPopup();
        setTimeout(() => this.successMessage = '', 3000);
        this.updateCabaInRealTime(result); // Mettre à jour les données en temps réel
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = `Erreur lors du scan: ${error.message}`;
        setTimeout(() => this.errorMessage = '', 3000);
        console.error('Scan error:', error);
      }
    });
  }

  loadWagons() {
    this.isLoading = true;
    this.wagonService.getAllWagons().subscribe({
      next: (wagons) => {
        this.wagons = wagons;
        this.filterWagons();
        this.isLoading = false;
        console.log('Wagons loaded:', wagons);
      },
      error: (error) => {
        this.errorMessage = `Erreur de chargement des wagons: ${error.message}`;
        this.isLoading = false;
        console.error('Load wagons error:', error);
      }
    });
  }

  loadWagonDetails(wagonId: string) {
    this.isLoading = true;
    this.wagonService.getWagonDetails(wagonId).subscribe({
      next: (details) => {
        this.selectedWagon = details;
        this.isLoading = false;
        console.log('Wagon details loaded:', details);
      },
      error: (error) => {
        this.errorMessage = `Erreur de chargement des détails: ${error.message}`;
        this.isLoading = false;
        console.error('Load wagon details error:', error);
      }
    });
  }

  onSearchChange(searchValue: string) {
    this.searchSubject.next(searchValue);
  }

  private setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.filterWagons();
    });
  }

  private filterWagons() {
    if (!this.searchTerm) {
      this.filteredWagons = [...this.wagons];
    } else {
      this.filteredWagons = this.wagons.filter(wagon =>
        wagon.wagonId.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  private setupSocket() {
    this.socketService.listen('cabaUpdate').pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (caba: CabaDTO) => {
        this.updateCabaInRealTime(caba);
        this.successMessage = `Caba ${caba.barcode} mis à jour à ${caba.status}`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = `Erreur WebSocket: ${error}`;
        console.error('WebSocket error:', error);
      }
    });
  }

  private updateCabaInRealTime(updatedCaba: CabaDTO) {
    console.log('Updating Caba in real-time:', updatedCaba);
    if (this.selectedWagon && this.selectedWagon.wagonId === updatedCaba.wagonId) {
      const index = this.selectedWagon.cabas.findIndex(c => c.barcode === updatedCaba.barcode);
      if (index !== -1) {
        this.selectedWagon.cabas[index] = { ...updatedCaba };
      } else {
        this.selectedWagon.cabas.push({ ...updatedCaba });
      }
      this.updateWagonStats();
    }
    this.loadWagons(); // Rafraîchir la liste des wagons
  }

  private updateWagonStats() {
    if (this.selectedWagon) {
      this.selectedWagon.totalCabas = this.selectedWagon.cabas.length;
      this.selectedWagon.filledCabas = this.selectedWagon.cabas.filter(c => c.status === 'FILLED').length;
      this.selectedWagon.inProgressCabas = this.selectedWagon.cabas.filter(c => c.status === 'IN_PROGRESS').length;
      this.selectedWagon.emptyCabas = this.selectedWagon.cabas.filter(c => c.status === 'EMPTY').length;
      console.log('Updated wagon stats:', this.selectedWagon);
    }
  }
}
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BarcodeFormat, BrowserMultiFormatReader, DecodeHintType } from '@zxing/library';
import { Subject, takeUntil } from 'rxjs';
import { ApiScanHistoryItem, CabaDTO, CabaScanRequest, ScanHistoryItem } from 'src/app/models/wagon.dto';
import { CabaService } from 'src/app/services/caba.service';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.css']
})
export class ScanComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('barcodeInput') barcodeInput!: ElementRef;
  
  barcode = '';
  username = JSON.parse(localStorage.getItem('userDetails') || '{}').username || '**********';
  location = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  scanHistory: ScanHistoryItem[] = [];
  showHistory = false; // Toggle for history visibility
  
  private codeReader = new BrowserMultiFormatReader();
  private destroy$ = new Subject<void>();
  private userId = JSON.parse(localStorage.getItem('userDetails') || '{}').id
   || ''; // Replace with actual user ID from auth service
  
  constructor(private cabaService: CabaService) {}
  
  ngOnInit() {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.EAN_13,
      BarcodeFormat.DATA_MATRIX
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    this.codeReader.hints = hints;
    
    // Removed automatic loadScanHistory() from ngOnInit
    
    if (window.location.hostname === 'localhost') {
      this.barcode = '';
    }
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      if (this.barcodeInput) {
        this.barcodeInput.nativeElement.focus();
      }
    }, 100);
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.codeReader.reset();
  }
  
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Le fichier sélectionné doit être une image.';
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'La taille de l\'image ne doit pas dépasser 5 MB.';
        return;
      }
      
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
      this.errorMessage = '';
    }
  }
  
  scanImage() {
    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner une image à scanner.';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const img = new Image();
    img.src = URL.createObjectURL(this.selectedFile);
    
    img.onload = () => {
      this.codeReader
        .decodeFromImageElement(img)
        .then(result => {
          this.barcode = result.getText();
          console.log('Code-barres extrait:', this.barcode);
          this.scanBarcode();
        })
        .catch(err => {
          this.isLoading = false;
          this.errorMessage = 'Aucun code-barres détecté dans l\'image.';
          console.error('Erreur de scan:', err);
        })
        .finally(() => {
          URL.revokeObjectURL(img.src);
        });
    };
    
    img.onerror = () => {
      this.isLoading = false;
      this.errorMessage = 'Erreur lors du chargement de l\'image.';
      URL.revokeObjectURL(img.src);
    };
  }
  
  scanBarcode() {
    if (!this.barcode) {
      this.errorMessage = 'Aucun code-barres détecté ou saisi.';
      this.isLoading = false;
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const scanRequest: CabaScanRequest = {
      barcode: this.barcode.trim(),
      username: this.username,
      location: this.location
    };
    
    this.cabaService.scanCaba(scanRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: CabaDTO) => {
          this.isLoading = false;
          this.successMessage = `Caba ${result.barcode} scanné avec succès ! Statut: ${result.status}`;
          this.addToScanHistory(result.barcode, result.status);
          this.clearForm();
          setTimeout(() => this.barcodeInput.nativeElement.focus(), 100);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          const apiError = error.error;
          if (apiError && apiError.errorCode) {
            switch (apiError.errorCode) {
              case 'CONFLICT':
                this.errorMessage = `Erreur : ${apiError.message}`;
                break;
              case 'NOT_FOUND':
                this.errorMessage = `Erreur : Le Caba avec le code-barres ${apiError.barcode} est introuvable.`;
                break;
              default:
                this.errorMessage = 'Une erreur inconnue est survenue.';
            }
          } else {
            this.errorMessage = error.statusText || 'Erreur de connexion.';
          }
        }
      });
  }  
  
  clearImage() {
    this.selectedFile = null;
    this.imagePreview = null;
  }
  
  clearForm() {
    this.barcode = '';
    this.clearImage();
  }
  
  toggleHistory() {
    this.showHistory = !this.showHistory;
    if (this.showHistory && this.scanHistory.length === 0) {
      this.loadScanHistory(); // Load history only when toggled on and not yet loaded
    }
  }
  
  private addToScanHistory(barcode: string, status: string) {
    const scanItem: ScanHistoryItem = {
      barcode,
      timestamp: new Date(),
      status
    };
    
    this.scanHistory.unshift(scanItem);
    if (this.scanHistory.length > 10) {
      this.scanHistory = this.scanHistory.slice(0, 10);
    }
    
    // If history is visible, refresh it from API
    if (this.showHistory) {
      this.loadScanHistory();
    }
  }
  
  private loadScanHistory() {
    this.isLoading = true;
    this.cabaService.getScanHistory(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (history: ApiScanHistoryItem[]) => {
          this.scanHistory = history
            .map(item => ({
              barcode: item.barcode,
              timestamp: new Date(item.scanTime),
              status: item.statusAfter
            }))
            .slice(0, 10);
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.errorMessage = 'Erreur lors du chargement de l\'historique des scans.';
          console.error('Error loading scan history:', error);
        }
      });
  }
}

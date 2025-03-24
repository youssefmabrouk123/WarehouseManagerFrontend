// src/app/models/wagon.dto.ts
export interface WagonDTO {
    id: number;
    wagonId: string;
    warehouseProduction: string;
    localSiteNumber: string;
    sourceArea: string;
    totalCabas: number;
    filledCabas: number;
    fillRate: number;
  }
  
  export interface WagonDetailsDTO extends WagonDTO {
    inProgressCabas: number;
    emptyCabas: number;
    cabas: CabaDTO[];
  }
  
  export interface CabaDTO {
    id: number;
    barcode: string;
    partNumber?: string;
    boxType?: string;
    boxNumber?: string;
    unit?: string;
    weight?: number;
    qmin?: number;
    qmax?: number;
    whLocation?: string;
    wipLocation?: string;
    mg?: string;
    status: 'EMPTY' | 'IN_PROGRESS' | 'FILLED';
    wagonId?: string;
    lastScanTime?: string;
    lastScannedBy?: string;
    lastTime?: string;
  }


  export interface CabaScanRequest {
    barcode: string;
    username: string;
    location: string;
  }

  export interface ApiScanHistoryItem {
    id: number;
    barcode: string;
    wagonId: string;
    statusBefore: string;
    statusAfter: string;
    scanTime: string; // ISO date string
    userId: number;
    username: string;
    location: string | null;
  }
  
  // Define interface for UI display
  export interface ScanHistoryItem {
    barcode: string;
    timestamp: Date;
    status: string;
  }


  export interface User {
    id?: number;
    nom: string;
    email: string;
    password: string;
    role: string;
    username: string;
    fullName: string;
    active: boolean;
  }

  export interface ScanHistory {
    id: number;
    barcode: string;
    wagonId: string;
    statusBefore: string;
    statusAfter: string;
    scanTime: string;
    userId: number;
    username: string;
    location: string;
  }
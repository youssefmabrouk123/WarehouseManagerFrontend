// src/app/models/wagon.model.ts
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
  
  // src/app/models/caba.model.ts
  export interface CabaDTO {
    id: number;
    barcode: string;
    partNumber: string;
    boxType: string;
    boxNumber: string;
    unit: string;
    weight: number;
    qmin: number;
    qmax: number;
    whLocation: string;
    wipLocation: string;
    mg: string;
    status: 'EMPTY' | 'IN_PROGRESS' | 'FILLED';
    wagonId?: string;
    lastScanTime?: string;
    lastScannedBy?: string;
  }
  
  export interface CabaScanRequestDTO {
    barcode: string;
    username: string;
    location: string;
  }
  
  // src/app/models/scan-history.model.ts
  export interface ScanHistoryDTO {
    id: number;
    barcode: string;
    wagonId: string;
    statusBefore: 'EMPTY' | 'IN_PROGRESS' | 'FILLED';
    statusAfter: 'EMPTY' | 'IN_PROGRESS' | 'FILLED';
    scanTime: string;
    userId?: number;
    username?: string;
    location: string;
  }
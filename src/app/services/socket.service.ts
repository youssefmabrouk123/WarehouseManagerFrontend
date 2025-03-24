// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    this.socket = io.default('http://localhost:9090', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server:', this.socket.id);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket.IO connection error:', error);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Disconnected from Socket.IO server:', reason);
    });
  }

  listen(eventName: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(eventName, (data: any) => {
        console.log(`Received ${eventName} event:`, data);
        observer.next(data);
      });

      this.socket.on('error', (error: any) => {
        console.error('Socket.IO error:', error);
        observer.error(error);
      });

      return () => {
        this.socket.off(eventName);
        console.log(`Stopped listening to ${eventName}`);
      };
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Socket.IO client disconnected');
    }
  }
}
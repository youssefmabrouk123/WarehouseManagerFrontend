import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent implements OnInit {
  sidebarCollapsed: boolean = false;
  selectedMenu: string = 'dashboard';
  user = localStorage.getItem('userDetails') ? JSON.parse(localStorage.getItem('userDetails') as string) : { name: 'Utilisateur inconnu', role: 'Rôle non défini' };

  menus = [
    // { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
    { id: 'users', label: 'Users', icon: 'fa-solid fa-people-group' },
    { id: 'wagons', label: 'Wagons', icon: 'fa-boxes' },
    // { id: 'scan', label: 'Scan', icon: 'fa-clipboard-list' },
    { id: 'scan-history', label: 'Scan-history', icon: 'fa-truck' },
    // { id: 'reports', label: 'Reports', icon: 'fa-chart-bar' },
    { id: 'settings', label: 'Settings', icon: 'fa-cog' }
  ];

  stats = [
    { title: 'Total Inventory', value: '12,548', icon: 'fa-boxes', iconBgColor: 'bg-primary-100 text-primary-500', changeIcon: 'fa-arrow-up', changeText: '12% from last month', changeColor: 'text-green-500' },
    { title: 'Pending Orders', value: '284', icon: 'fa-clipboard-list', iconBgColor: 'bg-green-100 text-green-500', changeIcon: 'fa-arrow-up', changeText: '8% from last month', changeColor: 'text-red-500' },
    { title: 'Shipments', value: '856', icon: 'fa-truck-loading', iconBgColor: 'bg-yellow-100 text-yellow-500', changeIcon: 'fa-arrow-up', changeText: '5% from last month', changeColor: 'text-green-500' },
    { title: 'Total Revenue', value: '$1,248,560', icon: 'fa-dollar-sign', iconBgColor: 'bg-blue-100 text-blue-500', changeIcon: 'fa-arrow-up', changeText: '15% from last month', changeColor: 'text-green-500' }
  ];

  activities = [
    { title: 'Shipment Received', description: '12 pallets of electronics received from Supplier A', time: '2 hours ago', icon: 'fa-inbox', iconBgColor: 'bg-blue-500' },
    { title: 'Order Shipped', description: 'Order #45289 was shipped to Customer XYZ Inc.', time: '5 hours ago', icon: 'fa-truck', iconBgColor: 'bg-green-500' },
    { title: 'Low Stock Alert', description: 'Item SKU-8876 has reached minimum threshold', time: 'Yesterday', icon: 'fa-exclamation-triangle', iconBgColor: 'bg-yellow-500' },
    { title: 'New Order Placed', description: 'Customer ABC Corp placed order #48290', time: 'Yesterday', icon: 'fa-plus', iconBgColor: 'bg-purple-500' }
  ];

  constructor(private router: Router) {} // Injection de Router

  ngOnInit(): void {
    // Récupérer les données de l'utilisateur depuis le localStorage
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      this.user = JSON.parse(userDetails);
      // Si l'API renvoie des champs comme "name" et "role", on les utilise
      // Sinon, ajuste selon la structure réelle de l'API (par exemple, "userName" au lieu de "name")
      this.user.name = this.user.name || this.user.userName || 'Utilisateur inconnu';
      this.user.role = this.user.role || 'Rôle non défini';
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  selectMenu(menu: string): void {
    this.selectedMenu = menu;
    if (this.sidebarCollapsed) {
      this.sidebarCollapsed = false;
    }
  }

  logout(): void {
    // Vider le localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userDetails');
    // Rediriger vers la page de connexion
    this.router.navigate(['/signin']);
  }
}
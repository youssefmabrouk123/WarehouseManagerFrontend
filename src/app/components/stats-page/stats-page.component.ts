// src/app/components/stats-page/stats-page.component.ts
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CabaService, CabaStats } from '../../services/caba.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-stats-page',
  templateUrl: './stats-page.component.html',
  styleUrls: ['./stats-page.component.css']
})
export class StatsPageComponent implements OnInit, AfterViewInit {
  stats: CabaStats | null = null;
  errorMessage = '';
  isLoading = false;

  // Références aux éléments canvas
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutChart') donutChartRef!: ElementRef<HTMLCanvasElement>;

  constructor(private cabaService: CabaService) {}

  ngOnInit() {
    this.loadStats();
  }

  ngAfterViewInit() {
    // Les éléments DOM sont disponibles ici, mais on attend les données
  }

  loadStats() {
    this.isLoading = true;
    this.cabaService.getCabaStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
        this.renderCharts(); // Appeler renderCharts après avoir les données
      },
      error: (error) => {
        this.errorMessage = `Erreur lors du chargement des statistiques: ${error.message}`;
        this.isLoading = false;
        console.error('Stats load error:', error);
      }
    });
  }

  renderCharts() {
    if (!this.stats || !this.pieChartRef || !this.barChartRef || !this.donutChartRef) {
      console.warn('Charts cannot be rendered: stats or canvas references are missing');
      return;
    }

    // Graphique Camembert (Pie Chart)
    new Chart(this.pieChartRef.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Vides', 'En cours', 'Remplis'],
        datasets: [{
          data: [this.stats.emptyCabas, this.stats.inProgressCabas, this.stats.filledCabas],
          backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top', labels: { font: { size: 14 } } },
          title: { display: true, text: 'Répartition des Cabas', font: { size: 18 } }
        }
      }
    });

    // Graphique en Barres (Bar Chart)
    new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Vides', 'En cours', 'Remplis'],
        datasets: [{
          label: 'Nombre de Cabas',
          data: [this.stats.emptyCabas, this.stats.inProgressCabas, this.stats.filledCabas],
          backgroundColor: '#36A2EB',
          borderColor: '#1E90FF',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Nombre' } }
        },
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Statistiques par Statut', font: { size: 18 } }
        }
      }
    });

    // Graphique en Donut (Doughnut Chart)
    new Chart(this.donutChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Vides', 'En cours', 'Remplis'],
        datasets: [{
          data: [this.stats.emptyCabas, this.stats.inProgressCabas, this.stats.filledCabas],
          backgroundColor: ['#FF9F1C', '#2AB7CA', '#FED766'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 14 } } },
          title: { display: true, text: 'Distribution des Cabas', font: { size: 18 } }
        }
      }
    });
  }
}
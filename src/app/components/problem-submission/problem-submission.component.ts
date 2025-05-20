import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-problem-submission',
  templateUrl: './problem-submission.component.html',
  styleUrls: ['./problem-submission.component.css']
})
export class ProblemSubmissionComponent implements OnInit {
  successMessage: string | null = null;
  errorMessage: string | null = null;
  userId: string = 'N/A';
  user = { name: 'Utilisateur inconnu', role: 'Rôle non défini', id: 'N/A' };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      try {
        this.user = JSON.parse(userDetails);
        this.user.name = this.user.name || 'Utilisateur inconnu';
        this.user.role = this.user.role || 'Rôle non défini';
        this.userId = this.user.id ? this.user.id.toString() : 'N/A';
        console.log('User ID:', this.userId);
      } catch (e) {
        console.error('Error parsing userDetails', e);
      }
    }
  }

  submitProblem() {
    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement | null;
    const problemTypeSelect = document.querySelector('select[name="problemType"]') as HTMLSelectElement | null;
    const descriptionTextarea = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement | null;

    const problemData = {
      title: titleInput ? titleInput.value : '',
      userId: this.userId,
      problemType: problemTypeSelect ? problemTypeSelect.value : '',
      description: descriptionTextarea ? descriptionTextarea.value : '',
    };

    this.http.post('http://localhost:7070/public/api/problems', problemData).subscribe(
      response => {
        this.successMessage = 'Problème soumis avec succès !';
        this.errorMessage = null;
        console.log('Problem submitted', response);
        this.resetForm();
      },
      error => {
        this.errorMessage = 'Échec de la soumission du problème. Veuillez réessayer.';
        this.successMessage = null;
        console.error('Error submitting problem', error);
      }
    );
  }

  resetForm() {
    const form = document.querySelector('form');
    if (form) {
      form.reset();
    }
  }
}
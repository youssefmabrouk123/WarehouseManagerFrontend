import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/wagon.dto';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  userForm: FormGroup;
  isModalOpen: boolean = false;
  isEditing: boolean = false;
  selectedUserId: number | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  isDeleteModalOpen: boolean = false;
  userToDelete: number | null = null;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  // Recherche
  searchTerm: string = '';

  constructor(private userService: UserService, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      nom: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      role: ['', Validators.required],
      username: [''],
      fullName: ['', Validators.required],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilterAndPagination();
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des utilisateurs';
        console.error(error);
      }
    });
  }

  // Filtrer et paginer les utilisateurs
  applyFilterAndPagination(): void {
    let filtered = this.users;

    // Filtrer par terme de recherche
    if (this.searchTerm) {
      filtered = filtered.filter(user =>
        user.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Calculer la pagination
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.filteredUsers = filtered.slice(start, end);
  }

  // Recherche
  onSearch(): void {
    this.currentPage = 1; // Réinitialiser la page lors de la recherche
    this.applyFilterAndPagination();
  }

  // Changer de page
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyFilterAndPagination();
  }

  // Ouvrir la modale pour ajouter/modifier
  openModal(user?: User): void {
    this.isModalOpen = true;
    if (user) {
      this.isEditing = true;
      this.selectedUserId = user.id!;
      this.userForm.patchValue(user);
      this.userForm.get('password')?.setValue('');
    } else {
      this.isEditing = false;
      this.selectedUserId = null;
      this.userForm.reset({ active: true });
    }
  }

  // Fermer la modale
  closeModal(): void {
    this.isModalOpen = false;
    this.isEditing = false;
    this.selectedUserId = null;
    this.userForm.reset({ active: true });
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Soumettre le formulaire
  onSubmit(): void {
    if (this.userForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
      return;
    }

    const user: User = this.userForm.value;
    user.username = user.fullName;

    if (this.isEditing && this.selectedUserId) {
      this.userService.updateUser(this.selectedUserId, user).subscribe({
        next: () => {
          this.successMessage = 'Utilisateur mis à jour avec succès';
          this.loadUsers();
          setTimeout(() => this.closeModal(), 1500);
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la mise à jour de l\'utilisateur';
          console.error(error);
        }
      });
    } else {
      this.userService.createUser(user).subscribe({
        next: () => {
          this.successMessage = 'Utilisateur créé avec succès';
          this.loadUsers();
          setTimeout(() => this.closeModal(), 1500);
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la création de l\'utilisateur';
          console.error(error);
        }
      });
    }
  }

  // Ouvrir la modale de suppression
  openDeleteModal(userId: number): void {
    this.userToDelete = userId;
    this.isDeleteModalOpen = true;
  }

  // Fermer la modale de suppression
  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.userToDelete = null;
  }

  // Confirmer la suppression
  confirmDelete(): void {
    if (this.userToDelete) {
      this.userService.deleteUser(this.userToDelete).subscribe({
        next: () => {
          this.successMessage = 'Utilisateur supprimé avec succès';
          this.loadUsers();
          this.closeDeleteModal();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression de l\'utilisateur';
          console.error(error);
          this.closeDeleteModal();
        }
      });
    }
  }
}
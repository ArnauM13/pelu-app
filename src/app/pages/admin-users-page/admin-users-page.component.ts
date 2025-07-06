import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, getDocs, doc, updateDoc } from '@angular/fire/firestore';
import { RoleService, UserRole } from '../../auth/role.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users-page.component.html',
  styleUrls: ['./admin-users-page.component.scss']
})
export class AdminUsersPageComponent implements OnInit {
  private firestore = inject(Firestore);
  private roleService = inject(RoleService);
  private authService = inject(AuthService);

  // Public signals
  readonly userRole = this.roleService.userRole;
  readonly isAdmin = this.roleService.isAdmin;

  users: UserRole[] = [];
  isLoading = true;
  searchTerm = '';
  selectedRole = 'all';

  get filteredUsers() {
    return this.users.filter(user => {
      const matchesSearch = user.displayName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = this.selectedRole === 'all' || user.role === this.selectedRole;
      return matchesSearch && matchesRole;
    });
  }

  get stylistCount() {
    return this.users.filter(u => u.role === 'stylist').length;
  }

  get adminCount() {
    return this.users.filter(u => u.role === 'admin').length;
  }

  async ngOnInit() {
    await this.loadUsers();
  }

  private async loadUsers() {
    try {
      this.isLoading = true;
      const usersCollection = collection(this.firestore, 'users');
      const snapshot = await getDocs(usersCollection);

      this.users = snapshot.docs.map(doc => {
        const data = doc.data() as UserRole;
        return {
          ...data,
          createdAt: data.createdAt instanceof Date ? data.createdAt : (data.createdAt as any)?.toDate() || new Date(),
          updatedAt: data.updatedAt instanceof Date ? data.updatedAt : (data.updatedAt as any)?.toDate() || new Date()
        };
      });
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async promoteToStylist(user: UserRole) {
    try {
      await this.roleService.promoteToStylist(user.uid, user.stylistInfo);
      await this.loadUsers(); // Refresh the list
      alert(`${user.displayName} promovido a peluquero`);
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Error al promover usuario');
    }
  }

  async demoteToUser(user: UserRole) {
    try {
      await this.roleService.demoteToUser(user.uid);
      await this.loadUsers(); // Refresh the list
      alert(`${user.displayName} degradado a usuario`);
    } catch (error) {
      console.error('Error demoting user:', error);
      alert('Error al degradar usuario');
    }
  }

  async promoteToAdmin(user: UserRole) {
    try {
      await this.roleService.promoteToAdmin(user.uid);
      await this.loadUsers(); // Refresh the list
      alert(`${user.displayName} promovido a administrador`);
    } catch (error) {
      console.error('Error promoting to admin:', error);
      alert('Error al promover a administrador');
    }
  }

  getRoleBadgeClass(role: string) {
    switch (role) {
      case 'admin':
        return 'admin-badge';
      case 'stylist':
        return 'stylist-badge';
      case 'user':
        return 'user-badge';
      default:
        return '';
    }
  }

  getRoleDisplayName(role: string) {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'stylist':
        return 'Peluquero';
      case 'user':
        return 'Usuario';
      default:
        return role;
    }
  }
}

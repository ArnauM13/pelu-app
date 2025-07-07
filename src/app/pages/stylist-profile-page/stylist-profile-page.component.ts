import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RoleService, UserRole } from '../../auth/role.service';
import { AuthService } from '../../auth/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-stylist-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './stylist-profile-page.component.html',
  styleUrls: ['./stylist-profile-page.component.scss']
})
export class StylistProfilePageComponent {
  private roleService = inject(RoleService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  // Public signals
  readonly userRole = this.roleService.userRole;
  readonly userDisplayName = this.authService.userDisplayName;

  // Form data
  profileData = {
    displayName: '',
    businessName: '',
    phone: '',
    address: '',
    specialties: [] as string[],
    newSpecialty: ''
  };

  isEditing = false;
  isLoading = false;

  constructor() {
    this.loadProfileData();
  }

  private loadProfileData() {
    const role = this.userRole();
    if (role) {
      this.profileData = {
        displayName: role.displayName || '',
        businessName: role.stylistInfo?.businessName || '',
        phone: role.stylistInfo?.phone || '',
        address: role.stylistInfo?.address || '',
        specialties: role.stylistInfo?.specialties || [],
        newSpecialty: ''
      };
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadProfileData(); // Reset form
    }
  }

  addSpecialty() {
    if (this.profileData.newSpecialty.trim() && !this.profileData.specialties.includes(this.profileData.newSpecialty.trim())) {
      this.profileData.specialties.push(this.profileData.newSpecialty.trim());
      this.profileData.newSpecialty = '';
    }
  }

  removeSpecialty(index: number) {
    this.profileData.specialties.splice(index, 1);
  }

  async saveProfile() {
    if (!this.userRole()) return;

    this.isLoading = true;
    try {
      const updates: Partial<UserRole> = {
        displayName: this.profileData.displayName,
        stylistInfo: {
          businessName: this.profileData.businessName,
          phone: this.profileData.phone,
          address: this.profileData.address,
          specialties: this.profileData.specialties
        }
      };

      await this.roleService.updateUserRole(this.userRole()!.uid, updates);
      this.isEditing = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Perfil actualitzat',
        detail: 'El teu perfil s\'ha actualitzat correctament'
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No s\'ha pogut actualitzar el perfil'
      });
    } finally {
      this.isLoading = false;
    }
  }

  goBack() {
    this.router.navigate(['/stylist/dashboard']);
  }
}

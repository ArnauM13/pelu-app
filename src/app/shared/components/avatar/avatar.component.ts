import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AvatarData {
  imageUrl?: string;
  name?: string;
  surname?: string;
  email?: string;
}

@Component({
  selector: 'pelu-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="avatar"
      [class.has-image]="hasImage()"
      [style.background-image]="backgroundImageStyle()"
      [title]="tooltipText()"
    >
      <div *ngIf="!hasImage() || imageLoadError()" class="initials">
        {{ initials() }}
      </div>
    </div>
  `,
  styles: [`
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #6366f1;
      color: white;
      font-weight: 600;
      font-size: 14px;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      border: 2px solid #e5e7eb;
      transition: all 0.2s ease;
    }

    .avatar:hover {
      transform: scale(1.05);
      border-color: #d1d5db;
    }

    .avatar.has-image {
      background-color: transparent;
    }

    .initials {
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Size variants */
    .avatar.small {
      width: 32px;
      height: 32px;
      font-size: 12px;
    }

    .avatar.large {
      width: 56px;
      height: 56px;
      font-size: 18px;
    }

    .avatar.xlarge {
      width: 80px;
      height: 80px;
      font-size: 24px;
    }
  `]
})
export class AvatarComponent {
  @Input() data: AvatarData = {};
  @Input() size: 'small' | 'medium' | 'large' | 'xlarge' = 'medium';

  private readonly imageLoadErrorSignal = signal(false);

  readonly imageLoadError = computed(() => this.imageLoadErrorSignal());

  readonly hasImage = computed(() => {
    const hasImage = !!this.data.imageUrl && this.data.imageUrl.trim() !== '';
    return hasImage;
  });

  readonly backgroundImageStyle = computed(() => {
    if (this.hasImage()) {
      const style = `url(${this.data.imageUrl})`;
      console.log('Avatar - Background style:', style);
      return style;
    }
    console.log('Avatar - No background image');
    return '';
  });

      readonly initials = computed(() => {
    console.log('Avatar - Received data:', this.data);

    const name = this.data.name || '';
    const surname = this.data.surname || '';

    console.log('Avatar - Name:', name, 'Surname:', surname);

    if (name && surname) {
      const result = `${name.charAt(0)}${surname.charAt(0)}`;
      console.log('Avatar - Showing initials:', result);
      return result;
    } else if (name) {
      const result = name.charAt(0);
      console.log('Avatar - Showing first letter of name:', result);
      return result;
    } else if (this.data.email) {
      const result = this.data.email.charAt(0).toUpperCase();
      console.log('Avatar - Showing first letter of email:', result);
      return result;
    }

    console.log('Avatar - Showing fallback emoji');
    return '👤';
  });

  readonly tooltipText = computed(() => {
    return `${this.data.name} ${this.data.surname}`;
  });
}

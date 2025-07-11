import { Component, Input, computed, signal, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
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
      [class.has-image]="hasImage() && !imageLoadError()"
      [class.small]="size === 'small'"
      [class.medium]="size === 'medium'"
      [class.large]="size === 'large'"
      [class.xlarge]="size === 'xlarge'"
      [title]="tooltipText()"
    >
      <!-- Hidden image for error detection -->
      <img
        *ngIf="hasImage()"
        [src]="data.imageUrl"
        (load)="onImageLoad()"
        (error)="onImageError()"
        style="display: none;"
        alt=""
      />

      <!-- Background image or initials -->
      <div
        *ngIf="hasImage() && !imageLoadError()"
        class="avatar-image"
        [style.background-image]="backgroundImageStyle()"
      ></div>

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
      border: 2px solid #e5e7eb;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    .avatar:hover {
      transform: scale(1.05);
      border-color: #d1d5db;
    }

    .avatar.has-image {
      background-color: transparent;
    }

    .avatar-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      border-radius: 50%;
    }

    .initials {
      text-transform: uppercase;
      letter-spacing: 0.5px;
      z-index: 1;
      position: relative;
    }

    /* Size variants */
    .avatar.small {
      width: 32px;
      height: 32px;
      font-size: 12px;
    }

    .avatar.medium {
      width: 40px;
      height: 40px;
      font-size: 14px;
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
export class AvatarComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: AvatarData = {};
  @Input() size: 'small' | 'medium' | 'large' | 'xlarge' = 'medium';

  private readonly imageLoadErrorSignal = signal(false);
  private readonly imageLoadedSignal = signal(false);
  private previousImageUrl: string | undefined;

  readonly imageLoadError = computed(() => this.imageLoadErrorSignal());
  readonly imageLoaded = computed(() => this.imageLoadedSignal());

  readonly hasImage = computed(() => {
    const hasImage = !!this.data.imageUrl && this.data.imageUrl.trim() !== '';
    return hasImage;
  });

  readonly backgroundImageStyle = computed(() => {
    if (this.hasImage() && !this.imageLoadError()) {
      return `url(${this.data.imageUrl})`;
    }
    return '';
  });

  readonly initials = computed(() => {
    const name = this.data.name || '';
    const surname = this.data.surname || '';

    if (name && surname) {
      return `${name.charAt(0)}${surname.charAt(0)}`;
    } else if (name) {
      return name.charAt(0);
    } else if (this.data.email) {
      return this.data.email.charAt(0).toUpperCase();
    }

    return '👤';
  });

  readonly tooltipText = computed(() => {
    const name = this.data.name || '';
    const surname = this.data.surname || '';
    return `${name} ${surname}`.trim() || this.data.email || 'User';
  });

  ngOnInit() {
    this.resetImageState();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reset error state when imageUrl changes
    if (changes['data'] && this.data.imageUrl !== this.previousImageUrl) {
      this.previousImageUrl = this.data.imageUrl;
      this.resetImageState();
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  onImageLoad() {
    this.imageLoadedSignal.set(true);
    this.imageLoadErrorSignal.set(false);
  }

  onImageError() {
    this.imageLoadErrorSignal.set(true);
    this.imageLoadedSignal.set(false);
  }

  private resetImageState() {
    this.imageLoadErrorSignal.set(false);
    this.imageLoadedSignal.set(false);
  }
}

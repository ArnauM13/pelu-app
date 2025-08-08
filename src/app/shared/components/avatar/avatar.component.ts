import {
  Component,
  Input,
  computed,
  signal,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AvatarData {
  imageUrl?: string;
  name?: string;
  surname?: string;
  email?: string;
}

@Component({
  selector: 'pelu-avatar',
  imports: [CommonModule],
  styleUrls: ['./avatar.component.scss'],
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
})
export class AvatarComponent implements OnInit, OnChanges {
  @Input() data: AvatarData = {};
  @Input() size: 'small' | 'medium' | 'large' | 'xlarge' = 'medium';

  private readonly imageLoadErrorSignal = signal(false);
  private readonly imageLoadedSignal = signal(false);
  private readonly dataSignal = signal<AvatarData>({});
  private previousImageUrl: string | undefined;

  readonly imageLoadError = computed(() => this.imageLoadErrorSignal());
  readonly imageLoaded = computed(() => this.imageLoadedSignal());

  readonly hasImage = computed(() => {
    const data = this.dataSignal();
    const hasImage = !!data.imageUrl && data.imageUrl.trim() !== '';
    return hasImage;
  });

  readonly backgroundImageStyle = computed(() => {
    const data = this.dataSignal();
    if (this.hasImage() && !this.imageLoadError()) {
      return `url(${data.imageUrl})`;
    }
    return '';
  });

  readonly initials = computed(() => {
    const data = this.dataSignal();
    const name = data.name || '';
    const surname = data.surname || '';

    if (name && surname) {
      return `${name.charAt(0)}${surname.charAt(0)}`;
    } else if (name) {
      return name.charAt(0);
    } else if (data.email) {
      return data.email.charAt(0).toUpperCase();
    }

    return '👤';
  });

  readonly tooltipText = computed(() => {
    const data = this.dataSignal();
    const name = data.name || '';
    const surname = data.surname || '';
    return `${name} ${surname}`.trim() || data.email || 'User';
  });

  ngOnInit() {
    this.resetImageState();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Update the signal when input changes
    if (changes['data']) {
      this.dataSignal.set(this.data);
    }

    // Reset error state when imageUrl changes
    if (changes['data'] && this.data.imageUrl !== this.previousImageUrl) {
      this.previousImageUrl = this.data.imageUrl;
      this.resetImageState();
    }
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

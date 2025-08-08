import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pelu-calendar-loader',
  imports: [CommonModule],
  template: `
    <div class="calendar-loader">
      <div class="calendar-loader-content">
        <div class="calendar-loader-spinner"></div>
        <h3 class="calendar-loader-title">Carregant calendari...</h3>
        <p class="calendar-loader-message">Recuperant cites i configuracions</p>
        <div class="calendar-loader-progress">
          <div class="calendar-loader-progress-bar"></div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .calendar-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(4px);
        z-index: 9999;
      }

      .calendar-loader-content {
        text-align: center;
        background: white;
        padding: 3rem;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        min-width: 300px;
        border: 1px solid #e5e7eb;
      }

      .calendar-loader-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid #f3f4f6;
        border-top: 4px solid #3b82f6;
        border-radius: 50%;
        animation: calendarSpin 1.2s linear infinite;
        margin: 0 auto 1.5rem;
      }

      .calendar-loader-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 0.5rem 0;
      }

      .calendar-loader-message {
        font-size: 0.9rem;
        color: #6b7280;
        margin: 0 0 1.5rem 0;
        font-weight: 400;
      }

      .calendar-loader-progress {
        width: 100%;
        height: 4px;
        background: #f3f4f6;
        border-radius: 2px;
        overflow: hidden;
      }

      .calendar-loader-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #1d4ed8);
        border-radius: 2px;
        animation: calendarProgress 2s ease-in-out infinite;
        width: 30%;
      }

      @keyframes calendarSpin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes calendarProgress {
        0% {
          transform: translateX(-100%);
        }
        50% {
          transform: translateX(200%);
        }
        100% {
          transform: translateX(-100%);
        }
      }

      /* Responsive adjustments for calendar loader */
      @media (max-width: 768px) {
        .calendar-loader-content {
          padding: 2rem;
          min-width: 250px;
          margin: 1rem;
        }

        .calendar-loader-spinner {
          width: 40px;
          height: 40px;
          border-width: 3px;
        }

        .calendar-loader-title {
          font-size: 1.1rem;
        }

        .calendar-loader-message {
          font-size: 0.85rem;
        }
      }
    `,
  ],
})
export class CalendarLoaderComponent {
  // This component is purely presentational, no inputs needed
}

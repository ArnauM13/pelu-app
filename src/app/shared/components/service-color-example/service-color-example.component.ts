import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pelu-service-color-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="service-colors-example">
      <h3>Exemple d'ús dels colors de serveis</h3>

      <div class="service-examples">
        <div class="service-example">
          <h4>Corte</h4>
          <div class="service-badge service-color-haircut">
            <span>✂️ Corte masculí</span>
          </div>
          <div class="service-text service-text-haircut">Text amb color de servei</div>
          <div class="service-bg service-bg-haircut">Fons amb color de servei</div>
        </div>

        <div class="service-example">
          <h4>Peinat</h4>
          <div class="service-badge service-color-styling">
            <span>💇 Peinat especial</span>
          </div>
          <div class="service-text service-text-styling">Text amb color de servei</div>
          <div class="service-bg service-bg-styling">Fons amb color de servei</div>
        </div>

        <div class="service-example">
          <h4>Tractament</h4>
          <div class="service-badge service-color-treatment">
            <span>💆 Tractament capilar</span>
          </div>
          <div class="service-text service-text-treatment">Text amb color de servei</div>
          <div class="service-bg service-bg-treatment">Fons amb color de servei</div>
        </div>

        <div class="service-example">
          <h4>Coloració</h4>
          <div class="service-badge service-color-coloring">
            <span>🎨 Coloració completa</span>
          </div>
          <div class="service-text service-text-coloring">Text amb color de servei</div>
          <div class="service-bg service-bg-coloring">Fons amb color de servei</div>
        </div>

        <div class="service-example">
          <h4>Especial</h4>
          <div class="service-badge service-color-special">
            <span>⭐ Servei especial</span>
          </div>
          <div class="service-text service-text-special">Text amb color de servei</div>
          <div class="service-bg service-bg-special">Fons amb color de servei</div>
        </div>

        <div class="service-example">
          <h4>Infantil</h4>
          <div class="service-badge service-color-kids">
            <span>👶 Corte infantil</span>
          </div>
          <div class="service-text service-text-kids">Text amb color de servei</div>
          <div class="service-bg service-bg-kids">Fons amb color de servei</div>
        </div>

        <div class="service-example">
          <h4>General</h4>
          <div class="service-badge service-color-default">
            <span>🔧 Servei general</span>
          </div>
          <div class="service-text service-text-default">Text amb color de servei</div>
          <div class="service-bg service-bg-default">Fons amb color de servei</div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .service-colors-example {
        padding: 2rem;
        background: var(--surface-color);
        border-radius: var(--border-radius-lg);
        box-shadow: var(--box-shadow);
        border: 1px solid var(--border-color);
      }

      .service-colors-example h3 {
        margin: 0 0 2rem 0;
        color: var(--text-color);
        font-size: 1.5rem;
        font-weight: 600;
        text-align: center;
      }

      .service-examples {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
      }

      .service-example {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1.5rem;
        background: var(--surface-color);
        border-radius: var(--border-radius);
        border: 1px solid var(--border-color);
      }

      .service-example h4 {
        margin: 0;
        color: var(--text-color);
        font-size: 1.1rem;
        font-weight: 600;
        text-align: center;
      }

      .service-badge {
        padding: 0.75rem 1rem;
        border-radius: var(--border-radius);
        font-weight: 600;
        font-size: 0.9rem;
        text-align: center;
        box-shadow: var(--box-shadow);
      }

      .service-text {
        padding: 0.5rem;
        border-radius: var(--border-radius-sm);
        font-weight: 500;
        text-align: center;
        border: 1px solid var(--border-color);
      }

      .service-bg {
        padding: 1rem;
        border-radius: var(--border-radius);
        text-align: center;
        font-weight: 500;
        color: var(--text-color);
        border: 1px solid var(--border-color);
      }

      @media (max-width: 768px) {
        .service-examples {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .service-example {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class ServiceColorExampleComponent {}

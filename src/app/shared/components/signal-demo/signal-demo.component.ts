import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CardComponent } from '../card/card.component';
import { ButtonComponent } from '../buttons/button.component';
import { ToastService } from '../../services/toast.service';
import { User, UserRole } from '../../../core/interfaces/user.interface';

interface FilterState {
  search: string;
  role: 'all' | UserRole.ADMIN | UserRole.USER;
  status: 'all' | 'active' | 'inactive';
}

@Component({
  selector: 'pelu-signal-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    CardComponent,
    ButtonComponent,
  ],
  template: `
    <div class="signal-demo">
      <h2>🚀 Signals Demo - Patrons Avançats</h2>

      <!-- State Management Section -->
      <pelu-card>
        <h3>📊 Gestió d'Estat</h3>

        <div class="state-display">
          <div class="stat">
            <span class="label">Usuaris totals:</span>
            <span class="value">{{ totalUsers() }}</span>
          </div>
          <div class="stat">
            <span class="label">Usuaris actius:</span>
            <span class="value">{{ activeUsers() }}</span>
          </div>
          <div class="stat">
            <span class="label">Admins:</span>
            <span class="value">{{ adminUsers() }}</span>
          </div>
          <div class="stat">
            <span class="label">Resultats filtrats:</span>
            <span class="value">{{ filteredUsers().length }}</span>
          </div>
        </div>
      </pelu-card>

      <!-- Filters Section -->
      <pelu-card>
        <h3>🔍 Filtres Reactius</h3>

        <div class="filters">
          <div class="filter-group">
            <label>Buscar:</label>
            <input
              type="text"
              [ngModel]="filterState().search"
              (ngModelChange)="updateSearch($event)"
              placeholder="Buscar per nom o email..."
            />
          </div>

          <div class="filter-group">
            <label>Rol:</label>
            <select
              [ngModel]="filterState().role"
              (ngModelChange)="updateRole($event)"
            >
              <option value="all">Tots</option>
              <option value="admin">Admin</option>
              <option value="client">Client</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Estat:</label>
            <select
              [ngModel]="filterState().status"
              (ngModelChange)="updateStatus($event)"
            >
              <option value="all">Tots</option>
              <option value="active">Actiu</option>
              <option value="inactive">Inactiu</option>
            </select>
          </div>
        </div>

        <div class="filter-actions">
          <pelu-button
            variant="outlined"
            size="small"
            (click)="clearFilters()"
          >
            Netejar filtres
          </pelu-button>

          <pelu-button
            variant="outlined"
            size="small"
            (click)="addRandomUser()"
          >
            Afegir usuari
          </pelu-button>
        </div>
      </pelu-card>

      <!-- Users List Section -->
      <pelu-card>
        <h3>👥 Llista d'Usuaris</h3>

        <div class="users-list">
          @for (user of filteredUsers(); track user.id) {
            <div class="user-item" [class.active]="user.isActive">
              <div class="user-info">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-email">{{ user.email }}</div>
                <div class="user-role">
                  <span class="badge" [class.admin]="user.role === 'admin'">
                    {{ user.role }}
                  </span>
                </div>
              </div>

              <div class="user-actions">
                <pelu-button
                  variant="outlined"
                  size="small"
                  (click)="toggleUserStatus(user)"
                >
                  {{ user.isActive ? 'Desactivar' : 'Activar' }}
                </pelu-button>

                <pelu-button
                  variant="outlined"
                  size="small"
                  (click)="deleteUser(user)"
                >
                  Eliminar
                </pelu-button>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <p>No hi ha usuaris que coincideixin amb els filtres</p>
            </div>
          }
        </div>
      </pelu-card>

      <!-- Performance Metrics -->
      <pelu-card>
        <h3>⚡ Mètriques de Rendiment</h3>

        <div class="metrics">
          <div class="metric">
            <span class="label">Càlculs de signals:</span>
            <span class="value">{{ signalComputations() }}</span>
          </div>
          <div class="metric">
            <span class="label">Última actualització:</span>
            <span class="value">{{ lastUpdate() | date:'HH:mm:ss' }}</span>
          </div>
          <div class="metric">
            <span class="label">Memòria utilitzada:</span>
            <span class="value">{{ memoryUsage() }} MB</span>
          </div>
        </div>
      </pelu-card>
    </div>
  `,
  styles: [`
    .signal-demo {
      padding: 1rem;
      max-width: 800px;
      margin: 0 auto;
    }

    h2 {
      text-align: center;
      margin-bottom: 2rem;
      color: #2563eb;
    }

    h3 {
      margin-bottom: 1rem;
      color: #374151;
    }

    .state-display {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      background: #f3f4f6;
      border-radius: 8px;
    }

    .stat .label {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .stat .value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #1f2937;
    }

    .filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 500;
      color: #374151;
    }

    .filter-group input,
    .filter-group select {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .filter-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .users-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .user-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: white;
      transition: all 0.2s ease;
    }

    .user-item:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .user-item.active {
      border-color: #10b981;
      background: #f0fdf4;
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.25rem;
    }

    .user-email {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      background: #e5e7eb;
      color: #374151;
    }

    .badge.admin {
      background: #dbeafe;
      color: #1e40af;
    }

    .user-actions {
      display: flex;
      gap: 0.5rem;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .metric {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 6px;
    }

    .metric .label {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .metric .value {
      font-weight: 600;
      color: #1f2937;
    }
  `],
})
export class SignalDemoComponent {
  private readonly toastService = inject(ToastService);

  // Internal state signals
  private readonly usersSignal = signal<User[]>([
    { id: '1', name: 'Joan Garcia', email: 'joan@example.com', role: UserRole.ADMIN, isActive: true },
    { id: '2', name: 'Maria López', email: 'maria@example.com', role: UserRole.USER, isActive: true },
    { id: '3', name: 'Pere Martí', email: 'pere@example.com', role: UserRole.USER, isActive: false },
    { id: '4', name: 'Anna Costa', email: 'anna@example.com', role: UserRole.ADMIN, isActive: true },
  ]);

  private readonly filterStateSignal = signal<FilterState>({
    search: '',
    role: 'all',
    status: 'all',
  });

  private readonly performanceSignal = signal({
    computations: 0,
    lastUpdate: new Date(),
    memoryUsage: 0,
  });

  // Public computed signals
  readonly users = computed(() => this.usersSignal());
  readonly filterState = computed(() => this.filterStateSignal());
  readonly performance = computed(() => this.performanceSignal());

  // Derived computed signals
  readonly totalUsers = computed(() => this.users().length);
  readonly activeUsers = computed(() => this.users().filter(u => u.isActive).length);
  readonly adminUsers = computed(() => this.users().filter(u => u.role === UserRole.ADMIN).length);

  // Advanced filtered users with memoization
  readonly filteredUsers = computed(() => {
    const users = this.users();
    const filters = this.filterState();

    let filtered = users;

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    // Apply role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    // Update performance metrics
    this.updatePerformanceMetrics();

    return filtered;
  });

  // Performance metrics
  readonly signalComputations = computed(() => this.performance().computations);
  readonly lastUpdate = computed(() => this.performance().lastUpdate);
  readonly memoryUsage = computed(() => this.performance().memoryUsage);

  constructor() {
    // Effect to track state changes
    effect(() => {
      const users = this.users();
      const filters = this.filterState();

      console.log('Signal Demo - State changed:', {
        totalUsers: users.length,
        activeFilters: Object.values(filters).filter(v => v !== 'all' && v !== ''),
        filteredCount: this.filteredUsers().length,
      });
    });

    // Initialize performance tracking
    this.updatePerformanceMetrics();
  }

  // Action methods
  updateSearch(search: string) {
    this.filterStateSignal.update(state => ({ ...state, search }));
  }

  updateRole(role: 'all' | UserRole.ADMIN | UserRole.USER) {
    this.filterStateSignal.update(state => ({ ...state, role }));
  }

  updateStatus(status: 'all' | 'active' | 'inactive') {
    this.filterStateSignal.update(state => ({ ...state, status }));
  }

  clearFilters() {
    this.filterStateSignal.set({
      search: '',
      role: 'all',
      status: 'all',
    });

    this.toastService.showInfo('Filtres netejats', 'Tots els filtres s\'han restablert');
  }

  addRandomUser() {
    const newUser: User = {
      id: Date.now().toString(),
      name: `Usuari ${this.totalUsers() + 1}`,
      email: `usuari${this.totalUsers() + 1}@example.com`,
      role: Math.random() > 0.5 ? UserRole.ADMIN : UserRole.USER,
      isActive: true,
    };

    this.usersSignal.update(users => [...users, newUser]);
    this.toastService.showSuccess('Usuari afegit', `S'ha afegit ${newUser.name}`);
  }

  toggleUserStatus(user: User) {
    this.usersSignal.update(users =>
      users.map(u =>
        u.id === user.id ? { ...u, isActive: !u.isActive } : u
      )
    );

    const action = user.isActive ? 'desactivat' : 'activat';
    this.toastService.showInfo(
      'Estat canviat',
      `${user.name} s'ha ${action} correctament`
    );
  }

  deleteUser(user: User) {
    this.usersSignal.update(users =>
      users.filter(u => u.id !== user.id)
    );

    this.toastService.showWarning(
      'Usuari eliminat',
      `${user.name} s'ha eliminat correctament`
    );
  }

  private updatePerformanceMetrics() {
    this.performanceSignal.update(metrics => ({
      computations: metrics.computations + 1,
      lastUpdate: new Date(),
      memoryUsage: Math.round(performance.memory?.usedJSHeapSize / 1024 / 1024 || 0),
    }));
  }
}

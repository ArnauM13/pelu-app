import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from '../../../core/services/user.service';
import { WorkersService, WorkerSummary, WORKER_COLORS } from '../../../core/services/workers.service';
import { ToastService } from '../../../shared/services/toast.service';
import { LoaderService } from '../../../shared/services/loader.service';
import { ButtonComponent } from '../../../shared/components/buttons/button.component';
import { PeluTitleComponent } from '../../../shared/components/pelu-title/pelu-title.component';
import { ConfirmationPopupComponent, type ConfirmationData } from '../../../shared/components/confirmation-popup/confirmation-popup.component';
import { InputTextComponent } from '../../../shared/components/inputs/input-text/input-text.component';
import { UserRole } from '../../../core/services/role.service';

@Component({
  selector: 'pelu-admin-workers-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonComponent,
    PeluTitleComponent,
    ConfirmationPopupComponent,
    InputTextComponent,
  ],
  templateUrl: './admin-workers-page.component.html',
  styleUrls: ['./admin-workers-page.component.scss'],
})
export class AdminWorkersPageComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly workersService = inject(WorkersService);
  private readonly toastService = inject(ToastService);
  private readonly loaderService = inject(LoaderService);

  readonly workers = signal<WorkerSummary[]>([]);
  readonly clients = signal<UserRole[]>([]);
  readonly selectedWorker = signal<WorkerSummary | null>(null);

  // Views: 'list' | 'add' | 'edit'
  readonly view = signal<'list' | 'add' | 'edit'>('list');

  // Edit form
  readonly editName = signal('');
  readonly editColor = signal('');
  readonly isSaving = signal(false);

  // Add worker: search among clients
  readonly searchQuery = signal('');
  readonly filteredClients = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return this.clients().filter(c =>
      !q ||
      (c.displayName || '').toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  // Confirmation
  isConfirmOpen = false;
  confirmData: ConfirmationData | null = null;
  private workerToDemote: WorkerSummary | null = null;

  readonly colors = WORKER_COLORS;

  async ngOnInit() {
    await this.load();
  }

  private async load() {
    this.loaderService.show({ message: 'WORKERS.LOADING' });
    try {
      const [workers, all] = await Promise.all([
        this.workersService.listWorkers(),
        this.userService.listAllUsers(),
      ]);
      this.workers.set(workers);
      this.clients.set(all.filter(u => u.role === 'client'));
    } finally {
      this.loaderService.hide();
    }
  }

  /* ── Add worker ── */
  showAddView() {
    this.searchQuery.set('');
    this.view.set('add');
  }

  async promoteToWorker(client: UserRole) {
    this.loaderService.show();
    try {
      await this.workersService.promoteToWorker(client.uid);
      this.toastService.showSuccess('COMMON.STATUS.STATUS_SUCCESS', 'WORKERS.PROMOTED_SUCCESS');
      await this.load();
      this.view.set('list');
    } catch {
      this.toastService.showError('COMMON.ERROR', 'WORKERS.SAVE_ERROR');
    } finally {
      this.loaderService.hide();
    }
  }

  /* ── Edit worker ── */
  selectWorker(w: WorkerSummary) {
    this.selectedWorker.set(w);
    this.editName.set(w.displayName || '');
    this.editColor.set(w.workerColor || WORKER_COLORS[0]);
    this.view.set('edit');
  }

  async saveWorker() {
    const w = this.selectedWorker();
    if (!w) return;
    this.isSaving.set(true);
    try {
      await this.workersService.updateWorker(w.uid, {
        displayName: this.editName().trim() || undefined,
        workerColor: this.editColor(),
      });
      this.toastService.showSuccess('COMMON.STATUS.STATUS_SUCCESS', 'WORKERS.SAVE_SUCCESS');
      await this.load();
      this.view.set('list');
    } catch {
      this.toastService.showError('COMMON.ERROR', 'WORKERS.SAVE_ERROR');
    } finally {
      this.isSaving.set(false);
    }
  }

  /* ── Demote ── */
  confirmDemote(w: WorkerSummary) {
    this.workerToDemote = w;
    this.confirmData = {
      title: 'WORKERS.DEMOTE_CONFIRM_TITLE',
      message: 'WORKERS.DEMOTE_CONFIRM_MSG',
      severity: 'warning',
      userName: w.displayName || w.email,
    };
    this.isConfirmOpen = true;
  }

  async onConfirm() {
    this.isConfirmOpen = false;
    if (!this.workerToDemote) return;
    this.loaderService.show();
    try {
      await this.workersService.demoteToClient(this.workerToDemote.uid);
      this.toastService.showSuccess('COMMON.STATUS.STATUS_SUCCESS', 'WORKERS.DEMOTED_SUCCESS');
      await this.load();
      this.view.set('list');
    } catch {
      this.toastService.showError('COMMON.ERROR', 'WORKERS.SAVE_ERROR');
    } finally {
      this.loaderService.hide();
      this.workerToDemote = null;
    }
  }

  onCancel() {
    this.isConfirmOpen = false;
    this.workerToDemote = null;
  }

  backToList() {
    this.view.set('list');
    this.selectedWorker.set(null);
  }

  getInitials(u: UserRole): string {
    const name = u.displayName || u.email;
    return name.slice(0, 2).toUpperCase();
  }
}

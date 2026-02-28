import { Injectable, inject } from '@angular/core';
import { UserService } from './user.service';
import { UserRole } from './role.service';

export interface WorkerSummary extends UserRole {
  role: 'worker';
}

export const WORKER_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#14b8a6', // teal
];

@Injectable({ providedIn: 'root' })
export class WorkersService {
  private readonly userService = inject(UserService);

  async listWorkers(): Promise<WorkerSummary[]> {
    const all = await this.userService.listAllUsers();
    return all.filter((u): u is WorkerSummary => u.role === 'worker');
  }

  async promoteToWorker(uid: string, color?: string): Promise<void> {
    const updates: Partial<UserRole> = {
      role: 'worker',
      workerColor: color ?? WORKER_COLORS[0],
    };
    await this.userService.updateUserRole(uid, updates);
  }

  async demoteToClient(uid: string): Promise<void> {
    await this.userService.updateUserRole(uid, { role: 'client' });
  }

  async updateWorker(uid: string, updates: { displayName?: string; workerColor?: string }): Promise<void> {
    await this.userService.updateUserRole(uid, updates);
  }
}

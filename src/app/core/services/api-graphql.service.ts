import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

type GraphQLResponse<T> = { data?: T; errors?: Array<{ message: string }> };

@Injectable({ providedIn: 'root' })
export class ApiGraphqlService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.backendUrl}/graphql`;

  async reserves(limit = 20, cursor?: string): Promise<any[]> {
    const query = `query($limit: Int, $cursor: String) { reserves(limit: $limit, cursor: $cursor) { id uid clientName email data hora notes serviceId status createdAt } }`;
    const res = await firstValueFrom(
      this.http.post<GraphQLResponse<{ reserves: any[] }>>(this.endpoint, { query, variables: { limit, cursor } })
    );
    if (res?.errors?.length) throw new Error(res.errors[0].message);
    return res?.data?.reserves ?? [];
  }

  async reservesPage(limit = 20, cursor?: string): Promise<{ items: any[]; nextCursor: string | null }> {
    const items = await this.reserves(limit, cursor);
    const last = items[items.length - 1];
    const nextCursor = items.length === limit && last?.createdAt ? String(last.createdAt) : null;
    return { items, nextCursor };
  }

  async reserva(id: string): Promise<any | null> {
    const query = `query($id: ID!) { reserva(id: $id) { id uid clientName email data hora notes serviceId status createdAt } }`;
    const res = await firstValueFrom(
      this.http.post<GraphQLResponse<{ reserva: any }>>(this.endpoint, { query, variables: { id } })
    );
    if (res?.errors?.length) throw new Error(res.errors[0].message);
    return res?.data?.reserva ?? null;
  }

  async createReserva(input: Record<string, unknown>): Promise<any> {
    const query = `mutation($input: ReservaInput!) { createReserva(input: $input) { id uid clientName email data hora notes serviceId status createdAt } }`;
    const res = await firstValueFrom(
      this.http.post<GraphQLResponse<{ createReserva: any }>>(this.endpoint, { query, variables: { input } })
    );
    if (res?.errors?.length) throw new Error(res.errors[0].message);
    return res?.data?.createReserva;
  }

  async updateReserva(id: string, input: Record<string, unknown>): Promise<any> {
    const query = `mutation($id: ID!, $input: ReservaUpdateInput!) { updateReserva(id: $id, input: $input) { id uid clientName email data hora notes serviceId status createdAt } }`;
    const res = await firstValueFrom(
      this.http.post<GraphQLResponse<{ updateReserva: any }>>(this.endpoint, { query, variables: { id, input } })
    );
    if (res?.errors?.length) throw new Error(res.errors[0].message);
    return res?.data?.updateReserva;
  }

  async deleteReserva(id: string): Promise<boolean> {
    const query = `mutation($id: ID!) { deleteReserva(id: $id) }`;
    const res = await firstValueFrom(
      this.http.post<GraphQLResponse<{ deleteReserva: boolean }>>(this.endpoint, { query, variables: { id } })
    );
    if (res?.errors?.length) throw new Error(res.errors[0].message);
    return !!res?.data?.deleteReserva;
  }

  async sendEmail(to: string, subject: string, text: string): Promise<boolean> {
    const query = `mutation($to: String!, $subject: String!, $text: String!) { sendEmail(to: $to, subject: $subject, text: $text) }`;
    const res = await firstValueFrom(
      this.http.post<GraphQLResponse<{ sendEmail: boolean }>>(this.endpoint, { query, variables: { to, subject, text } })
    );
    if (res?.errors?.length) throw new Error(res.errors[0].message);
    return !!res?.data?.sendEmail;
  }
}



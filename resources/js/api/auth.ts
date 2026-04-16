import { client } from './client';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await client.post<{ data: AuthResponse }>('/api/auth/login', payload);
  return data.data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await client.post<{ data: AuthResponse }>('/api/auth/register', payload);
  return data.data;
}

export async function logout(): Promise<void> {
  await client.post('/api/auth/logout');
}

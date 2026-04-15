import axios from 'axios';
import type { AchievementsResponse, PurchaseRequest } from '../types';

const BASE_URL = 'http://localhost:8000';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchAchievements(userId: number | string): Promise<AchievementsResponse> {
  const { data } = await client.get<AchievementsResponse>(`/api/users/${userId}/achievements`);
  return data;
}

export async function simulatePurchase(userId: number | string, amount: number = 100): Promise<void> {
  const body: PurchaseRequest = { amount };
  await client.post(`/api/users/${userId}/purchases`, body);
}

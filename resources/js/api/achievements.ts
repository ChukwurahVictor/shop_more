import { client } from './client';
import type { AchievementsResponse, PurchaseRequest } from '../types';

export async function fetchAchievements(userId: number | string): Promise<AchievementsResponse> {
  const { data } = await client.get<{ data: AchievementsResponse }>(`/api/users/${userId}/achievements`);
  return data.data;
}

export async function simulatePurchase(userId: number | string, amount: number = 100): Promise<void> {
  const body: PurchaseRequest = { amount };
  await client.post(`/api/users/${userId}/purchases`, body);
}

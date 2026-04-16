/** Named badge tiers as a union type — used across components and the API. */
export type BadgeTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

/** Authenticated user returned by login / register / me */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

/** Payload for POST /api/auth/login */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Payload for POST /api/auth/register */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/** Response from login and register endpoints */
export interface AuthResponse {
  token: string;
  user: AuthUser;
}

/** Shape returned by GET /api/users/{userId}/achievements */
export interface AchievementsResponse {
  unlocked_achievements: string[];
  next_available_achievements: string[];
  current_badge: BadgeTier | null;
  next_badge: BadgeTier | null;
  remaining_to_unlock_next_badge: number;
}

/** Body sent to POST /api/users/{userId}/purchases */
export interface PurchaseRequest {
  amount: number;
}

/** Shape of an Axios API error response body */
export interface ApiErrorData {
  detail: string;
}

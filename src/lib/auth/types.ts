export interface AccountUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Views depend on this contract, so a future Supabase adapter can replace Firebase here.
export interface AuthAdapter {
  subscribe(next: (user: AccountUser | null) => void, error: (error: unknown) => void): () => void;
  signIn(email: string, password: string, remember: boolean): Promise<AccountUser>;
  signUp(name: string, email: string, password: string): Promise<AccountUser>;
  signInWithGoogle(): Promise<AccountUser>;
  resetPassword(email: string): Promise<void>;
  signOut(): Promise<void>;
  getAccessToken(): Promise<string | null>;
}

export function authErrorCode(error: unknown): string {
  return typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
    ? error.code
    : "auth/unknown";
}

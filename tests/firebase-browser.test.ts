// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  onIdTokenChanged,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from "firebase/auth";
import { firebaseAuthAdapter } from "../src/lib/auth/firebase-browser";

const mocks = vi.hoisted(() => ({
  auth: { useDeviceLanguage: vi.fn(), authStateReady: vi.fn(), currentUser: null as unknown },
  user: {
    uid: "u1",
    email: "farmer@example.test",
    displayName: "Farmer",
    photoURL: null,
    emailVerified: false,
    getIdToken: vi.fn(),
  },
}));
vi.mock("firebase/app", () => ({
  getApps: vi.fn(() => []),
  initializeApp: vi.fn(() => ({ name: "web" })),
}));
vi.mock("firebase/auth", () => ({
  browserLocalPersistence: "local",
  browserSessionPersistence: "session",
  getAuth: vi.fn(() => mocks.auth),
  GoogleAuthProvider: vi.fn(function () {
    return { setCustomParameters: vi.fn() };
  }),
  onIdTokenChanged: vi.fn(),
  setPersistence: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}));
beforeEach(() => {
  for (const [key, value] of Object.entries({
    VITE_FIREBASE_API_KEY: "public-test-key",
    VITE_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
    VITE_FIREBASE_PROJECT_ID: "test",
    VITE_FIREBASE_APP_ID: "test-app",
  }))
    vi.stubEnv(key, value);
  mocks.auth.currentUser = mocks.user;
  mocks.auth.authStateReady.mockResolvedValue(undefined);
  mocks.user.getIdToken.mockResolvedValue("refreshed-id-token");
});
afterEach(() => vi.unstubAllEnvs());

describe("Firebase browser adapter with mocked official SDK", () => {
  it.each([true, false])("respects remember-me persistence %s", async (remember) => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: mocks.user } as never);
    expect(
      await firebaseAuthAdapter.signIn(" farmer@example.test ", "password", remember),
    ).toMatchObject({ uid: "u1" });
    expect(setPersistence).toHaveBeenCalledWith(mocks.auth, remember ? "local" : "session");
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      mocks.auth,
      "farmer@example.test",
      "password",
    );
    expect(initializeApp).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: "test" }),
      "mirchirakshak-web",
    );
  });
  it("creates an account and updates its display name", async () => {
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: mocks.user } as never);
    await firebaseAuthAdapter.signUp(" Farmer ", " farmer@example.test ", "password9");
    expect(updateProfile).toHaveBeenCalledWith(mocks.user, { displayName: "Farmer" });
  });
  it("does not report a successful account creation as failed if the name update fails", async () => {
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user: mocks.user } as never);
    vi.mocked(updateProfile).mockRejectedValueOnce(new Error("offline"));
    expect(
      await firebaseAuthAdapter.signUp("Farmer", "farmer@example.test", "password9"),
    ).toMatchObject({ uid: "u1" });
  });
  it("waits for Firebase restoration and gets the SDK's current ID token", async () => {
    expect(await firebaseAuthAdapter.getAccessToken()).toBe("refreshed-id-token");
    expect(mocks.auth.authStateReady).toHaveBeenCalledOnce();
    expect(mocks.user.getIdToken).toHaveBeenCalledOnce();
    mocks.auth.currentUser = null;
    expect(await firebaseAuthAdapter.getAccessToken()).toBeNull();
  });
  it("subscribes to auth changes and returns the SDK cleanup", () => {
    const unsubscribe = vi.fn();
    vi.mocked(onIdTokenChanged).mockReturnValue(unsubscribe);
    expect(firebaseAuthAdapter.subscribe(vi.fn(), vi.fn())).toBe(unsubscribe);
  });
  it("sends reset requests without exposing nonexistent accounts", async () => {
    vi.mocked(sendPasswordResetEmail).mockRejectedValueOnce({ code: "auth/user-not-found" });
    await expect(
      firebaseAuthAdapter.resetPassword("missing@example.test"),
    ).resolves.toBeUndefined();
    vi.mocked(sendPasswordResetEmail).mockRejectedValueOnce({
      code: "auth/network-request-failed",
    });
    await expect(firebaseAuthAdapter.resetPassword("farmer@example.test")).rejects.toMatchObject({
      code: "auth/network-request-failed",
    });
  });
  it("signs out through Firebase", async () => {
    await firebaseAuthAdapter.signOut();
    expect(signOut).toHaveBeenCalledWith(mocks.auth);
  });
});

import { getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onIdTokenChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import type { AccountUser, AuthAdapter } from "./types";

export function getFirebaseAuth() {
  if (typeof window === "undefined")
    throw Object.assign(new Error("Browser authentication is unavailable during SSR."), {
      code: "auth/not-ready",
    });
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };
  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId)
    throw Object.assign(new Error("Authentication is not configured."), {
      code: "auth/configuration-not-found",
    });
  const app =
    getApps().find((item) => item.name === "mirchirakshak-web") ??
    initializeApp(config, "mirchirakshak-web");
  const auth = getAuth(app);
  auth.useDeviceLanguage();
  return auth;
}

function account(user: User): AccountUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
}

export const firebaseAuthAdapter: AuthAdapter = {
  subscribe(next, error) {
    return onIdTokenChanged(getFirebaseAuth(), (user) => next(user ? account(user) : null), error);
  },
  async signIn(email, password, remember) {
    const auth = getFirebaseAuth();
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    return account((await signInWithEmailAndPassword(auth, email.trim(), password)).user);
  },
  async signUp(name, email, password) {
    const auth = getFirebaseAuth();
    await setPersistence(auth, browserLocalPersistence);
    const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
    // A profile update failure must not turn a successfully created account into a failed signup.
    try {
      await updateProfile(user, { displayName: name.trim() });
    } catch {
      /* Can be completed later. */
    }
    return account(user);
  },
  async signInWithGoogle() {
    const auth = getFirebaseAuth();
    await setPersistence(auth, browserLocalPersistence);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return account((await signInWithPopup(auth, provider)).user);
  },
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
    } catch (error) {
      // Do not reveal whether an email address has an account.
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "auth/user-not-found"
      )
        return;
      throw error;
    }
  },
  async signOut() {
    await signOut(getFirebaseAuth());
  },
  async getAccessToken() {
    const auth = getFirebaseAuth();
    await auth.authStateReady();
    return auth.currentUser ? auth.currentUser.getIdToken() : null;
  },
};

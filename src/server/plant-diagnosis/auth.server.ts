// Keep the diagnosis service independent of the active authentication provider.
export { verifyFirebaseRequest as authenticateDiagnosis } from "../auth/firebase.server";

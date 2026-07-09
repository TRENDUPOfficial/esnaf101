import type { Tenant } from "@esnaf101/db";

export interface ClerkAuthContext {
  userId: string;
  orgId?: string;
  orgRole?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: ClerkAuthContext;
      tenant?: Tenant;
    }
  }
}

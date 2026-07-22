export type AuthEnvironment = "development" | "test" | "staging" | "production";

export interface AuthCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge?: number;
  expires?: Date;
}

export function createSessionCookieOptions(
  environment: AuthEnvironment,
  lifetimeSeconds?: number,
): AuthCookieOptions {
  if (lifetimeSeconds !== undefined && (!Number.isSafeInteger(lifetimeSeconds) || lifetimeSeconds <= 0)) {
    throw new Error("Invalid cookie lifetime");
  }

  return {
    httpOnly: true,
    secure: environment === "staging" || environment === "production",
    sameSite: "lax",
    path: "/",
    ...(lifetimeSeconds === undefined ? {} : { maxAge: lifetimeSeconds }),
  };
}

export function createExpiredSessionCookieOptions(environment: AuthEnvironment): AuthCookieOptions {
  return {
    ...createSessionCookieOptions(environment),
    maxAge: 0,
    expires: new Date(0),
  };
}

import axios, { AxiosError } from "axios";
import { z } from "zod";
import { db } from "../prisma/db";
import { redis } from "../config/redis";
import { env } from "../config/env";

const spotifyRefreshResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1).optional(),
  expires_in: z.number().int().positive(),
});

export class SpotifyAuthError extends Error {
  retryable: boolean;
  reauthenticationRequired: boolean;

  constructor(
    message: string,
    options: { reauthenticationRequired: boolean; retryable: boolean },
  ) {
    super(message);
    this.name = "SpotifyAuthError";
    this.reauthenticationRequired = options.reauthenticationRequired;
    this.retryable = options.retryable;
  }
}

const refreshPromises = new Map<number, Promise<string>>();

function accessTokenKey(userId: number): string {
  return `spotify:access-token:${userId}`;
}

function cacheTtlSeconds(expiresIn: number): number {
  return Math.max(expiresIn - 30, 1);
}

export const cacheSpotifyAccessToken = async (
  userId: number,
  accessToken: string,
  expiresIn: number,
): Promise<void> => {
  await redis.set(accessTokenKey(userId), accessToken, {
    EX: cacheTtlSeconds(expiresIn),
  });
};

export const getSpotifyAccessToken = async (
  userId: number,
): Promise<string> => {
  const cached = await redis.get(accessTokenKey(userId));
  if (cached) {
    return cached;
  }

  return refreshSpotifyAccessToken(userId);
};

export function refreshSpotifyAccessToken(userId: number): Promise<string> {
  const inFlight = refreshPromises.get(userId);
  if (inFlight) {
    return inFlight;
  }

  const refreshPromise = renewSpotifyAccessToken(userId).finally(() => {
    if (refreshPromises.get(userId) === refreshPromise) {
      refreshPromises.delete(userId);
    }
  });
  refreshPromises.set(userId, refreshPromise);
  return refreshPromise;
}

async function renewSpotifyAccessToken(userId: number): Promise<string> {
  const user = await db.orm.public.User.where({ id: userId }).first();
  const refreshToken = user?.refreshToken;

  if (!refreshToken) {
    throw new SpotifyAuthError(
      "Spotify authorization is missing; the user must log in again",
      { reauthenticationRequired: true, retryable: false },
    );
  }

  let response;
  try {
    response = await axios.post<unknown>(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      {
        timeout: 5000,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${env.CLIENT_ID}:${env.CLIENT_SECRET}`).toString(
              "base64",
            ),
        },
      },
    );
  } catch (error) {
    throw toSpotifyAuthError(error);
  }

  const parsed = spotifyRefreshResponseSchema.safeParse(response.data);
  if (!parsed.success) {
    throw new SpotifyAuthError("spotify returned an unusable token response", {
      reauthenticationRequired: false,
      retryable: true,
    });
  }
  const { access_token, refresh_token, expires_in } = parsed.data;

  await cacheSpotifyAccessToken(userId, access_token, expires_in);
  return access_token;
}

function toSpotifyAuthError(error: unknown): SpotifyAuthError {
  if (!axios.isAxiosError(error)) {
    return new SpotifyAuthError("Spotify token refresh failed.", {
      reauthenticationRequired: false,
      retryable: true,
    });
  }
  if (!error.response) {
    return new SpotifyAuthError("Spotify is temporarily unreachable.", {
      reauthenticationRequired: false,
      retryable: true,
    });
  }
  if (isInvalidGrant(error)) {
    return new SpotifyAuthError("spotifu rejected the refresh token; the user must login again",{
      reauthenticationRequired:true,
      retryable:false
    });
  }
  const status = error.response.status;
  return new SpotifyAuthError(
    `Spotify token refresh failed with status ${status}.`,
    {
      reauthenticationRequired:false,
      retryable:status === 429 || status >= 500
    }
  )
}
function isInvalidGrant(error: AxiosError): boolean {
  if (error.response?.status !== 400) {
    return false;
  }

  const data = error.response.data as {error?:unknown} | null | undefined
  return typeof data === "object" && data !== null && data.error === "invalid_grant"
}
import { SessionOptions } from "iron-session";

export interface SessionData {
  accessToken?: string;
  athleteId?: string;
  athleteName?: string;
  athleteImage?: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.AUTH_SECRET!,
  cookieName: "run-receipt-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

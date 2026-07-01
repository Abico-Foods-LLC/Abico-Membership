import { z } from "zod";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export const phoneSchema = z
  .string()
  .regex(/^\d{8}$/, "Утасны дугаар 8 оронтой байх ёстой");

export function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return Response.json(data, { status });
}

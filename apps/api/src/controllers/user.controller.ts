import { Request, Response } from "express";
import prisma from "../prisma";
import { z } from "zod";

const usernameSchema = z
  .string()
  .min(3)
  .max(32)
  .refine((v) => /^[a-z0-9_.]+$/.test(v), { message: "USERNAME_INVALID" })
  .transform((s) => s.trim().toLowerCase());

// relative path: "/avatars/a.png" gibi + URL de kabul
const avatarSchema = z
  .string()
  .transform((s) => s.trim())
  .refine(
    (v) =>
      v.length === 0 || // boş string gelirse UI zaten göndermeyecek ama esnek olalım
      v.startsWith("/") || // relative path
      /^https?:\/\//i.test(v), // http(s) url
    { message: "AVATAR_INVALID" }
  )
  .optional();

const updateMeSchema = z.object({
  name: z.string().min(1).max(100).transform((s) => s.trim()).optional(),
  username: usernameSchema.optional(),
  avatar: avatarSchema,
});

export const userController = {
  async getMe(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });
      return res.json({ user });
    } catch (err) {
      console.error("[getMe]", err);
      return res.status(500).json({ error: "FAILED_TO_FETCH_USER" });
    }
  },

  async updateMe(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const parse = updateMeSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({ error: "VALIDATION_ERROR", details: parse.error.format() });
      }
      const { name, username, avatar } = parse.data;

      // username benzersizliği (değişiyorsa)
      if (username) {
        const exists = await prisma.user.findFirst({
          where: { username, NOT: { id: userId } },
          select: { id: true },
        });
        if (exists) return res.status(409).json({ error: "USERNAME_TAKEN" });
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { ...(name && { name }), ...(username && { username }), ...(avatar && { avatar }) },
      });

      return res.json({ user });
    } catch (err: any) {
      console.error("[updateMe]", err);
      return res.status(500).json({ error: "FAILED_TO_UPDATE_PROFILE" });
    }
  },
};
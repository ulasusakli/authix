import { Request, Response } from "express";
import prisma from "../prisma";

export const userController = {
  async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });

      return res.json({ user });
    } catch (err) {
      console.error("[getMe]", err);
      return res.status(500).json({ error: "FAILED_TO_FETCH_USER" });
    }
  },
};
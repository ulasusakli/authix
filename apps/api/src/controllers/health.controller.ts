import { Request, Response } from "express";

const healthController = {
  check: async (_: Request, res: Response) => {
    return res.status(200).json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date(),
    });
  },
};

export default healthController;
// src/Controllers/AnnouncementController/AnnouncementController.ts
import { Request, Response } from "express";
import announcementService from "../../Services/AnnouncementServices/AnnouncementServices";

// Explicit interface extension in a separate declaration file (recommended)
// Or keep it here with proper typing
declare global {
  namespace Express {
    interface Request {
      user?: { teacher_id: number }; // Optional to match your new security requirements
    }
  }
}

const AnnouncementController = {
  createAnnouncement: async (req: Request, res: Response): Promise<void> => {
    try {
      // Get teacher_id from session exactly like in teacher controller
      const teacher_id = (req.session as any).teacher?.teacher_id;

      if (!teacher_id) {
        res.status(401).json({ error: "Login required" });
        return;
      }

      const { title, content, subject_id } = req.body;

      const announcement = await announcementService.createAnnouncement({
        title,
        content,
        subject_id: Number(subject_id),
        teacher_id, // From session
      });

      res.status(201).json(announcement);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getAnnouncements: async (req: Request, res: Response): Promise<void> => {
    try {
      const subjectId = Number(req.params.subjectId);
      if (isNaN(subjectId)) throw new Error("Invalid subject ID");

      const announcements = await announcementService.getAnnouncementsBySubject(
        subjectId
      );
      res.status(200).json(announcements);
    } catch (error: any) {
      res.status(500).json({ error: `Failed: ${error.message}` });
    }
  },

  deleteAnnouncement: async (req: Request, res: Response): Promise<void> => {
    try {
      const teacher_id = (req.session as any).teacher?.teacher_id;

      if (!teacher_id) {
        res.status(401).json({ error: "Login required" });
        return;
      }

      const success = await announcementService.deleteAnnouncement(
        Number(req.params.id),
        teacher_id
      );

      success ? res.status(204).end() : res.status(404).end();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default AnnouncementController;

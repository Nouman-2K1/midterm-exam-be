// src/services/AnnouncementService.ts
import AnnouncementModel from "../../Models/AnnouncementModel/AnnouncementModel";
import TeacherModel from "../../Models/TeacherModels/TeacherModel";
import SubjectModel from "../../Models/SubjectModels/SubjectModels";

// Core announcement attributes
interface AnnouncementAttributes {
  announcement_id: number;
  title: string;
  content: string;
  subject_id: number;
  teacher_id: number;
  created_at: Date;
}

// Extended interface with associations
interface FullAnnouncement extends AnnouncementAttributes {
  Teacher?: { name: string };
  Subject?: { name: string };
}

// Type guard for FullAnnouncement
function isFullAnnouncement(obj: any): obj is FullAnnouncement {
  return (
    (typeof obj.announcement_id === "number" &&
      typeof obj.title === "string" &&
      typeof obj.content === "string" &&
      typeof obj.subject_id === "number" &&
      typeof obj.teacher_id === "number" &&
      obj.created_at instanceof Date) ||
    obj.created_at !== undefined // More permissive date check
  );
}

const AnnouncementService = {
  createAnnouncement: async (announcementData: {
    title: string;
    content: string;
    subject_id: number;
    teacher_id: number;
  }) => {
    try {
      // Convert subject_id to number if it's a string
      if (typeof announcementData.subject_id === "string") {
        announcementData.subject_id = parseInt(announcementData.subject_id, 10);
      }

      // Convert teacher_id to number if it's a string
      if (typeof announcementData.teacher_id === "string") {
        announcementData.teacher_id = parseInt(announcementData.teacher_id, 10);
      }

      const existingAnnouncement = await AnnouncementModel.findOne({
        where: {
          title: announcementData.title,
          subject_id: announcementData.subject_id,
        },
      });

      if (existingAnnouncement) {
        throw new Error(
          "Announcement with this title already exists for the subject"
        );
      }

      const newAnnouncement = await AnnouncementModel.create(announcementData);
      return newAnnouncement.get({ plain: true });
    } catch (error: any) {
      console.error("Error creating announcement:", error);
      throw new Error(`Failed to create announcement: ${error.message}`);
    }
  },

  getAnnouncementsBySubject: async (subjectId: number) => {
    try {
      const announcements = await AnnouncementModel.findAll({
        where: { subject_id: subjectId },
        include: [
          {
            model: TeacherModel,
            attributes: ["name"],
            as: "Teacher",
          },
          {
            model: SubjectModel,
            attributes: ["name"],
            as: "Subject",
          },
        ],
        order: [["created_at", "DESC"]],
        raw: true,
        nest: true,
      });

      // Safe type conversion
      return announcements.map((announcement: unknown) => {
        if (!isFullAnnouncement(announcement)) {
          console.warn("Invalid announcement format", announcement);
          // Return a sanitized version instead of throwing
          return {
            announcement_id: (announcement as any).announcement_id || 0,
            title: (announcement as any).title || "Unknown Title",
            content: (announcement as any).content || "No content",
            created_at: (announcement as any).created_at || new Date(),
            teacher_name: "Unknown Teacher",
            subject_name: "Unknown Subject",
            subject_id: (announcement as any).subject_id || 0,
            teacher_id: (announcement as any).teacher_id || 0,
          };
        }

        return {
          announcement_id: announcement.announcement_id,
          title: announcement.title,
          content: announcement.content,
          created_at: announcement.created_at,
          teacher_name: announcement.Teacher?.name || "Unknown Teacher",
          subject_name: announcement.Subject?.name || "Unknown Subject",
          subject_id: announcement.subject_id,
          teacher_id: announcement.teacher_id,
        };
      });
    } catch (error: any) {
      console.error("Error fetching announcements:", error);
      throw new Error(`Failed to fetch announcements: ${error.message}`);
    }
  },

  getAllAnnouncements: async () => {
    try {
      const announcements = await AnnouncementModel.findAll({
        include: [
          {
            model: TeacherModel,
            attributes: ["name"],
            as: "Teacher",
          },
          {
            model: SubjectModel,
            attributes: ["name"],
            as: "Subject",
          },
        ],
        order: [["created_at", "DESC"]],
        raw: true,
        nest: true,
      });

      // Safe type conversion
      return announcements.map((announcement: unknown) => {
        if (!isFullAnnouncement(announcement)) {
          console.warn("Invalid announcement format", announcement);
          // Return a sanitized version instead of throwing
          return {
            announcement_id: (announcement as any).announcement_id || 0,
            title: (announcement as any).title || "Unknown Title",
            content: (announcement as any).content || "No content",
            created_at: (announcement as any).created_at || new Date(),
            teacher_name: "Unknown Teacher",
            subject_name: "Unknown Subject",
            subject_id: (announcement as any).subject_id || 0,
            teacher_id: (announcement as any).teacher_id || 0,
          };
        }

        return {
          announcement_id: announcement.announcement_id,
          title: announcement.title,
          content: announcement.content,
          created_at: announcement.created_at,
          teacher_name: announcement.Teacher?.name || "Unknown Teacher",
          subject_name: announcement.Subject?.name || "Unknown Subject",
          subject_id: announcement.subject_id,
          teacher_id: announcement.teacher_id,
        };
      });
    } catch (error: any) {
      console.error("Error fetching all announcements:", error);
      throw new Error(`Failed to fetch all announcements: ${error.message}`);
    }
  },

  deleteAnnouncement: async (announcementId: number, teacherId: number) => {
    try {
      const announcement = await AnnouncementModel.findOne({
        where: { announcement_id: announcementId },
      });

      if (!announcement) {
        throw new Error("Announcement not found");
      }

      // First check if the announcement exists and belongs to the teacher
      const announcementData = announcement.get({ plain: true });
      if (announcementData.teacher_id !== teacherId) {
        throw new Error("Unauthorized deletion attempt");
      }

      // Then delete it
      const deletedCount = await AnnouncementModel.destroy({
        where: {
          announcement_id: announcementId,
        },
      });

      return deletedCount > 0;
    } catch (error: any) {
      console.error("Error deleting announcement:", error);
      throw new Error(`Failed to delete announcement: ${error.message}`);
    }
  },
};

export default AnnouncementService;

import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectView extends Document {
  projectId?: string;
  projectSlug?: string;
  projectTitle: string;
  ip: string;
  userAgent?: string;
  referrer?: string;
  sessionId?: string;
  createdAt: Date;
}

const ProjectViewSchema = new Schema<IProjectView>(
  {
    projectId: { type: String, index: true },
    projectSlug: { type: String, default: '' },
    projectTitle: { type: String, required: true, index: true },
    ip: { type: String, default: 'anonymous' },
    userAgent: { type: String, default: '' },
    referrer: { type: String, default: '' },
    sessionId: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ProjectViewSchema.index({ createdAt: -1 });

export const ProjectView = mongoose.models.ProjectView || mongoose.model<IProjectView>('ProjectView', ProjectViewSchema);
export default ProjectView;

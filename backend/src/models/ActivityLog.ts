import mongoose, { Schema, Document } from 'mongoose';

export type ActivityType =
  | 'visitor'
  | 'page_view'
  | 'project_view'
  | 'resume_download'
  | 'contact_submission';

export interface IActivityLog extends Document {
  type: ActivityType;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  ip?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    type: {
      type: String,
      required: true,
      enum: ['visitor', 'page_view', 'project_view', 'resume_download', 'contact_submission'],
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ip: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ActivityLogSchema.index({ createdAt: -1 });

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
export default ActivityLog;

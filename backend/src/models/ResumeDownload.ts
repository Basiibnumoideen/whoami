import mongoose, { Schema, Document } from 'mongoose';

export interface IResumeDownload extends Document {
  ip: string;
  userAgent?: string;
  referrer?: string;
  source: string;
  createdAt: Date;
}

const ResumeDownloadSchema = new Schema<IResumeDownload>(
  {
    ip: { type: String, default: 'anonymous' },
    userAgent: { type: String, default: '' },
    referrer: { type: String, default: '' },
    source: { type: String, default: 'Direct' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ResumeDownloadSchema.index({ createdAt: -1 });

export const ResumeDownload = mongoose.models.ResumeDownload || mongoose.model<IResumeDownload>('ResumeDownload', ResumeDownloadSchema);
export default ResumeDownload;

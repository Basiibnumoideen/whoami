import mongoose, { Schema, Document } from 'mongoose';

export interface IPageView extends Document {
  path: string;
  title?: string;
  ip: string;
  userAgent?: string;
  referrer?: string;
  sessionId?: string;
  createdAt: Date;
}

const PageViewSchema = new Schema<IPageView>(
  {
    path: { type: String, required: true, index: true },
    title: { type: String, default: '' },
    ip: { type: String, default: 'anonymous' },
    userAgent: { type: String, default: '' },
    referrer: { type: String, default: '' },
    sessionId: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PageViewSchema.index({ createdAt: -1 });

export const PageView = mongoose.models.PageView || mongoose.model<IPageView>('PageView', PageViewSchema);
export default PageView;

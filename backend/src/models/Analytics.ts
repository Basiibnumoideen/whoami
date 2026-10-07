import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsDaily extends Document {
  date: string; // YYYY-MM-DD
  visitors: number;
  pageViews: number;
  projectViews: number;
  resumeDownloads: number;
  inquiries: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsDailySchema = new Schema<IAnalyticsDaily>(
  {
    date: { type: String, required: true, unique: true, index: true },
    visitors: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
    projectViews: { type: Number, default: 0 },
    resumeDownloads: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Analytics = mongoose.models.Analytics || mongoose.model<IAnalyticsDaily>('Analytics', AnalyticsDailySchema);
export default Analytics;

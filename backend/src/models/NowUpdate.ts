import mongoose, { Schema, Document } from 'mongoose';

export interface INowUpdate extends Document {
  lastUpdated: string;
  currentFocus: string;
  building: string[];
  learning: string[];
  reading: string[];
  seeking: string;
  createdAt: Date;
  updatedAt: Date;
}

const NowUpdateSchema = new Schema<INowUpdate>(
  {
    lastUpdated: { type: String, default: 'September 2026' },
    currentFocus: { type: String, required: true },
    building: [{ type: String }],
    learning: [{ type: String }],
    reading: [{ type: String }],
    seeking: { type: String, default: 'Open to high-impact technical roles and select consulting' },
  },
  { timestamps: true }
);

export const NowUpdate = mongoose.models.NowUpdate || mongoose.model<INowUpdate>('NowUpdate', NowUpdateSchema);
export default NowUpdate;

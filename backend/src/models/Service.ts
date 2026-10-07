import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  title: string;
  description: string;
  icon: string;
  features: string[];
  deliverables?: string[];
  status: 'active' | 'inactive';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'Code' },
    features: [{ type: String }],
    deliverables: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ServiceSchema.index({ status: 1, order: 1 });

export const Service = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
export default Service;

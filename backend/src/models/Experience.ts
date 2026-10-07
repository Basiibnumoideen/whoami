import mongoose, { Schema, Document } from 'mongoose';

export interface IExperience extends Document {
  company: string;
  role: string;
  duration: string;
  period?: string;
  location?: string;
  description: string;
  technologies: string[];
  skills?: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    duration: { type: String, required: true, default: '2023 - Present' },
    period: { type: String, default: '' },
    location: { type: String, default: 'Remote' },
    description: { type: String, default: '' },
    technologies: [{ type: String, trim: true }],
    skills: [{ type: String, trim: true }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ExperienceSchema.index({ order: 1, createdAt: -1 });

export const Experience = mongoose.models.Experience || mongoose.model<IExperience>('Experience', ExperienceSchema);
export default Experience;

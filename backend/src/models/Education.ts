import mongoose, { Schema, Document } from 'mongoose';

export interface IEducation extends Document {
  degree: string;
  school: string;
  period: string;
  gpa?: string;
  highlights: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema<IEducation>(
  {
    degree: { type: String, required: true, trim: true },
    school: { type: String, required: true, trim: true },
    period: { type: String, required: true },
    gpa: { type: String, default: '' },
    highlights: [{ type: String }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

EducationSchema.index({ order: 1 });

export const Education = mongoose.models.Education || mongoose.model<IEducation>('Education', EducationSchema);
export default Education;

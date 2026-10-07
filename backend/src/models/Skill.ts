import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: string;
  level: number;
  experience: string;
  icon?: string;
  order: number;
  projects: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    level: { type: Number, required: true, min: 0, max: 100, default: 80 },
    experience: { type: String, default: '1+ Years' },
    icon: { type: String, default: '' },
    order: { type: Number, default: 0 },
    projects: [{ type: String }],
  },
  { timestamps: true }
);

SkillSchema.index({ category: 1, order: 1 });

export const Skill = mongoose.models.Skill || mongoose.model<ISkill>('Skill', SkillSchema);
export default Skill;

import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  metrics?: string;
  featured: boolean;
  order: number;
  bentoSpan?: string;
  problem?: string;
  approach?: string;
  result?: string;
  demoUrl?: string;
  githubUrl?: string;
  image?: string;
  thumbnailImage?: string;
  videoUrl?: string;
  images?: string[];
  videos?: string[];
  carouselAutoPlay?: boolean;
  carouselInterval?: number;
  keyFeatures: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, default: 'Full Stack' },
    tags: [{ type: String, trim: true }],
    metrics: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    bentoSpan: { type: String, default: 'col-span-1' },
    problem: { type: String, default: '' },
    approach: { type: String, default: '' },
    result: { type: String, default: '' },
    demoUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    image: { type: String, default: '' },
    thumbnailImage: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    images: [{ type: String }],
    videos: [{ type: String }],
    carouselAutoPlay: { type: Boolean, default: true },
    carouselInterval: { type: Number, default: 4000 },
    keyFeatures: [{ type: String }],
  },
  { timestamps: true }
);

ProjectSchema.index({ featured: 1, order: 1 });

export const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
export default Project;

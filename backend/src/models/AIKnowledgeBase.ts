import mongoose, { Schema, Document } from 'mongoose';

export interface IAIKnowledgeBase extends Document {
  topic: string;
  category: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const AIKnowledgeBaseSchema = new Schema<IAIKnowledgeBase>(
  {
    topic: { type: String, required: true, trim: true },
    category: { type: String, default: 'General', trim: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const AIKnowledgeBase = mongoose.models.AIKnowledgeBase || mongoose.model<IAIKnowledgeBase>('AIKnowledgeBase', AIKnowledgeBaseSchema);
export default AIKnowledgeBase;

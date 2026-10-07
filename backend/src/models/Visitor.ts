import mongoose, { Schema, Document } from 'mongoose';

export interface IVisitor extends Document {
  ip: string;
  userAgent?: string;
  referrer?: string;
  sessionId?: string;
  firstVisit: Date;
  lastVisit: Date;
  visitCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorSchema = new Schema<IVisitor>(
  {
    ip: { type: String, required: true, index: true },
    userAgent: { type: String, default: '' },
    referrer: { type: String, default: '' },
    sessionId: { type: String, index: true },
    firstVisit: { type: Date, default: Date.now },
    lastVisit: { type: Date, default: Date.now },
    visitCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

VisitorSchema.index({ createdAt: -1 });

export const Visitor = mongoose.models.Visitor || mongoose.model<IVisitor>('Visitor', VisitorSchema);
export default Visitor;

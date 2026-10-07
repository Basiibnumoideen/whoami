import mongoose, { Schema, Document } from 'mongoose';

export interface ICertification extends Document {
  title: string;
  provider: string;
  issueDate: string;
  credentialID?: string;
  image?: string;
  verifyURL?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CertificationSchema = new Schema<ICertification>(
  {
    title: { type: String, required: true, trim: true },
    provider: { type: String, required: true, trim: true },
    issueDate: { type: String, required: true, default: '2024' },
    credentialID: { type: String, default: '' },
    image: { type: String, default: '' },
    verifyURL: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CertificationSchema.index({ order: 1 });

export const Certification = mongoose.models.Certification || mongoose.model<ICertification>('Certification', CertificationSchema);
export default Certification;

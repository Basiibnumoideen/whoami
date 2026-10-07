import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  action: 'CREATED' | 'UPDATED' | 'DELETED' | 'SYNCED' | 'DEPLOYED' | 'INDEXED' | 'LOGIN' | 'FAILED_LOGIN' | 'LOGOUT';
  target: string;
  author: string;
  timestamp: string;
  metadata?: any;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      enum: ['CREATED', 'UPDATED', 'DELETED', 'SYNCED', 'DEPLOYED', 'INDEXED', 'LOGIN', 'FAILED_LOGIN', 'LOGOUT'],
      required: true,
    },
    target: { type: String, required: true },
    author: { type: String, required: true, default: 'Admin' },
    timestamp: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;

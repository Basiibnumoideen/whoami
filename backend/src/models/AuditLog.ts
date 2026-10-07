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

export const recordAuditLog = async (
  action: 'CREATED' | 'UPDATED' | 'DELETED' | 'SYNCED' | 'DEPLOYED' | 'INDEXED' | 'LOGIN' | 'FAILED_LOGIN' | 'LOGOUT',
  target: string,
  author: string = 'Admin',
  metadata?: any
): Promise<void> => {
  try {
    const logData = {
      action,
      target,
      author,
      timestamp: new Date().toISOString(),
      metadata,
    };

    if (mongoose.connection.readyState === 1) {
      await AuditLog.create(logData);
    }

    // Keep memory fallback in sync for testing or when DB disconnected
    try {
      const { memoryStore } = await import('../services/memoryStore');
      if (memoryStore && Array.isArray(memoryStore.auditLogs)) {
        memoryStore.auditLogs.unshift({
          _id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          createdAt: new Date(),
          ...logData,
        });
        if (memoryStore.auditLogs.length > 200) {
          memoryStore.auditLogs.pop();
        }
      }
    } catch {
      // Memory store sync optional
    }
  } catch (err) {
    console.warn('[AuditLog] Failed to record audit log:', err);
  }
};

export default AuditLog;

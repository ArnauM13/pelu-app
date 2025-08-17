import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ReserveDocument extends Document {
  uid: string; // Firebase uid (owner)
  id: string; // business reservation id (UUID)
  clientName: string;
  email: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm
  notes?: string;
  serviceId: string;
  status: 'draft' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
}

const reserveSchema = new Schema<ReserveDocument>(
  {
    uid: { type: String, required: true, index: true },
    id: { type: String, required: true, unique: true },
    clientName: { type: String, required: true },
    email: { type: String, required: true },
    data: { type: String, required: true },
    hora: { type: String, required: true },
    notes: { type: String },
    serviceId: { type: String, required: true },
    status: { type: String, enum: ['draft', 'confirmed', 'cancelled', 'completed'], required: true, default: 'confirmed' }
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        // Preserve business id; drop Mongo internal id
        delete ret._id;
        return ret;
      }
    }
  }
);

export const Reserve: Model<ReserveDocument> =
  mongoose.models.Reserve || mongoose.model<ReserveDocument>('Reserve', reserveSchema);

// Indexes optimized for reads
reserveSchema.index({ uid: 1, createdAt: -1 });



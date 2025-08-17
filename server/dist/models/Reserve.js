"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reserve = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const reserveSchema = new mongoose_1.Schema({
    uid: { type: String, required: true, index: true },
    id: { type: String, required: true, unique: true },
    clientName: { type: String, required: true },
    email: { type: String, required: true },
    data: { type: String, required: true },
    hora: { type: String, required: true },
    notes: { type: String },
    serviceId: { type: String, required: true },
    status: { type: String, enum: ['draft', 'confirmed', 'cancelled', 'completed'], required: true, default: 'confirmed' }
}, {
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
});
exports.Reserve = mongoose_1.default.models.Reserve || mongoose_1.default.model('Reserve', reserveSchema);

import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  propertyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  transactionType: { type: String, enum: ['sale','purchase','rent_tenant','rent_landlord'], required: true },
  commissionText: String,
  locale: { type: String, enum: ['he','ar','en'], default: 'he' },

  status: { type: String, enum: ['draft','sent','viewed','signed_client','signed_agent','completed','voided'], default: 'draft' },

  mergeData: {},

  files: {
    draftUrl: String,
    finalUrl: String,
    sha256: String,
  },

  audit: [{
    ev: String,
    by: String,
    ip: String,
    ua: String,
    ts: Date
  }]
}, { timestamps: true });

export default mongoose.models.SignatureContract || mongoose.model('SignatureContract', schema);


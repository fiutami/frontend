export interface PetDocument {
  id: string;
  petId: string;
  title: string;
  documentType: PetDocumentType;
  fileUrl: string | null;
  contentType: string;
  fileSizeBytes: number;
  documentDate: string | null;
  expiryDate: string | null;
  notes: string | null;
  vetName: string | null;
  isVerified: boolean;
  createdAt: string;
}

export type PetDocumentType =
  | 'vaccination'
  | 'health_record'
  | 'pedigree'
  | 'adoption_paper'
  | 'prescription'
  | 'insurance'
  | 'other';

export interface CreatePetDocumentRequest {
  title: string;
  documentType: PetDocumentType;
  documentDate?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
  vetName?: string | null;
}

export interface UpdatePetDocumentRequest {
  title?: string | null;
  documentType?: PetDocumentType | null;
  documentDate?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
  vetName?: string | null;
}

export const DOCUMENT_TYPE_LABELS: Record<PetDocumentType, string> = {
  vaccination: 'Vaccinazione',
  health_record: 'Cartella clinica',
  pedigree: 'Pedigree',
  adoption_paper: 'Documento adozione',
  prescription: 'Prescrizione',
  insurance: 'Assicurazione',
  other: 'Altro'
};

export const DOCUMENT_TYPE_ICONS: Record<PetDocumentType, string> = {
  vaccination: 'vaccines',
  health_record: 'medical_information',
  pedigree: 'workspace_premium',
  adoption_paper: 'description',
  prescription: 'medication',
  insurance: 'health_and_safety',
  other: 'insert_drive_file'
};

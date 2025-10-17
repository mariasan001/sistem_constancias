export type Tramite = {
  id: number;
  folio: string;
  tramiteTypeId: number;
  tramiteTypeDesc: string;
  statusId: number;
  statusDesc: string;
  requesterId: string;
  requesterName?: string | null;
  createdAt: string;
  assignedTo?: string | null;
  assignedToName?: string | null;
  assignedAt?: string | null;
  assignedBy?: string | null;
  assignedByName?: string | null;
  docsCount: number;
  adeudo?: number | null;
  noficio?: string | null;
  evidencia?: string | null;
  enadeudo?: boolean | null;
  remainingDays?: number | null;
  dueDate?: string | null;
  slaLabel?: string | null;
};

export type TramitePage = {
  content: Tramite[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export interface TramiteHistoryItem {
  fromStatus: string; toStatus: string; changedBy: string; changedAt: string; comment: string;
}
export interface TramiteDoc {
  id: number; docTypeId: number; docTypeDesc: string;
  originalName: string; mimeType: string; sizeBytes: number;
  uploadedAt: string; downloadUrl: string;
}
export interface TramiteDetail {
  folio: string; tramiteType: string; userId: string; userName: string; currentStatus: string; createdAt: string;
  history: TramiteHistoryItem[];
}
export interface TramiteFull { history: TramiteDetail; docs: TramiteDoc[]; }

export type TramiteType = { id: number; descArea: string; };
export type Analyst = { userId: string; name: string; subWorkUnitId: number; };

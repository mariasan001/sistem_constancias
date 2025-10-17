// src/app/(private)/dashboard/asignaciones/components/columns.ts
export type ColumnId =
  | 'folio' | 'tipo' | 'estatus' | 'asignadoA' | 'asigno' | 'solicitante'
  | 'creado' | 'enAdeudo' | 'monto' | 'noficio' | 'evidencia' | 'vence' | 'tiempo';

export type ColumnDef = {
  id: ColumnId;
  label: string;
  width: number;
  visible: boolean;
  sticky?: boolean; // para la 1ª columna
};

export const DEFAULT_COLUMNS: ColumnDef[] = [
  { id:'folio',       label:'Folio (sistema)', width:160, visible:true,  sticky:true },
  { id:'tipo',        label:'Tipo',            width:120, visible:true  },
  { id:'estatus',     label:'Estatus',         width:140, visible:true  },
  { id:'asignadoA',   label:'Asignado a',      width:240, visible:true  },
  { id:'asigno',      label:'Asignó',          width:120, visible:true  },
  { id:'solicitante', label:'Solicitante',     width:180, visible:true  },
  { id:'creado',      label:'Creado',          width:180, visible:true  },
  { id:'enAdeudo',    label:'En adeudo',       width:110, visible:true  },
  { id:'monto',       label:'Monto',           width:160, visible:true  },
  { id:'noficio',     label:'No. de oficio',   width:220, visible:true  },
  { id:'evidencia',   label:'Evidencia',       width:380, visible:true  },
  { id:'vence',       label:'Vence',           width:140, visible:true  },
  { id:'tiempo',      label:'Tiempo',          width:140, visible:true  },
];

'use client';
import c from '../../styles/cells.module.css';

export default function SlaCells({ row }:{ row:any }) {
  const label = (row as any).slaLabel ?? '—';
  const days = (row as any).remainingDays;
  const norm = normalize(label);
  return (
    <>
      <td>{formatDateShort((row as any).dueDate)}</td>
      <td>
        <span className={c.badge} data-variant={norm} title={`Días restantes: ${Number.isFinite(days)?days:'—'}`}>
          {label}{Number.isFinite(days)?` (${days} d)`:''}
        </span>
      </td>
    </>
  );
}

function normalize(t?:string|null){const s=(t??'').toLowerCase();if(s.includes('vencid'))return'vencido';if(s.includes('por vencer'))return'por-vencer';if(s.includes('tiempo'))return'en-tiempo';return'desconocido';}
function formatDateShort(iso?:string|null){ if(!iso) return '—'; const d=new Date(iso); return isNaN(d.getTime())?'—':d.toLocaleDateString(undefined,{year:'numeric',month:'2-digit',day:'2-digit'}); }

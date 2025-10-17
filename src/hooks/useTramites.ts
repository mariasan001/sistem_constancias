import { Tramite } from '@/features/asignaciones/tramite.model';
import { searchTramites } from '@/features/asignaciones/tramite.service';
import { useEffect, useState } from 'react';

export function useTramites(
  subWorkUnitId?: number,
  onlyUnassigned: boolean = false,
  assignedTo?: string
) {
  const [rows, setRows]   = useState<Tramite[]>([]);
  const [page, setPage]   = useState(0);
  const [size, setSize]   = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await searchTramites({
        subWorkUnitId, q, page, size,
        ...(onlyUnassigned ? { assigned: false } : {}),
        ...(assignedTo ? { assignedTo } : {}),
      });
      setRows(res.content); setTotal(res.totalElements);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchList(); }, [page, size, q, subWorkUnitId, onlyUnassigned, assignedTo]);

  return { rows, setRows, page, setPage, size, setSize, total, q, setQ, loading, fetchList };
}

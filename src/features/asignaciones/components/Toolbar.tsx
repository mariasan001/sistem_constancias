'use client';

import { useState, useEffect } from 'react';
import styles from './Toolbar.module.css'; // antes: ../styles/table.module.css


// Firma simple (la que usas en la page)
type PropsSimple = {
  q: string;
  onQ: (v: string) => void;
  onlyUnassigned: boolean;
  onOnlyUnassigned: (v: boolean) => void;
  size: number;
  onSize: (n: number) => void;
};

// Firma “completa” (la que te marca TS en el error)
type PropsFull = {
  q: string;
  setQ: (v: string) => void;
  page: number;
  setPage: (n: number) => void;
  size: number;
  setSize: (n: number) => void;
  total: number;
  loading: boolean;
  // opcionales para compat
  onlyUnassigned?: boolean;
  onOnlyUnassigned?: (v: boolean) => void;
};

type Props = PropsSimple | PropsFull;

function isFull(p: Props): p is PropsFull {
  return (p as any)?.setQ !== undefined;
}

export default function Toolbar(props: Props) {
  const q = props.q;
  const size = props.size;
  const onlyUnassigned = ('onlyUnassigned' in props ? props.onlyUnassigned : false) ?? false;

  // normaliza handlers
  const doSearch = (v: string) => isFull(props) ? props.setQ(v) : props.onQ(v);
  const doSize   = (n: number) => isFull(props) ? props.setSize(n) : props.onSize(n);
  const doOnly   = (v: boolean) =>
    isFull(props)
      ? props.onOnlyUnassigned?.(v) // puede venir undef en firma full
      : props.onOnlyUnassigned(v);

  const [text, setText] = useState(q);
  useEffect(() => setText(q), [q]);

  return (
    <div className={styles.toolbar}>
      <input
        className={styles.search}
        placeholder="Buscar por folio, solicitante, oficio…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && doSearch(text)}
      />
      <button className={styles.btn} onClick={() => doSearch(text)}>Buscar</button>

      <label className={styles.chk}>
        <input
          type="checkbox"
          checked={onlyUnassigned}
          onChange={(e) => doOnly?.(e.target.checked)}
        />
        Solo no asignados
      </label>

      <label className={styles.sizeSel}>
        Tamaño:
        <select value={size} onChange={(e) => doSize(Number(e.target.value))}>
          {[10,20,30,50].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
    </div>
  );
}

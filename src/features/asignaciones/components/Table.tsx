'use client';

import t from '../styles/table.module.css';
import Row from './Row';
import DetailPanel from './DetailPanel';

const COL_WIDTHS = [160,120,140,240,120,160,180,110,160,260,380,140,140] as const;
const HEADERS = ['Folio','Tipo','Estatus','Asignado a','Asignó','Solicitante','Creado','En adeudo','Monto','No. de oficio','Evidencia','Vence','Tiempo'] as const;

export default function Table({ state }:{ state:any }) {
  return (
    <div className={t.tableWrap} role="region" aria-label="Tabla de asignaciones">
      <table className={t.table}>
        <colgroup>{COL_WIDTHS.map((w,i)=><col key={i} style={{width:w}} />)}</colgroup>
        <thead><tr>{HEADERS.map((h,i)=><th key={i}>{h}</th>)}</tr></thead>
        <tbody>
          {state.loading ? (
            <tr><td colSpan={COL_WIDTHS.length}><div className={t.skeleton}>Cargando…</div></td></tr>
          ) : state.rows.length ? (
            state.rows.map((r:any) => (
              <>
                <Row key={r.id} row={r} state={state} />
                {state.openFolio === r.folio && (
                  <tr className={t.detailRow}>
                    <td colSpan={COL_WIDTHS.length}>
                      <DetailPanel loading={state.loadingDetail} detail={state.detail} />
                    </td>
                  </tr>
                )}
              </>
            ))
          ) : (
            <tr><td colSpan={COL_WIDTHS.length}><div className={t.empty}>Sin resultados</div></td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

'use client';

import c from '../styles/cells.module.css';
import TypeCell from './cells/TypeCell';
import StatusCell from './cells/StatusCell';
import AssigneeCell from './cells/AssigneeCell';
import MoneyCell from './cells/MoneyCell';
import OficioCell from './cells/OficioCell';
import EvidenceCell from './cells/EvidenceCell';
import SlaCells from './cells/SlaCells';

export default function Row({ row, state }:{ row:any; state:any }) {
  const variant = String(row.statusDesc||'').toLowerCase();
  const requester = row.requesterId + (row.requesterName ? ` — ${row.requesterName}` : '');

  return (
    <tr>
      <td className={c.clickable} onClick={()=>state.selectRow(row.folio)}>{row.folio}</td>

      <td>
        <TypeCell
          row={row}
          canEdit={state.canChangeType}
          types={state.tramiteTypes}
          editing={state.editingType === row.folio}
          setEditing={(v:boolean)=>state.setEditingType(v?row.folio:null)}
          onChange={(id:number)=>state.changeType(row.folio, id)}
        />
      </td>

      <td>
        <StatusCell
          row={row}
          canEdit={state.canChangeStatus}
          variant={variant}
          editing={state.editingStatus === row.folio}
          setEditing={(v:boolean)=>state.setEditingStatus(v?row.folio:null)}
          onChange={(id:number)=>state.changeStatus(row, id)}
        />
      </td>

      <td>
        <AssigneeCell
          row={row}
          canEdit={state.canAssign}
          analysts={state.analysts}
          assigning={state.assigning === row.folio}
          setAssigning={(v:boolean)=>state.setAssigning(v?row.folio:null)}
          onAssign={(uid:string)=>state.assignTo(row, uid, state.analysts)}
          saving={state.savingRow === row.folio}
        />
      </td>

      <td>{row.assignedByName ?? row.assignedBy ?? '—'}</td>
      <td>{requester}</td>
      <td>{new Date(row.createdAt).toLocaleString()}</td>

      <td>
        <button
          className={c.adeudoSwitch}
          data-yn={(state.adeudoMap[row.folio] ?? (row as any).enadeudo) ? 'si' : 'no'}
          onClick={()=>state.toggleAdeudo(row.folio)}
          aria-pressed={state.adeudoMap[row.folio]}
          title={state.adeudoMap[row.folio] ? 'Sí en adeudo':'No en adeudo'}
        />
      </td>

      <td><MoneyCell value={state.montoMap[row.folio]} onChange={(v:string)=>state.setMonto(row.folio, v)} /></td>
      <td><OficioCell value={state.noficioMap[row.folio]} onChange={(v:string)=>state.setNoficio(row.folio, v)} /></td>

      <td>
        <EvidenceCell
          row={row}
          picked={state.fileNameMap[row.folio]}
          uploading={!!state.uploadingMap[row.folio]}
          uploaded={!!state.uploadOkMap[row.folio]}
          error={state.uploadErrMap[row.folio]}
          onPick={(f?:File)=>state.onPickEvidence(row, f)}
          onView={()=>state.viewEvidence(row.folio)}
          onDownload={()=>state.downloadEvidence(row.folio)}
        />
      </td>

      <SlaCells row={row} />
    </tr>
  );
}

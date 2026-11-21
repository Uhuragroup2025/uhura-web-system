import React, { useEffect, useRef, useState } from 'react';
import { ClientKickoffView } from './ClientKickoffView';
import { openBridge, readSnapshot, readSnapshotFromHash, type ClientViewCommand, type ClientViewData } from './clientScheduleBridge';

/**
 * Pestaña «Cronograma y acuerdos» (?app=eco&cronograma=1#d=…).
 * Muestra la foto que viene en el enlace (o la última guardada). Si ECO está abierto en otra pestaña
 * del mismo navegador, se conecta y lo que se edite aquí se guarda allá. Si no hay conexión (otro
 * navegador, ECO cerrado o un panel que no abre pestañas aparte), es una vista para compartir:
 * se ve todo, sin editar.
 */
export const ClientScheduleWindow: React.FC = () => {
  const [data, setData] = useState<ClientViewData | null>(() => readSnapshotFromHash() || readSnapshot());
  const [connected, setConnected] = useState(false);
  const bridgeRef = useRef<ReturnType<typeof openBridge> | null>(null);

  useEffect(() => {
    const bridge = openBridge((msg) => {
      if (msg.kind !== 'snapshot') return;
      if (msg.data) {
        setData(msg.data);
        setConnected(true);
      } else {
        setConnected(false);
      }
    });
    bridgeRef.current = bridge;
    bridge.post({ kind: 'command', cmd: { type: 'hello' } });
    const onUnload = () => bridge.post({ kind: 'command', cmd: { type: 'closed' } });
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
      bridge.close();
    };
  }, []);

  useEffect(() => {
    document.title = data ? `Cronograma y acuerdos — ${data.projectName}` : 'Cronograma y acuerdos';
  }, [data]);

  // Cada edición se aplica aquí de una vez (para que escribir no salte) y se envía a ECO
  const send = (cmd: ClientViewCommand, local?: (d: ClientViewData) => ClientViewData) => {
    if (local) setData((d) => (d ? local(d) : d));
    bridgeRef.current?.post({ kind: 'command', cmd });
  };

  if (!data) {
    return (
      <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="max-w-sm text-center space-y-2">
          <h1 className="text-lg font-bold text-[#0f172a]">Cronograma y acuerdos</h1>
          <p className="text-[13px] text-[#64748b]">Ábrelo desde el proyecto en ECO con «Ver cronograma y acuerdos» o «Cronograma cliente».</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {!connected && (
        <div className="no-print sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-[#e7e3ef] text-[#475569] text-[12px] text-center px-4 py-2">
          Vista para compartir · Para editar fechas o acuerdos, ábrelo desde el proyecto en ECO.
        </div>
      )}
      <ClientKickoffView
        {...data}
        standalone
        readOnly={!connected}
        onChangeClientContacts={(approver, backup) => send({ type: 'contacts', approver, backup }, (d) => ({ ...d, clientApprover: approver, clientApproverBackup: backup }))}
        onChangeSteps={(steps) => send({ type: 'steps', steps }, (d) => ({ ...d, steps }))}
        onChangeCommitmentDate={(key, date) => send({ type: 'commitmentDate', key, date }, (d) => ({ ...d, commitments: d.commitments.map((c) => (c.key === key ? { ...c, date } : c)) }))}
        onChangeAgreements={(list) => send({ type: 'agreements', list }, (d) => ({ ...d, agreements: list }))}
        onClientApproval={(approval) => send({ type: 'approval', approval }, (d) => ({ ...d, clientApproval: approval }))}
        onApply={data.canApply ? () => send({ type: 'apply' }) : undefined}
        onClose={() => window.close()}
      />
    </>
  );
};

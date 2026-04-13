import { useEffect, useState } from 'react';
import { requestsService, type Request } from '../services/requests';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
import { Clock, CheckCircle2, XCircle, ChevronRight, 
  Image as ImageIcon, AlertCircle, Filter, 
  Check, X, CreditCard, User as UserIcon, DollarSign, Wallet
} from 'lucide-react';
import { settingsService } from '../services/settings';

export default function AdminDashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'TODOS' | 'PENDENTE' | 'APROVADO' | 'NEGADO'>('TODOS');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [isEditingSaldo, setIsEditingSaldo] = useState(false);
  const [newSaldo, setNewSaldo] = useState('');

  useEffect(() => {
    loadRequests();
    loadSaldo();

    // Subscribe to real-time changes
    const subscription = requestsService.subscribeToRequests(() => {
      loadRequests(); // Reload data when any change happens
    });
    
    const settingsSub = settingsService.subscribeToSettings(() => {
      loadSaldo();
    });

    return () => {
      subscription.unsubscribe();
      settingsSub.unsubscribe();
    };
  }, []);

  async function loadSaldo() {
    try {
      const saldo = await settingsService.getSaldoAtual();
      setSaldoAtual(saldo);
    } catch (err) {
      console.error('Error loading saldo:', err);
    }
  }

  const handleUpdateSaldo = async () => {
    try {
      setLoading(true);
      await settingsService.updateSaldoAtual(Number(newSaldo.replace(',', '.')));
      setIsEditingSaldo(false);
      setNewSaldo('');
      await loadSaldo();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar saldo.');
    } finally {
      setLoading(false);
    }
  };

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await requestsService.getAllRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredRequests = requests.filter(r => filter === 'TODOS' || r.status === filter);

  const handleAction = async (status: 'APROVADO' | 'NEGADO') => {
    if (!selectedRequest) return;
    if (status === 'NEGADO' && !adminResponse) {
      alert('Por favor, informe o motivo da negação.');
      return;
    }

    setActionLoading(true);
    try {
      await requestsService.updateRequestStatus(selectedRequest.id, status, adminResponse);
      await loadRequests();
      setSelectedRequest(null);
      setAdminResponse('');
    } catch (err) {
      console.error(err);
      alert('Erro ao processar ação.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePaid = async (request: Request) => {
    try {
      await requestsService.togglePaid(request.id, !request.pago);
      await loadRequests();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Painel Administrativo</h2>
        <p className="text-sm text-slate-500">Gerencie as solicitações financeiras</p>
      </header>

      {/* Saldo Management */}
      <div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-200">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 opacity-80">
            <Wallet size={20} />
            <h3 className="text-sm font-medium uppercase tracking-wider">Saldo Atual (Visível para Carol)</h3>
          </div>
        </div>
        {!isEditingSaldo ? (
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black">{formatCurrency(saldoAtual)}</p>
            <button 
              onClick={() => { setIsEditingSaldo(true); setNewSaldo(saldoAtual.toString()); }}
              className="rounded-xl bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur-sm transition-all hover:bg-white/30 active:scale-95"
            >
              Atualizar
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <DollarSign size={20} className="text-indigo-300" />
              </div>
              <input
                type="number"
                step="0.01"
                value={newSaldo}
                onChange={(e) => setNewSaldo(e.target.value)}
                className="w-full rounded-xl border border-transparent bg-indigo-700/50 py-3 pl-10 pr-4 text-white outline-none placeholder:text-indigo-300 focus:border-white focus:bg-indigo-700"
                placeholder="Novo valor..."
                autoFocus
              />
            </div>
            <button 
              onClick={handleUpdateSaldo}
              className="flex items-center justify-center rounded-xl bg-white px-4 font-bold text-indigo-600 transition-all hover:bg-indigo-50 active:scale-95"
            >
              Salvar
            </button>
            <button 
              onClick={() => setIsEditingSaldo(false)}
              className="flex items-center justify-center rounded-xl bg-indigo-800 px-4 text-white transition-all hover:bg-indigo-900 active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {['TODOS', 'PENDENTE', 'APROVADO', 'NEGADO'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all",
              filter === f 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                : "bg-white text-slate-500 ring-1 ring-slate-200"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 py-12 text-slate-400">
            <Filter size={48} className="mb-4 opacity-20" />
            <p>Nenhum pedido nesta categoria.</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <AdminRequestCard 
              key={request.id} 
              request={request} 
              onAction={() => setSelectedRequest(request)}
              onTogglePaid={() => handleTogglePaid(request)}
            />
          ))
        )}
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Analisar Pedido</h3>
                <button onClick={() => setSelectedRequest(null)} className="rounded-full bg-slate-100 p-2 text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6 space-y-2 rounded-2xl bg-slate-50 p-4">
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-slate-500">Valor</span>
                  <span className="text-lg font-bold text-indigo-600">{formatCurrency(selectedRequest.valor)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-slate-500">Usuário</span>
                  <span className="text-xs font-bold text-slate-700">{selectedRequest.profiles?.email}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500">Motivo</span>
                  <p className="text-sm text-slate-700">{selectedRequest.motivo}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Resposta / Motivo (Obrigatório se Negar)</label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Escreva aqui sua resposta..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAction('NEGADO')}
                    disabled={actionLoading}
                    className="flex items-center justify-center rounded-xl bg-red-50 py-4 font-bold text-red-600 transition-all active:scale-95"
                  >
                    <X size={20} className="mr-2" />
                    Negar
                  </button>
                  <button
                    onClick={() => handleAction('APROVADO')}
                    disabled={actionLoading}
                    className="flex items-center justify-center rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-lg shadow-emerald-100 transition-all active:scale-95"
                  >
                    <Check size={20} className="mr-2" />
                    Aprovar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminRequestCard({ request, onAction, onTogglePaid }: { request: Request, onAction: () => void, onTogglePaid: () => void, key?: any }) {
  const statusConfig = {
    PENDENTE: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Pendente' },
    APROVADO: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Aprovado' },
    NEGADO: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Negado' },
  };

  const config = statusConfig[request.status];
  const StatusIcon = config.icon;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <UserIcon size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">{request.profiles?.email}</p>
            <p className="text-[10px] text-slate-500">{formatDate(request.data_criacao)}</p>
          </div>
        </div>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", config.bg, config.color)}>
          {config.label}
        </span>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 p-3">
        <p className="text-lg font-black text-slate-900">{formatCurrency(request.valor)}</p>
        {request.comprovante_url && (
          <a href={request.comprovante_url} target="_blank" rel="noreferrer" className="text-indigo-600">
            <ImageIcon size={20} />
          </a>
        )}
      </div>

      <p className="mb-4 text-sm text-slate-600 line-clamp-2">{request.motivo}</p>

      <div className="flex items-center space-x-2">
        {request.status === 'PENDENTE' ? (
          <button
            onClick={onAction}
            className="flex-1 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-100 active:scale-95"
          >
            Analisar
          </button>
        ) : (
          <div className="flex flex-1 items-center space-x-2">
            <button
              onClick={onTogglePaid}
              className={cn(
                "flex flex-1 items-center justify-center rounded-xl py-3 text-xs font-bold transition-all active:scale-95",
                request.pago ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
              )}
            >
              <CreditCard size={14} className="mr-2" />
              {request.pago ? 'Pago' : 'Marcar Pago'}
            </button>
            {request.status === 'APROVADO' && !request.pago && (
               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                 <AlertCircle size={20} />
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

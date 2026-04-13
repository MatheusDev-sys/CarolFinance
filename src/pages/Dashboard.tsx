import { useEffect, useState } from 'react';
import { requestsService, type Request } from '../services/requests';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckCircle2, XCircle, ChevronRight, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();

    // Subscribe to real-time changes
    const subscription = requestsService.subscribeToRequests(() => {
      loadRequests(); // Reload data when any change happens
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await requestsService.getMyRequests();
      setRequests(data);
    } catch (err: any) {
      setError('Erro ao carregar solicitações.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

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
        <h2 className="text-2xl font-bold text-slate-900">Minhas Solicitações</h2>
        <p className="text-sm text-slate-500">Acompanhe o status dos seus pedidos</p>
      </header>

      {error && (
        <div className="flex items-center rounded-xl bg-red-50 p-4 text-red-600">
          <AlertCircle className="mr-2" size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {requests.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 py-12 text-slate-400"
            >
              <Clock size={48} className="mb-4 opacity-20" />
              <p>Nenhuma solicitação encontrada.</p>
            </motion.div>
          ) : (
            requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function RequestCard({ request }: { request: Request, key?: any }) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    PENDENTE: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Pendente' },
    APROVADO: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Aprovado' },
    NEGADO: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Negado' },
  };

  const config = statusConfig[request.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all active:scale-[0.98]"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", config.bg, config.color)}>
              <StatusIcon size={20} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(request.valor)}</p>
              <p className="text-xs text-slate-500">{formatDate(request.data_criacao)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", config.bg, config.color)}>
              {config.label}
            </span>
            <ChevronRight size={16} className={cn("text-slate-300 transition-transform", expanded && "rotate-90")} />
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 space-y-4 border-t border-slate-100 pt-4"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Motivo</p>
                <p className="text-sm text-slate-700">{request.motivo}</p>
              </div>

              {request.comprovante_url && (
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Comprovante</p>
                  <a 
                    href={request.comprovante_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ImageIcon size={14} className="mr-1.5" />
                    Ver Imagem
                  </a>
                </div>
              )}

              {request.status !== 'PENDENTE' && (
                <div className={cn("rounded-xl p-3", config.bg)}>
                  <p className={cn("text-[10px] font-bold uppercase tracking-wider opacity-60", config.color)}>Resposta do Admin</p>
                  <p className={cn("text-sm font-medium", config.color)}>
                    {request.resposta_admin || (request.status === 'APROVADO' ? 'Solicitação aprovada!' : 'Sem justificativa.')}
                  </p>
                  {request.data_resposta && (
                    <p className={cn("mt-1 text-[10px] opacity-50", config.color)}>
                      {formatDate(request.data_resposta)}
                    </p>
                  )}
                </div>
              )}

              {request.pago && (
                <div className="flex items-center rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <CheckCircle2 size={16} className="mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Pagamento Realizado</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

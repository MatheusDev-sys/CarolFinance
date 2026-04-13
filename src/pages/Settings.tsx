import { useState } from 'react';
import { requestsService } from '../services/requests';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { Trash2, Shield, AlertTriangle, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const { user, role, refreshRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleRefreshRole = async () => {
    setSyncing(true);
    await refreshRole();
    setSyncing(false);
  };

  const handleDeleteAll = async () => {
    setLoading(true);
    try {
      await requestsService.deleteAllImages();
      setSuccess(true);
      setShowConfirm(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Erro ao apagar imagens.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Configurações</h2>
        <p className="text-sm text-slate-500">Gerencie sua conta e sistema</p>
      </header>

      <div className="space-y-4">
        {/* Profile Info */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Shield size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Logado como</p>
              <p className="text-lg font-bold text-slate-900">{user?.email}</p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  {role === 'admin' ? 'Administrador' : 'Usuário'}
                </span>
                <button 
                  onClick={handleRefreshRole}
                  disabled={syncing}
                  className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-600 disabled:opacity-50"
                >
                  <RefreshCw size={12} className={cn("mr-1", syncing && "animate-spin")} />
                  Sincronizar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        {role === 'admin' && (
          <div className="space-y-4">
            <h3 className="px-2 text-xs font-bold uppercase tracking-widest text-slate-400">Ações do Sistema</h3>
            
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-6 flex items-start space-x-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Limpar Armazenamento</h4>
                  <p className="text-sm text-slate-500">Apaga permanentemente todas as imagens de comprovantes do servidor.</p>
                </div>
              </div>

              {!showConfirm ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="w-full rounded-xl border-2 border-red-100 bg-white py-3 font-bold text-red-500 transition-all active:scale-95"
                >
                  Apagar todas as imagens
                </button>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 rounded-2xl bg-red-50 p-4"
                >
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="mr-2" size={20} />
                    <p className="text-sm font-bold">Tem certeza absoluta?</p>
                  </div>
                  <p className="text-xs text-red-500">Esta ação não pode ser desfeita. Todos os arquivos serão removidos do Supabase Storage.</p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 rounded-xl bg-white py-2 text-sm font-bold text-slate-600"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDeleteAll}
                      disabled={loading}
                      className="flex flex-1 items-center justify-center rounded-xl bg-red-600 py-2 text-sm font-bold text-white disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" size={16} /> : 'Sim, Apagar'}
                    </button>
                  </div>
                </motion.div>
              )}

              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center justify-center rounded-xl bg-emerald-50 p-3 text-emerald-600"
                >
                  <CheckCircle2 size={16} className="mr-2" />
                  <span className="text-sm font-bold">Imagens apagadas com sucesso!</span>
                </motion.div>
              )}
            </div>
          </div>
        )}

        <div className="pt-8 text-center">
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-300">Carolaine Finance v1.0.0</p>
        </div>
      </div>
    </div>
  );
}

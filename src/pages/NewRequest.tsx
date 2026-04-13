import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestsService } from '../services/requests';
import { compressImage } from '../lib/imageUtils';
import { motion } from 'motion/react';
import { ArrowLeft, Upload, Loader2, CheckCircle2, DollarSign, FileText } from 'lucide-react';

export default function NewRequest() {
  const navigate = useNavigate();
  const [valor, setValor] = useState('');
  const [motivo, setMotivo] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e: any) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const compressed = await compressImage(selectedFile);
    setFile(compressed as File);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(compressed);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      await requestsService.createRequest({
        valor: parseFloat(valor.replace(',', '.')),
        motivo,
        user_id: (await (await import('../lib/supabase')).supabase.auth.getUser()).data.user?.id
      }, file || undefined);

      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900">Solicitação Enviada!</h2>
        <p className="mt-2 text-slate-500">Carolaine, seu pedido foi enviado para análise.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="rounded-full bg-white p-2 text-slate-500 shadow-sm ring-1 ring-slate-200">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Novo Pedido</h2>
          <p className="text-sm text-slate-500">Preencha os detalhes abaixo</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="flex items-center text-sm font-bold text-slate-700">
            <DollarSign size={16} className="mr-1 text-indigo-500" />
            Valor (R$)
          </label>
          <input
            type="text"
            inputMode="decimal"
            required
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-2xl font-bold text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-sm font-bold text-slate-700">
            <FileText size={16} className="mr-1 text-indigo-500" />
            Motivo / Descrição
          </label>
          <textarea
            required
            rows={3}
            placeholder="Para que você precisa desse valor?"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-sm font-bold text-slate-700">
            <Upload size={16} className="mr-1 text-indigo-500" />
            Comprovante (Opcional)
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            />
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-slate-400 transition-colors hover:bg-slate-100">
              {preview ? (
                <img src={preview} alt="Preview" className="h-32 w-32 rounded-xl object-cover shadow-md" />
              ) : (
                <>
                  <Upload size={32} className="mb-2 opacity-50" />
                  <p className="text-xs font-medium">Toque para selecionar imagem</p>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-5 text-lg font-bold text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            'Enviar Solicitação'
          )}
        </button>
      </form>
    </div>
  );
}

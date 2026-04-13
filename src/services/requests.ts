import { supabase } from '../lib/supabase';

export interface Request {
  id: string;
  user_id: string;
  valor: number;
  motivo: string;
  comprovante_url: string | null;
  status: 'PENDENTE' | 'APROVADO' | 'NEGADO';
  resposta_admin: string | null;
  pago: boolean;
  data_criacao: string;
  data_resposta: string | null;
  profiles?: {
    email: string;
  };
}

export const requestsService = {
  async getMyRequests() {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('data_criacao', { ascending: false });

    if (error) throw error;
    return data as Request[];
  },

  async getAllRequests() {
    const { data, error } = await supabase
      .from('requests')
      .select('*, profiles(email)')
      .order('data_criacao', { ascending: false });

    if (error) throw error;
    return data as Request[];
  },

  async createRequest(request: Partial<Request>, file?: File) {
    let comprovante_url = null;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${(await supabase.auth.getUser()).data.user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('comprovantes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('comprovantes')
        .getPublicUrl(filePath);
      
      comprovante_url = publicUrl;
    }

    const { data, error } = await supabase
      .from('requests')
      .insert([{ ...request, comprovante_url }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateRequestStatus(id: string, status: 'APROVADO' | 'NEGADO', resposta_admin?: string) {
    const { data, error } = await supabase
      .from('requests')
      .update({ 
        status, 
        resposta_admin, 
        data_resposta: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async togglePaid(id: string, pago: boolean) {
    const { data, error } = await supabase
      .from('requests')
      .update({ pago })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  subscribeToRequests(callback: (payload: any) => void) {
    return supabase
      .channel('requests_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        (payload) => {
          console.log('Mudança detectada em tempo real:', payload);
          callback(payload);
        }
      )
      .subscribe();
  },

  async deleteAllImages() {
    // This is a complex operation in Supabase Storage as it doesn't have a "delete all" for buckets via client SDK easily
    // Usually requires listing and then deleting.
    const { data: list, error: listError } = await supabase.storage.from('comprovantes').list();
    if (listError) throw listError;

    if (list && list.length > 0) {
      const filesToRemove = list.map((x) => x.name);
      const { error: deleteError } = await supabase.storage.from('comprovantes').remove(filesToRemove);
      if (deleteError) throw deleteError;
    }
    
    // Also need to clear URLs in the database to be safe
    const { error: dbError } = await supabase
      .from('requests')
      .update({ comprovante_url: null });
    
    if (dbError) throw dbError;
  }
};

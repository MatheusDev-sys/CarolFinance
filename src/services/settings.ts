import { supabase } from '../lib/supabase';

export const settingsService = {
  async getSaldoAtual(): Promise<number> {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'saldo_atual')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is code for 0 rows returned
    return data ? Number(data.value) : 0;
  },

  async updateSaldoAtual(valor: number) {
    const { data: existing, error: fetchError } = await supabase
      .from('settings')
      .select('id')
      .eq('key', 'saldo_atual')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (existing) {
      const { data, error } = await supabase
        .from('settings')
        .update({ value: valor.toString(), updated_at: new Date().toISOString() })
        .eq('key', 'saldo_atual')
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('settings')
        .insert([{ key: 'saldo_atual', value: valor.toString() }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  subscribeToSettings(callback: (payload: any) => void) {
    return supabase
      .channel('settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings' },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();
  }
};

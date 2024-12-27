"use client";

import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const STATIC_USER_ID = 'dev-local';

export const useApiKeys = (onSuccess, onError) => {
  const [apiKeys, setApiKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApiKeys = useCallback(async (sortOrder = 'asc') => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', STATIC_USER_ID)
        .order('name', { ascending: sortOrder === 'asc' });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (err) {
      onError?.('Failed to fetch API keys');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  const createApiKey = useCallback(async (name, maxUsage) => {
    try {
      const newKey = {
        name: name.trim(),
        value: `key_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        user_id: STATIC_USER_ID,
        usage_count: 0,
        max_usage: maxUsage,
      };

      const { data, error } = await supabase
        .from('api_keys')
        .insert([newKey])
        .select()
        .single();

      if (error) throw error;

      setApiKeys(prev => [data, ...prev]);
      onSuccess?.('API key created successfully');
      return data;
    } catch (err) {
      onError?.('Failed to create API key');
      console.error(err);
    }
  }, [onSuccess, onError]);

  const updateApiKey = useCallback(async (id, updates) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update(updates)
        .eq('id', id)
        .eq('user_id', STATIC_USER_ID);

      if (error) throw error;

      setApiKeys(prev => prev.map(key => 
        key.id === id ? { ...key, ...updates } : key
      ));
      onSuccess?.('API key updated successfully');
    } catch (err) {
      onError?.('Failed to update API key');
      console.error(err);
    }
  }, [onSuccess, onError]);

  const deleteApiKey = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id)
        .eq('user_id', STATIC_USER_ID);

      if (error) throw error;
      
      setApiKeys(prev => prev.filter(key => key.id !== id));
      onSuccess?.('API key deleted successfully');
    } catch (err) {
      onError?.('Failed to delete API key');
      console.error(err);
    }
  }, [onSuccess, onError]);

  return {
    apiKeys,
    isLoading,
    fetchApiKeys,
    createApiKey,
    updateApiKey,
    deleteApiKey,
  };
}; 
"use client";

import { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useApiKeys } from '../hooks/useApiKeys';
import { ApiKeyTable } from '../components/ApiKeyTable';
import { CreateApiKeyModal } from '../components/CreateApiKeyModal';
import { supabase } from '../lib/supabase';

const STATIC_USER_ID = 'dev-local';

export default function DashboardPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const {
    apiKeys,
    isLoading,
    fetchApiKeys,
    createApiKey,
    updateApiKey,
    deleteApiKey
  } = useApiKeys(
    (message) => toast.success(message),
    (message) => toast.error(message)
  );

  const handleFetch = useCallback(() => {
    fetchApiKeys(sortOrder);
  }, [fetchApiKeys, sortOrder]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  const handleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
  };

  const handleCreateKey = async (name, maxUsage) => {
    await createApiKey(name, maxUsage);
    setShowCreateForm(false);
  };

  const handleEditKey = async (key) => {
    try {
      await updateApiKey(key.id, { name: key.name });
      handleFetch(); // Refresh the list after update
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyKey = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('API key copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleRegenerateKey = async (id) => {
    try {
      const newValue = `key_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      const { error } = await supabase
        .from('api_keys')
        .update({ value: newValue })
        .eq('id', id)
        .eq('user_id', STATIC_USER_ID);

      if (error) throw error;

      setApiKeys(prev => prev.map(key => 
        key.id === id ? { ...key, value: newValue } : key
      ));
      toast.success('API key regenerated successfully');
    } catch (err) {
      toast.error('Failed to regenerate API key');
      console.error(err);
    }
  };

  const handleDeleteKey = async (id) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id)
        .eq('user_id', STATIC_USER_ID);

      if (error) throw error;
      
      setApiKeys(prev => prev.filter(key => key.id !== id));
      toast.success('API key deleted successfully');
    } catch (err) {
      toast.error('Failed to delete API key');
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <Toaster position="bottom-right" />
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-6 flex justify-between items-center border-b">
            <h2 className="text-lg font-medium">API Keys</h2>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm"
            >
              Create API Key
            </button>
          </div>

          <div className="overflow-x-auto">
            <ApiKeyTable 
              apiKeys={apiKeys}
              isLoading={isLoading}
              sortOrder={sortOrder}
              onSort={handleSort}
              onCopy={handleCopyKey}
              onEdit={handleEditKey}
              onRegenerate={handleRegenerateKey}
              onDelete={handleDeleteKey}
            />
          </div>
        </div>

        <CreateApiKeyModal
          isOpen={showCreateForm}
          isCreating={false}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateKey}
        />
      </div>
    </div>
  );
} 
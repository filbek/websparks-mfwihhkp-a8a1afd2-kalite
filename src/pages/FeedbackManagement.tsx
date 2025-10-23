import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FeedbackList } from '../components/feedback/FeedbackList';
import { FeedbackForm } from '../components/feedback/FeedbackForm';
import { FeedbackFiltersComponent } from '../components/feedback/FeedbackFilters';
import { useFeedback } from '../hooks/useFeedback';
import { useFeedbackCategories } from '../hooks/useFeedbackCategories';
import { FeedbackFilters } from '../types/feedback';
import { useAuth } from '../contexts/AuthContext';

export const FeedbackManagement: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<FeedbackFilters>({});
  const [createLoading, setCreateLoading] = useState(false);
  
  const { feedbacks, loading, error, createFeedback, voteFeedback, addResponse } = useFeedback(filters);
  const { categories } = useFeedbackCategories();
  const { user, hasPermission } = useAuth();

  const handleFilterChange = (newFilters: Partial<FeedbackFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const handleCreateFeedback = async (formData: any) => {
    try {
      setCreateLoading(true);
      await createFeedback(formData);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Görüş oluşturma hatası:', error);
      alert('Görüş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleVote = async (feedbackId: string, voteType: 'up' | 'down') => {
    try {
      await voteFeedback(feedbackId, voteType);
    } catch (error) {
      console.error('Oy verme hatası:', error);
      alert('Oy verilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleRespond = async (feedbackId: string, response: string) => {
    try {
      await addResponse(feedbackId, response);
    } catch (error) {
      console.error('Yanıt ekleme hatası:', error);
      alert('Yanıt eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const canRespond = hasPermission('feedback:respond');
  const canCreate = hasPermission('feedback:create');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-secondary-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">Görüş ve Öneriler</h1>
            <p className="text-secondary-600">Hastane çalışanlarının görüşlerini yönetin ve değerlendirin</p>
            {user && (
              <p className="text-sm text-secondary-500 mt-1">
                Hoş geldiniz, {user.display_name} ({user.role.join(', ')})
              </p>
            )}
          </div>
          
          {canCreate && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <i className="bi bi-plus-lg mr-2"></i>
              Yeni Görüş
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <FeedbackFiltersComponent
        categories={categories}
        filters={filters}
        onFiltersChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Feedback List */}
      <FeedbackList
        feedbacks={feedbacks}
        loading={loading}
        error={error}
        onVote={handleVote}
        onViewDetails={(feedback) => {
          // Detay sayfasına yönlendirme veya modal açma
          console.log('View details:', feedback);
        }}
        onRespond={canRespond ? (feedbackId) => {
          // Yanıt modal'ı aç
          const response = prompt('Yanıtınızı girin:');
          if (response) {
            handleRespond(feedbackId, response);
          }
        } : undefined}
        canRespond={canRespond}
        currentUserRole={user?.role[0]}
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Yeni Görüş Oluştur"
        size="lg"
      >
        <FeedbackForm
          categories={categories}
          onSubmit={handleCreateFeedback}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={createLoading}
        />
      </Modal>
    </div>
  );
};
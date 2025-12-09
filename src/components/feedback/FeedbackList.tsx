import React, { useState } from 'react';
import { FeedbackCard } from './FeedbackCard';
import { FeedbackSuggestion } from '../../types/feedback';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

interface FeedbackListProps {
  feedbacks: FeedbackSuggestion[];
  loading: boolean;
  error: string | null;
  onVote: (feedbackId: string, voteType: 'up' | 'down') => void;
  onViewDetails: (feedback: FeedbackSuggestion) => void;
  onRespond?: (feedbackId: string) => void;
  canRespond?: boolean;
  currentUserRole?: string;
}

export const FeedbackList: React.FC<FeedbackListProps> = ({
  feedbacks,
  loading,
  error,
  onVote,
  onViewDetails,
  onRespond,
  canRespond = false,
  currentUserRole
}) => {
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackSuggestion | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleViewDetails = (feedback: FeedbackSuggestion) => {
    setSelectedFeedback(feedback);
    setIsDetailModalOpen(true);
  };

  const handleRespond = (feedbackId: string) => {
    setSelectedFeedback(feedbacks.find(f => f.id === feedbackId) || null);
    setIsRespondModalOpen(true);
    setResponseText('');
  };

  const handleSubmitResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) return;

    try {
      setIsSubmitting(true);
      // Burada response API çağrısı yapılacak
      await onRespond?.(selectedFeedback.id);
      setIsRespondModalOpen(false);
      setResponseText('');
    } catch (error) {
      console.error('Yanıt gönderme hatası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSortedFeedbacks = () => {
    return [...feedbacks].sort((a, b) => {
      // Önce kritik öncelikli olanlar
      if (a.priority === 'kritik' && b.priority !== 'kritik') return -1;
      if (b.priority === 'kritik' && a.priority !== 'kritik') return 1;

      // Sonra yüksek öncelikli olanlar
      if (a.priority === 'yüksek' && b.priority !== 'yüksek') return -1;
      if (b.priority === 'yüksek' && a.priority !== 'yüksek') return 1;

      // Sonra yeni olanlar
      if (a.status === 'yeni' && b.status !== 'yeni') return -1;
      if (b.status === 'yeni' && a.status !== 'yeni') return 1;

      // Sonra en çok oylananlar
      return (b.vote_count || 0) - (a.vote_count || 0);
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="bi bi-exclamation-triangle text-4xl text-danger-600"></i>
        </div>
        <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">Hata Oluştu</h3>
        <p className="text-secondary-600 dark:text-secondary-400">{error}</p>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="bi bi-chat-dots text-4xl text-secondary-400 dark:text-secondary-500"></i>
        </div>
        <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">Henüz Görüş Bulunamadı</h3>
        <p className="text-secondary-600 dark:text-secondary-400">İlk görüşü oluşturmak için "Yeni Görüş" butonuna tıklayın.</p>
      </div>
    );
  }

  const sortedFeedbacks = getSortedFeedbacks();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
          {feedbacks.length} Görüş
        </h2>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-secondary-500 dark:text-secondary-400">Sıralama:</span>
          <select className="text-sm bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 text-secondary-900 dark:text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>Öncelik ve Popülerlik</option>
            <option>En Yeni</option>
            <option>En Eski</option>
            <option>En Çok Oylanan</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {sortedFeedbacks.map((feedback) => (
          <FeedbackCard
            key={feedback.id}
            feedback={feedback}
            showActions={true}
            onVote={onVote}
            onViewDetails={handleViewDetails}
            onRespond={canRespond ? handleRespond : undefined}
          />
        ))}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Görüş Detayları"
        size="lg"
      >
        {selectedFeedback && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
                {selectedFeedback.title}
              </h3>
              <div className="flex items-center space-x-2 mb-4">
                <span className={`px-2 py-1 text-xs rounded-full ${selectedFeedback.status === 'yeni' ? 'bg-green-100 text-green-800' :
                    selectedFeedback.status === 'inceleniyor' ? 'bg-blue-100 text-blue-800' :
                      selectedFeedback.status === 'beklemede' ? 'bg-yellow-100 text-yellow-800' :
                        selectedFeedback.status === 'cozuldu' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                  }`}>
                  {selectedFeedback.status}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${selectedFeedback.priority === 'kritik' ? 'bg-red-100 text-red-800' :
                    selectedFeedback.priority === 'yüksek' ? 'bg-orange-100 text-orange-800' :
                      selectedFeedback.priority === 'orta' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                  }`}>
                  {selectedFeedback.priority}
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200">
                  {selectedFeedback.category?.name}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-secondary-900 dark:text-white mb-2">İçerik</h4>
              <p className="text-secondary-700 dark:text-secondary-300 whitespace-pre-wrap">
                {selectedFeedback.content}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-white mb-2">Bilgiler</h4>
                <div className="space-y-1 text-sm text-secondary-600 dark:text-secondary-400">
                  <p><span className="font-medium">Durum:</span> {selectedFeedback.status}</p>
                  <p><span className="font-medium">Öncelik:</span> {selectedFeedback.priority}</p>
                  <p><span className="font-medium">Kategori:</span> {selectedFeedback.category?.name}</p>
                  <p><span className="font-medium">Şube:</span> {selectedFeedback.facility?.name}</p>
                  <p><span className="font-medium">Oluşturulma:</span> {new Date(selectedFeedback.created_at).toLocaleString('tr-TR')}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-secondary-900 dark:text-white mb-2">İstatistikler</h4>
                <div className="space-y-1 text-sm text-secondary-600 dark:text-secondary-400">
                  <p><span className="font-medium">Oy Sayısı:</span> {selectedFeedback.vote_count || 0}</p>
                  <p><span className="font-medium">Görüntülenme:</span> {selectedFeedback.view_count}</p>
                  <p><span className="font-medium">Yanıt Sayısı:</span> {selectedFeedback.responses?.length || 0}</p>
                </div>
              </div>
            </div>

            {selectedFeedback.responses && selectedFeedback.responses.length > 0 && (
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-white mb-2">Yanıtlar</h4>
                <div className="space-y-3">
                  {selectedFeedback.responses.map((response) => (
                    <div key={response.id} className="bg-secondary-50 dark:bg-secondary-700/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-secondary-900 dark:text-white">
                          {response.responder?.display_name || 'Sistem'}
                        </span>
                        <span className="text-xs text-secondary-500 dark:text-secondary-400">
                          {new Date(response.created_at).toLocaleString('tr-TR')}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-700 dark:text-secondary-300">
                        {response.response}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-secondary-200 dark:border-secondary-700">
              {canRespond && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setIsRespondModalOpen(true);
                  }}
                >
                  Yanıtla
                </Button>
              )}
              <Button onClick={() => setIsDetailModalOpen(false)}>
                Kapat
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Respond Modal */}
      <Modal
        isOpen={isRespondModalOpen}
        onClose={() => setIsRespondModalOpen(false)}
        title="Yanıt Gönder"
        size="md"
      >
        {selectedFeedback && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-secondary-900 dark:text-white mb-2">
                {selectedFeedback.title}
              </h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">
                {selectedFeedback.content}
              </p>
            </div>

            <div>
              <label htmlFor="response" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Yanıtınız
              </label>
              <textarea
                id="response"
                rows={4}
                className="w-full px-3 py-2 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-lg text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-secondary-400"
                placeholder="Yanıtınızı buraya yazın..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-secondary-200 dark:border-secondary-700">
              <Button
                variant="outline"
                onClick={() => setIsRespondModalOpen(false)}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button
                onClick={handleSubmitResponse}
                disabled={isSubmitting || !responseText.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gönderiliyor...
                  </>
                ) : (
                  'Gönder'
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
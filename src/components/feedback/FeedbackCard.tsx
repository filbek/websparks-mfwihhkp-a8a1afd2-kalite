import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FeedbackSuggestion } from '../../types/feedback';

interface FeedbackCardProps {
  feedback: FeedbackSuggestion;
  showActions?: boolean;
  onVote?: (feedbackId: string, voteType: 'up' | 'down') => void;
  onViewDetails?: (feedback: FeedbackSuggestion) => void;
  onRespond?: (feedbackId: string) => void;
  compact?: boolean;
  currentUserVote?: 'up' | 'down' | null;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  feedback,
  showActions = true,
  onVote,
  onViewDetails,
  onRespond,
  compact = false,
  currentUserVote = null
}) => {
  const [localVote, setLocalVote] = useState<'up' | 'down' | null>(currentUserVote);
  const [voteCount, setVoteCount] = useState(feedback.vote_count || 0);

  const handleVote = (voteType: 'up' | 'down') => {
    if (onVote) {
      onVote(feedback.id, voteType);
      
      // Local state güncelleme
      if (localVote === voteType) {
        // Aynı oyu kaldır
        setLocalVote(null);
        setVoteCount(voteType === 'up' ? voteCount - 1 : voteCount + 1);
      } else if (localVote) {
        // Farklı oyu değiştir
        setLocalVote(voteType);
        setVoteCount(voteType === 'up' ? voteCount + 2 : voteCount - 2);
      } else {
        // Yeni oy ekle
        setLocalVote(voteType);
        setVoteCount(voteType === 'up' ? voteCount + 1 : voteCount - 1);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'yeni': return 'bg-green-100 text-green-800';
      case 'inceleniyor': return 'bg-blue-100 text-blue-800';
      case 'beklemede': return 'bg-yellow-100 text-yellow-800';
      case 'cozuldu': return 'bg-gray-100 text-gray-800';
      case 'kapatildi': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'düşük': return 'bg-gray-100 text-gray-800';
      case 'orta': return 'bg-blue-100 text-blue-800';
      case 'yüksek': return 'bg-orange-100 text-orange-800';
      case 'kritik': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (compact) {
    return (
      <div className="p-4 bg-white rounded-lg border border-secondary-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails?.(feedback)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-sm font-medium text-secondary-900 truncate">{feedback.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(feedback.status)}`}>
                {feedback.status}
              </span>
            </div>
            <p className="text-xs text-secondary-600 line-clamp-2 mb-2">{feedback.content}</p>
            <div className="flex items-center space-x-4 text-xs text-secondary-500">
              <span>{feedback.category?.name}</span>
              <span>{formatDate(feedback.created_at)}</span>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-1 ml-4">
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium">{voteCount}</span>
              <span className="text-xs text-secondary-500">oy</span>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote('up');
                }}
                className={`p-1 rounded ${localVote === 'up' ? 'bg-primary-100 text-primary-600' : 'text-secondary-400 hover:text-secondary-600'}`}
              >
                <i className="bi bi-hand-thumbs-up-fill text-sm"></i>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote('down');
                }}
                className={`p-1 rounded ${localVote === 'down' ? 'bg-danger-100 text-danger-600' : 'text-secondary-400 hover:text-secondary-600'}`}
              >
                <i className="bi bi-hand-thumbs-down-fill text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="flex-shrink-0">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              feedback.priority === 'kritik' ? 'bg-red-500' :
              feedback.priority === 'yüksek' ? 'bg-orange-500' :
              feedback.priority === 'orta' ? 'bg-blue-500' : 'bg-gray-500'
            }`}></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-medium text-secondary-900 truncate">{feedback.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(feedback.status)}`}>
                {feedback.status}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(feedback.priority)}`}>
                {feedback.priority}
              </span>
            </div>
            
            <p className="text-sm text-secondary-600 line-clamp-3 mb-3">{feedback.content}</p>
            
            <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-secondary-500">
              <span className="flex items-center">
                <i className="bi bi-tag mr-1"></i>
                {feedback.category?.name}
              </span>
              <span className="flex items-center">
                <i className="bi bi-person mr-1"></i>
                {feedback.is_anonymous ? 'Anonim' : feedback.reporter?.display_name || 'Bilinmeyen'}
              </span>
              <span className="flex items-center">
                <i className="bi bi-building mr-1"></i>
                {feedback.facility?.name || 'Bilinmeyen Şube'}
              </span>
              <span className="flex items-center">
                <i className="bi bi-clock mr-1"></i>
                {formatDate(feedback.created_at)}
              </span>
              {feedback.view_count > 0 && (
                <span className="flex items-center">
                  <i className="bi bi-eye mr-1"></i>
                  {feedback.view_count} görüntülenme
                </span>
              )}
            </div>
            
            {feedback.tags && feedback.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {feedback.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            {feedback.responses && feedback.responses.length > 0 && (
              <div className="mb-3">
                <div className="text-xs text-secondary-500 mb-1">
                  {feedback.responses.length} yanıt
                </div>
                <div className="bg-secondary-50 p-2 rounded text-xs text-secondary-700">
                  {feedback.responses[0].response.substring(0, 100)}
                  {feedback.responses[0].response.length > 100 ? '...' : ''}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="flex flex-col items-center space-y-2 ml-4">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleVote('up')}
                className={`p-2 rounded-lg transition-colors ${
                  localVote === 'up' 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
                title="Beğen"
              >
                <i className="bi bi-hand-thumbs-up-fill"></i>
              </button>
              <span className="text-sm font-medium w-6 text-center">{voteCount}</span>
              <button
                onClick={() => handleVote('down')}
                className={`p-2 rounded-lg transition-colors ${
                  localVote === 'down' 
                    ? 'bg-danger-100 text-danger-600' 
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
                title="Beğenme"
              >
                <i className="bi bi-hand-thumbs-down-fill"></i>
              </button>
            </div>
            
            <div className="flex flex-col space-y-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails?.(feedback)}
                className="text-xs"
              >
                Detaylar
              </Button>
              
              {onRespond && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRespond(feedback.id)}
                  className="text-xs"
                >
                  Yanıtla
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
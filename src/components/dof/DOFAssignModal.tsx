import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { User } from '../../types';

interface DOFAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userId: string, notes: string, ccUserIds?: string[]) => Promise<void>;
  users: User[];
  currentAssigneeId?: string | null;
  currentCcUserIds?: string[];
  loading?: boolean;
}

export const DOFAssignModal: React.FC<DOFAssignModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  users,
  currentAssigneeId,
  currentCcUserIds = [],
  loading = false
}) => {
  const [selectedUserId, setSelectedUserId] = useState(currentAssigneeId || '');
  const [assigneeSearchTerm, setAssigneeSearchTerm] = useState('');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [selectedCcUserIds, setSelectedCcUserIds] = useState<string[]>(currentCcUserIds);
  const [ccSearchTerm, setCcSearchTerm] = useState('');
  const [showCcDropdown, setShowCcDropdown] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const selectAssignee = (user: User) => {
    setSelectedUserId(user.id);
    setAssigneeSearchTerm('');
    setShowAssigneeDropdown(false);
  };

  const clearAssignee = () => {
    setSelectedUserId('');
    setAssigneeSearchTerm('');
  };

  const getSelectedAssignee = () => {
    return users.find(user => user.id === selectedUserId);
  };

  const filteredAssignees = users
    .filter(user => {
      if (!assigneeSearchTerm) return false;
      const searchLower = assigneeSearchTerm.toLowerCase();
      return (
        user.display_name.toLowerCase().includes(searchLower) ||
        (user.department_name && user.department_name.toLowerCase().includes(searchLower))
      );
    })
    .slice(0, 10);

  const addCcUser = (user: User) => {
    if (!selectedCcUserIds.includes(user.id)) {
      setSelectedCcUserIds(prev => [...prev, user.id]);
    }
    setCcSearchTerm('');
    setShowCcDropdown(false);
  };

  const removeCcUser = (userId: string) => {
    setSelectedCcUserIds(prev => prev.filter(id => id !== userId));
  };

  const filteredCcUsers = users
    .filter(user => user.id !== selectedUserId)
    .filter(user => !selectedCcUserIds.includes(user.id))
    .filter(user => {
      if (!ccSearchTerm) return false;
      const searchLower = ccSearchTerm.toLowerCase();
      return (
        user.display_name.toLowerCase().includes(searchLower) ||
        (user.department_name && user.department_name.toLowerCase().includes(searchLower))
      );
    })
    .slice(0, 10);

  const getSelectedCcUsers = () => {
    return users.filter(user => selectedCcUserIds.includes(user.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      setError('Lütfen bir kullanıcı seçin');
      return;
    }

    if (selectedCcUserIds.includes(selectedUserId)) {
      setError('Atanan kullanıcı bilgi verilecek kişiler listesinde olamaz');
      return;
    }

    try {
      await onAssign(selectedUserId, notes, selectedCcUserIds);
      setNotes('');
      setSelectedUserId('');
      setSelectedCcUserIds([]);
      setError('');
      onClose();
    } catch (err) {
      setError('Atama yapılırken bir hata oluştu');
      console.error(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="DÖF Ataması Yap">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Atanacak Kullanıcı *
          </label>

          {!selectedUserId ? (
            <div className="relative">
              <input
                type="text"
                value={assigneeSearchTerm}
                onChange={(e) => {
                  setAssigneeSearchTerm(e.target.value);
                  setShowAssigneeDropdown(true);
                }}
                onFocus={() => setShowAssigneeDropdown(true)}
                onBlur={() => setTimeout(() => setShowAssigneeDropdown(false), 200)}
                placeholder="Kullanıcı ara (ad veya bölüm)..."
                className="w-full px-3 py-2 pl-10 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm"
              />
              <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400"></i>

              {showAssigneeDropdown && assigneeSearchTerm && filteredAssignees.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-secondary-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredAssignees.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => selectAssignee(user)}
                      className="w-full text-left px-3 py-2 hover:bg-secondary-50 transition-colors border-b border-secondary-100 last:border-b-0"
                    >
                      <div className="text-sm text-secondary-900 font-medium">{user.display_name}</div>
                      {user.department_name && (
                        <div className="text-xs text-secondary-500 mt-0.5">{user.department_name}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="inline-flex items-center px-4 py-2.5 bg-primary-100 text-primary-800 rounded-lg border border-primary-200">
              <div className="flex-1">
                <div className="text-sm font-semibold">{getSelectedAssignee()?.display_name}</div>
                {getSelectedAssignee()?.department_name && (
                  <div className="text-xs text-primary-700 mt-0.5">{getSelectedAssignee()?.department_name}</div>
                )}
              </div>
              <button
                type="button"
                onClick={clearAssignee}
                className="ml-3 text-primary-700 hover:text-primary-900 transition-colors"
              >
                <i className="bi bi-x-lg text-sm"></i>
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Bilgi Verilecek Kişiler (Opsiyonel)
          </label>

          <div className="relative">
            <input
              type="text"
              value={ccSearchTerm}
              onChange={(e) => {
                setCcSearchTerm(e.target.value);
                setShowCcDropdown(true);
              }}
              onFocus={() => setShowCcDropdown(true)}
              onBlur={() => setTimeout(() => setShowCcDropdown(false), 200)}
              placeholder="Kişi ara (ad veya bölüm)..."
              className="w-full px-3 py-2 pl-10 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm"
            />
            <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400"></i>

            {showCcDropdown && ccSearchTerm && filteredCcUsers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-secondary-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCcUsers.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => addCcUser(user)}
                    className="w-full text-left px-3 py-2 hover:bg-secondary-50 transition-colors border-b border-secondary-100 last:border-b-0"
                  >
                    <div className="text-sm text-secondary-900 font-medium">{user.display_name}</div>
                    {user.department_name && (
                      <div className="text-xs text-secondary-500 mt-0.5">{user.department_name}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {getSelectedCcUsers().length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {getSelectedCcUsers().map(user => (
                <div
                  key={user.id}
                  className="inline-flex items-center px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm"
                >
                  <span className="font-medium">{user.display_name}</span>
                  {user.department_name && (
                    <span className="text-primary-600 ml-1.5 text-xs">({user.department_name})</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeCcUser(user.id)}
                    className="ml-2 text-primary-600 hover:text-primary-800 transition-colors"
                  >
                    <i className="bi bi-x-lg text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="mt-2 text-xs text-secondary-500">
            Seçilen kişiler DÖF hakkında bilgilendirilir ancak sorumlu değildir
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Notlar
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Atama ile ilgili notlar ekleyebilirsiniz..."
            rows={4}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            İptal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Atanıyor...' : 'Ata'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

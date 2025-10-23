import React from 'react';
import { DOFCard } from './DOFCard';
import { DOF } from '../../types';

interface DOFListProps {
  dofs: DOF[];
  loading: boolean;
  onEdit: (dof: DOF) => void;
  onDelete: (id: string) => void;
  onView: (dof: DOF) => void;
}

export const DOFList: React.FC<DOFListProps> = ({
  dofs,
  loading,
  onEdit,
  onDelete,
  onView
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl border border-secondary-200 p-6 animate-pulse">
            <div className="h-4 bg-secondary-200 rounded mb-3"></div>
            <div className="h-3 bg-secondary-200 rounded mb-2"></div>
            <div className="h-3 bg-secondary-200 rounded mb-4"></div>
            <div className="flex space-x-2 mb-4">
              <div className="h-6 w-16 bg-secondary-200 rounded-full"></div>
              <div className="h-6 w-20 bg-secondary-200 rounded-full"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-8 w-24 bg-secondary-200 rounded"></div>
              <div className="h-8 w-8 bg-secondary-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (dofs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="bi bi-clipboard-x text-4xl text-secondary-400"></i>
        </div>
        <h3 className="text-lg font-medium text-secondary-900 mb-2">DÖF kaydı bulunamadı</h3>
        <p className="text-secondary-600 mb-6">Henüz hiç DÖF kaydı oluşturulmamış.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dofs.map((dof) => (
        <DOFCard
          key={dof.id}
          dof={dof}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
};

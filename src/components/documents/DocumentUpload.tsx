import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { DocumentCategory } from '../../types/documents';

interface DocumentUploadProps {
  categories: DocumentCategory[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  categories,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, category_id: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Lütfen bir dosya seçin.');
      return;
    }
    
    if (!formData.title) {
      alert('Lütfen doküman başlığı girin.');
      return;
    }
    
    if (!formData.category_id) {
      alert('Lütfen bir kategori seçin.');
      return;
    }

    try {
      await onSubmit({
        ...formData,
        file: selectedFile
      });
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          label="Doküman Başlığı"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Doküman başlığını girin"
          required
        />
      </div>

      <div>
        <Textarea
          label="Açıklama"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Doküman açıklamasını girin (opsiyonel)"
          rows={3}
        />
      </div>

      <div>
        <Select
          label="Kategori"
          value={formData.category_id}
          onChange={handleSelectChange}
          options={categoryOptions}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Dosya Yükle
        </label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-secondary-300 hover:border-secondary-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
          />
          
          <div className="space-y-2">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <i className="bi bi-cloud-upload text-primary-600 text-xl"></i>
            </div>
            
            {!selectedFile ? (
              <>
                <p className="text-secondary-700">Dosyaları buraya sürükleyin</p>
                <p className="text-sm text-secondary-500">veya dosya seçmek için tıklayın</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Dosya Seç
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <i className="bi bi-file-earmark text-primary-600"></i>
                  <span className="font-medium text-secondary-900">{selectedFile.name}</span>
                </div>
                <p className="text-sm text-secondary-500">
                  {formatFileSize(selectedFile.size)}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Dosyayı Değiştir
                </Button>
              </div>
            )}
          </div>
          
          <p className="text-xs text-secondary-400 mt-4">
            PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG (Max 10MB)
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          İptal
        </Button>
        <Button
          type="submit"
          disabled={loading || !selectedFile}
          className="bg-primary-600 hover:bg-primary-700"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Yükleniyor...
            </>
          ) : (
            'Yükle'
          )}
        </Button>
      </div>
    </form>
  );
};
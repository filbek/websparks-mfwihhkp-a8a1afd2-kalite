import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { generateSecurePassword, validatePassword } from '../../utils/passwordUtils';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
  onConfirm: (newPassword: string) => Promise<void>;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  userName,
  onConfirm
}) => {
  const [password, setPassword] = useState('');
  const [useAutoGenerate, setUseAutoGenerate] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(12);
    setPassword(newPassword);
    setGeneratedPassword(newPassword);
    setValidationErrors([]);
    setShowPassword(true);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword) {
      const validation = validatePassword(newPassword);
      setValidationErrors(validation.errors);
    } else {
      setValidationErrors([]);
    }
  };

  const handleSubmit = async () => {
    if (!password) {
      setValidationErrors(['Lütfen bir şifre girin veya otomatik oluşturun']);
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setIsProcessing(true);
    try {
      await onConfirm(password);
      handleClose();
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setGeneratedPassword('');
    setValidationErrors([]);
    setUseAutoGenerate(true);
    setShowPassword(false);
    onClose();
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
    alert('Şifre panoya kopyalandı');
  };

  React.useEffect(() => {
    if (isOpen && useAutoGenerate) {
      handleGeneratePassword();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Şifre Sıfırla"
      size="md"
    >
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <i className="bi bi-exclamation-triangle text-yellow-600 text-xl mr-3 mt-0.5"></i>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">{userName}</p>
              <p className="text-yellow-700">{userEmail}</p>
              <p className="mt-2">Kullanıcının şifresi sıfırlanacaktır. Yeni şifreyi kullanıcıya güvenli bir şekilde iletmeyi unutmayın.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={useAutoGenerate}
                onChange={() => {
                  setUseAutoGenerate(true);
                  handleGeneratePassword();
                }}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm font-medium text-secondary-900">Otomatik Oluştur</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={!useAutoGenerate}
                onChange={() => {
                  setUseAutoGenerate(false);
                  setPassword('');
                  setShowPassword(false);
                }}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm font-medium text-secondary-900">Manuel Gir</span>
            </label>
          </div>

          <div>
            <div className="relative">
              <Input
                label="Yeni Şifre"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                disabled={useAutoGenerate}
                placeholder={useAutoGenerate ? 'Otomatik oluşturulacak' : 'Şifre girin'}
              />
              <div className="absolute right-2 top-9 flex space-x-1">
                {password && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 text-secondary-500 hover:text-secondary-700"
                      title={showPassword ? 'Gizle' : 'Göster'}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="p-2 text-secondary-500 hover:text-secondary-700"
                      title="Kopyala"
                    >
                      <i className="bi bi-clipboard"></i>
                    </button>
                  </>
                )}
              </div>
            </div>

            {useAutoGenerate && password && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGeneratePassword}
                className="mt-2"
              >
                <i className="bi bi-arrow-clockwise mr-2"></i>
                Yeni Şifre Oluştur
              </Button>
            )}

            <div className="mt-2 text-xs text-secondary-600">
              <p>Şifre gereksinimleri:</p>
              <ul className="list-disc ml-5 mt-1 space-y-0.5">
                <li>En az 8 karakter</li>
                <li>En az bir büyük harf</li>
                <li>En az bir küçük harf</li>
                <li>En az bir rakam</li>
                <li>En az bir özel karakter</li>
              </ul>
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-800 mb-1">Şifre gereksinimleri karşılanmıyor:</p>
              <ul className="text-sm text-red-700 space-y-0.5">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            İptal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing || !password || validationErrors.length > 0}
            className="bg-warning-600 hover:bg-warning-700"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sıfırlanıyor...
              </>
            ) : (
              <>
                <i className="bi bi-key mr-2"></i>
                Şifreyi Sıfırla
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="bi bi-hospital text-white text-3xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">
              Anadolu Hastaneleri
            </h1>
            <p className="text-secondary-600">Kalite Yönetim Sistemi</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                <div className="flex items-start">
                  <i className="bi bi-exclamation-triangle text-danger-600 mt-0.5 mr-3"></i>
                  <p className="text-sm text-danger-700">{error}</p>
                </div>
              </div>
            )}

            <div>
              <Input
                label="E-posta Adresi"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kullanici@anadoluhastaneleri.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <Input
                label="Şifre"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-secondary-200">
            <p className="text-xs text-center text-secondary-500">
              Test Kullanıcıları:
            </p>
            <div className="mt-3 space-y-2 text-xs text-secondary-600">
              <div className="bg-secondary-50 rounded p-2">
                <p><strong>Admin:</strong> bekir.filizdag@anadoluhastaneleri.com</p>
                <p className="text-secondary-500">Şifre: 232123Sbb..</p>
              </div>
              <div className="bg-secondary-50 rounded p-2">
                <p><strong>Silivri Şube:</strong> bilge.batur@anadoluhastaneleri.com</p>
                <p className="text-secondary-500">Şifre: 232123Bbb..</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-secondary-600">
            © 2025 Anadolu Hastaneleri. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
};

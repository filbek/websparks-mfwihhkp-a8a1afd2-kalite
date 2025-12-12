import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { getOrganizationBySlug, Organization } from '../lib/organizationApi';
import { supabase } from '../lib/supabase';

export const Login: React.FC = () => {
  const { login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [org, setOrg] = useState<Organization | null>(null);
  const [checkingOrg, setCheckingOrg] = useState(true);

  useEffect(() => {
    const checkOrg = async () => {
      try {
        const hostname = window.location.hostname;
        let slug = 'anadolu'; // Varsayılan (localhost için)

        // Subdomain kontrolü
        if (hostname.includes('intrasoft.io')) {
          const parts = hostname.split('.');
          if (parts.length > 2) {
            slug = parts[0];
            // Temp Fix: Database slug might be different
            if (slug === 'oztan') slug = 'oztanhastanesi';
          }
        }

        console.log('Detected slug:', slug);
        const organization = await getOrganizationBySlug(slug);

        if (organization) {
          setOrg(organization);
          // Dinamik sayfa başlığı
          document.title = `${organization.name} - İntranet Sistemi`;
        } else {
          setError('Organizasyon bulunamadı. Lütfen doğru adresten girdiğinize emin olun.');
        }
      } catch (err) {
        console.error('Error fetching org:', err);
        setError('Sistem hatası oluştu.');
      } finally {
        setCheckingOrg(false);
      }
    };

    checkOrg();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;

    setError('');
    setLoading(true);

    try {
      await login(email, password);

      // Login başarılı, şimdi organizasyon kontrolü yapalım
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('organization_id, role')
          .eq('id', user.id)
          .single();

        // System Admin her yere girebilir
        if (profile?.role.includes('system_admin')) {
          // İzin ver, bypass et
        } else if (profile?.organization_id !== org.id) {
          await logout();
          throw new Error(`Bu hesaba sadece ${org.name} sistemi üzerinden erişilebilir.`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (checkingOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <i className="bi bi-exclamation-circle text-4xl text-danger-500 mb-4 block"></i>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Organizasyon Bulunamadı</h1>
          <p className="text-gray-600">"{window.location.hostname}" adresi için kayıtlı bir organizasyon bulunamadı.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-950 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl p-8 transition-colors">
          <div className="text-center mb-8">
            {org.logo_url ? (
              <div className="flex justify-center mb-6">
                <img
                  src={org.logo_url}
                  alt={org.name}
                  className="max-h-40 w-auto object-contain transition-all duration-300"
                />
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="bi bi-hospital text-white text-4xl"></i>
                </div>
                <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
                  {org.name}
                </h1>
                <p className="text-secondary-600 dark:text-secondary-400">Kalite Yönetim Sistemi</p>
              </div>
            )}
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
                placeholder="ornek@hastane.com"
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
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-secondary-600 dark:text-secondary-500">
            © {new Date().getFullYear()} {org.name}. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
};

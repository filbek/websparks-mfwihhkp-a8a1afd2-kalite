import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, DOF } from '../types';
import { supabase, setSupabaseContext } from '../lib/supabase';
import { Organization, getCurrentOrganization, setOrganizationContext } from '../lib/organizationApi';

interface AuthContextType {
  user: User | null;
  currentOrganization: Organization | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  canAccessFacility: (facilityId: number) => boolean;
  canEditDOF: (dof: DOF) => boolean;
  setUser: (user: User | null) => void;
}

// Permissionler
const PERMISSIONS = {
  // Feedback permissions
  'feedback:create': ['personel', 'sube_kalite', 'merkez_kalite', 'admin'],
  'feedback:view_all': ['sube_kalite', 'merkez_kalite', 'admin'],
  'feedback:respond': ['sube_kalite', 'merkez_kalite', 'admin'],
  'feedback:manage_categories': ['merkez_kalite', 'admin'],

  // Document permissions
  'document:create': ['personel', 'sube_kalite', 'merkez_kalite', 'admin'],
  'document:view_all': ['sube_kalite', 'merkez_kalite', 'admin'],
  'document:manage_all': ['merkez_kalite', 'admin'],

  // DOF permissions
  'dof:create': ['personel', 'sube_kalite', 'merkez_kalite', 'admin'],
  'dof:assign': ['sube_kalite', 'merkez_kalite', 'admin'],
  'dof:manage_all': ['merkez_kalite', 'admin'],
  'dof:edit_opened': ['sube_kalite', 'merkez_kalite', 'admin'],

  // Event permissions
  'event:create': ['personel', 'sube_kalite', 'merkez_kalite', 'admin'],
  'event:manage_all': ['sube_kalite', 'merkez_kalite', 'admin'],

  // Admin permissions
  'admin:users': ['admin'],
  'admin:facilities': ['admin'],
  'admin:system': ['admin'],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) throw error;

          if (userData) {
            const user = userData as User;
            setUser(user);
            await setSupabaseContext(user.id, user.role, user.facility_id);

            // Load organization
            try {
              const org = await getCurrentOrganization();
              setCurrentOrganization(org);
              if (org) {
                await setOrganizationContext(org.id);
              }
            } catch (err) {
              console.error('Error loading organization:', err);
            }
          } else {
            setUser(null);
            setCurrentOrganization(null);
          }
        } else {
          setUser(null);
          setCurrentOrganization(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (userData) {
            const user = userData as User;
            setUser(user);
            await setSupabaseContext(user.id, user.role, user.facility_id);

            // Load organization
            const org = await getCurrentOrganization();
            setCurrentOrganization(org);
            if (org) {
              await setOrganizationContext(org.id);
            }
          }
        } else {
          setUser(null);
        }
      })();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (userError) throw userError;

        if (userData) {
          const user = userData as User;
          setUser(user);
          await setSupabaseContext(user.id, user.role, user.facility_id);

          // Load organization
          const org = await getCurrentOrganization();
          setCurrentOrganization(org);
          if (org) {
            await setOrganizationContext(org.id);
          }
        } else {
          throw new Error('Kullanıcı profili bulunamadı');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    const allowedRoles = PERMISSIONS[permission as keyof typeof PERMISSIONS] || [];
    return user.role.some(role => allowedRoles.includes(role));
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role.includes(role as UserRole);
  };

  const canAccessFacility = (facilityId: number): boolean => {
    if (!user) return false;

    // Admin ve merkez kalite tüm şubelere erişebilir
    if (user.role.includes('admin') || user.role.includes('merkez_kalite')) {
      return true;
    }

    // Şube kalite ve personel sadece kendi şubesine erişebilir
    return user.facility_id === facilityId;
  };

  const canEditDOF = (dof: DOF): boolean => {
    if (!user) return false;

    // Kapatılmış veya iptal edilmiş DÖF'ler düzenlenemez
    if (dof.status === 'kapatıldı' || dof.status === 'iptal') {
      return false;
    }

    // Admin: Tüm DÖF'leri düzenleyebilir
    if (user.role.includes('admin')) {
      return true;
    }

    // Merkez Kalite: Tüm DÖF'leri düzenleyebilir
    if (user.role.includes('merkez_kalite')) {
      return true;
    }

    // Şube Kalite: Kendi şubesindeki tüm DÖF'leri düzenleyebilir
    if (user.role.includes('sube_kalite') && dof.facility_id === user.facility_id) {
      return true;
    }

    // Personel: Sadece taslak ve reddedilmiş DÖF'leri düzenleyebilir
    if (dof.status === 'taslak' || dof.status === 'reddedildi') {
      return dof.reporter_id === user.id || dof.assigned_to === user.id;
    }

    return false;
  };

  const value: AuthContextType = {
    user,
    currentOrganization,
    loading,
    login,
    logout,
    hasPermission,
    hasRole,
    canAccessFacility,
    canEditDOF,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Kullanıcı rolü bazlı component wrapper'ı
export const withAuth = (Component: React.ComponentType<any>, requiredPermissions?: string[]) => {
  return function AuthenticatedComponent(props: any) {
    const { hasPermission, user } = useAuth();

    if (!user) {
      return <div>Yükleniyor...</div>;
    }

    if (requiredPermissions && !requiredPermissions.every(permission => hasPermission(permission))) {
      return <div>Bu sayfaya erişim yetkiniz yok.</div>;
    }

    return <Component {...props} />;
  };
};
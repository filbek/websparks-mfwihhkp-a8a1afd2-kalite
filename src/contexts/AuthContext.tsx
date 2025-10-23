import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  canAccessFacility: (facilityId: number) => boolean;
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
  const [loading, setLoading] = useState(true);

  // Simulate authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Gerçek uygulamada burada Supabase auth kullanılacak
        // Şimdilik simüle edilmiş kullanıcı (Admin)
        const mockUser: User = {
          id: 'bekir-filizdag-id',
          email: 'bekir.filizdag@anadoluhastaneleri.com',
          display_name: 'Bekir Filizdağ',
          role: ['admin'],
          facility_id: 1,
          department_id: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Local storage'dan kullanıcı bilgisini al
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Varsayılan kullanıcıyı set et
          setUser(mockUser);
          localStorage.setItem('auth_user', JSON.stringify(mockUser));
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Gerçek uygulamada burada Supabase auth.login kullanılacak
      // Şimdilik simüle edilmiş login
      let mockUser: User | null = null;
      
      if (email === 'bekir.filizdag@anadoluhastaneleri.com') {
        mockUser = {
          id: 'bekir-filizdag-id',
          email: 'bekir.filizdag@anadoluhastaneleri.com',
          display_name: 'Bekir Filizdağ',
          role: ['admin'],
          facility_id: 1,
          department_id: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else if (email === 'mehmet.yilmaz@anadoluhastaneleri.com') {
        mockUser = {
          id: 'dr-mehmet-yilmaz-id',
          email: 'mehmet.yilmaz@anadoluhastaneleri.com',
          display_name: 'Dr. Mehmet Yılmaz',
          role: ['merkez_kalite'],
          facility_id: 1,
          department_id: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else if (email === 'bilgehan.batur@anadoluhastaneleri.com') {
        mockUser = {
          id: 'bilgehan-batur-id',
          email: 'bilgehan.batur@anadoluhastaneleri.com',
          display_name: 'Bilgehan BATUR',
          role: ['sube_kalite'],
          facility_id: 2,
          department_id: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else if (email === 'fatma.yilmaz@anadoluhastaneleri.com') {
        mockUser = {
          id: 'fatma-yilmaz-id',
          email: 'fatma.yilmaz@anadoluhastaneleri.com',
          display_name: 'Fatma Yılmaz',
          role: ['sube_kalite'],
          facility_id: 3,
          department_id: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else if (email === 'zuhal.aktas@anadoluhastaneleri.com') {
        mockUser = {
          id: 'zuhal-aktas-id',
          email: 'zuhal.aktas@anadoluhastaneleri.com',
          display_name: 'Zuhal Aktaş',
          role: ['sube_kalite'],
          facility_id: 4,
          department_id: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      
      if (mockUser) {
        setUser(mockUser);
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
      } else {
        throw new Error('Kullanıcı bulunamadı');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
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

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    hasRole,
    canAccessFacility,
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
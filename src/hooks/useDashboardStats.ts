import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface DashboardStats {
    totalActiveDofs: number;
    totalActiveEvents: number;
    completedThisMonth: number;
    overdueItems: number;
    loading: boolean;
    error: string | null;
}

export interface FacilityStats {
    facilityId: number;
    facilityName: string;
    activeDofs: number;
    activeEvents: number;
    completedThisMonth: number;
    status: 'normal' | 'warning' | 'critical';
}

export interface Activity {
    id: string;
    type: 'dof' | 'event';
    title: string;
    facility: string;
    status: string;
    created_at: string;
    priority?: string;
}

export const useDashboardStats = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalActiveDofs: 0,
        totalActiveEvents: 0,
        completedThisMonth: 0,
        overdueItems: 0,
        loading: true,
        error: null
    });
    const [facilityStats, setFacilityStats] = useState<FacilityStats[]>([]);
    const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

    const isAdmin = user?.role.includes('admin') || false;
    const isCentralQuality = user?.role.includes('merkez_kalite') || false;
    const canSeeAllFacilities = isAdmin || isCentralQuality;

    useEffect(() => {
        if (!user) return;

        const fetchStats = async () => {
            try {
                setStats(prev => ({ ...prev, loading: true, error: null }));

                // Facility filter based on user role
                const facilityFilter = canSeeAllFacilities
                    ? {}
                    : { facility_id: user.facility_id };

                // Get active DOFs count
                const { count: activeDofs, error: dofsError } = await supabase
                    .from('dofs')
                    .select('*', { count: 'exact', head: true })
                    .match(facilityFilter)
                    .in('status', ['atanan', 'çözüm_bekleyen', 'kapatma_onayında', 'atanmayı_bekleyen']);

                if (dofsError) throw dofsError;

                // Get active Events count
                const { count: activeEvents, error: eventsError } = await supabase
                    .from('events')
                    .select('*', { count: 'exact', head: true })
                    .match(facilityFilter)
                    .in('status', ['taslak', 'atanmayi_bekleyen', 'atanan', 'cozum_bekleyen', 'kapatma_onayinda']);

                if (eventsError) throw eventsError;

                // Get completed this month (DOFs + Events)
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);

                const { count: completedDofs, error: completedDofsError } = await supabase
                    .from('dofs')
                    .select('*', { count: 'exact', head: true })
                    .match(facilityFilter)
                    .eq('status', 'kapatıldı')
                    .gte('updated_at', startOfMonth.toISOString());

                if (completedDofsError) throw completedDofsError;

                const { count: completedEvents, error: completedEventsError } = await supabase
                    .from('events')
                    .select('*', { count: 'exact', head: true })
                    .match(facilityFilter)
                    .eq('status', 'kapatildi')
                    .gte('updated_at', startOfMonth.toISOString());

                if (completedEventsError) throw completedEventsError;

                // Get overdue items (items older than 30 days and still active)
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const { count: overdueDofs, error: overdueDofsError } = await supabase
                    .from('dofs')
                    .select('*', { count: 'exact', head: true })
                    .match(facilityFilter)
                    .in('status', ['atanan', 'çözüm_bekleyen', 'atanmayı_bekleyen'])
                    .lt('created_at', thirtyDaysAgo.toISOString());

                if (overdueDofsError) throw overdueDofsError;

                const { count: overdueEvents, error: overdueEventsError } = await supabase
                    .from('events')
                    .select('*', { count: 'exact', head: true })
                    .match(facilityFilter)
                    .in('status', ['atanmayi_bekleyen', 'atanan', 'cozum_bekleyen'])
                    .lt('created_at', thirtyDaysAgo.toISOString());

                if (overdueEventsError) throw overdueEventsError;

                setStats({
                    totalActiveDofs: activeDofs || 0,
                    totalActiveEvents: activeEvents || 0,
                    completedThisMonth: (completedDofs || 0) + (completedEvents || 0),
                    overdueItems: (overdueDofs || 0) + (overdueEvents || 0),
                    loading: false,
                    error: null
                });

                // Fetch Recent Activities
                // Fetch latest 5 DOFs
                const { data: latestDofs, error: latestDofsError } = await supabase
                    .from('dofs')
                    .select(`
                        id,
                        title,
                        status,
                        created_at,
                        priority,
                        facility_id,
                        facilities (name)
                    `)
                    .match(facilityFilter)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (latestDofsError) throw latestDofsError;

                // Fetch latest 5 Events
                const { data: latestEvents, error: latestEventsError } = await supabase
                    .from('events')
                    .select(`
                        id,
                        event_type,
                        status,
                        created_at,
                        facility_id,
                        facilities (name)
                    `)
                    .match(facilityFilter)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (latestEventsError) throw latestEventsError;

                const formattedDofs: Activity[] = (latestDofs || []).map(d => {
                    const facilities = d.facilities as any;
                    const facilityName = Array.isArray(facilities) && facilities.length > 0 ? facilities[0].name : (facilities?.name || 'Bilinmeyen Şube');

                    return {
                        id: `dof-${d.id}`,
                        type: 'dof',
                        title: d.title,
                        facility: facilityName,
                        status: d.status,
                        created_at: d.created_at,
                        priority: d.priority
                    };
                });

                const formattedEvents: Activity[] = (latestEvents || []).map(e => {
                    const facilities = e.facilities as any;
                    const facilityName = Array.isArray(facilities) && facilities.length > 0 ? facilities[0].name : (facilities?.name || 'Bilinmeyen Şube');

                    return {
                        id: `event-${e.id}`,
                        type: 'event',
                        title: e.event_type,
                        facility: facilityName,
                        status: e.status,
                        created_at: e.created_at,
                        priority: 'orta'
                    };
                });

                const allActivities = [...formattedDofs, ...formattedEvents]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5);

                setRecentActivities(allActivities);


                // Fetch facility-specific stats if user can see all facilities
                if (canSeeAllFacilities) {
                    await fetchFacilityStats();
                }
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
                setStats(prev => ({
                    ...prev,
                    loading: false,
                    error: err instanceof Error ? err.message : 'İstatistikler yüklenirken hata oluştu'
                }));
            }
        };

        const fetchFacilityStats = async () => {
            try {
                // Get all facilities
                const { data: facilities, error: facilitiesError } = await supabase
                    .from('facilities')
                    .select('id, name')
                    .order('name');

                if (facilitiesError) throw facilitiesError;

                const facilityStatsData: FacilityStats[] = await Promise.all(
                    (facilities || []).map(async (facility) => {
                        // Get DOF count for this facility
                        const { count: dofCount } = await supabase
                            .from('dofs')
                            .select('*', { count: 'exact', head: true })
                            .eq('facility_id', facility.id)
                            .in('status', ['atanan', 'çözüm_bekleyen', 'kapatma_onayında', 'atanmayı_bekleyen']);

                        // Get Event count for this facility
                        const { count: eventCount } = await supabase
                            .from('events')
                            .select('*', { count: 'exact', head: true })
                            .eq('facility_id', facility.id)
                            .in('status', ['taslak', 'atanmayi_bekleyen', 'atanan', 'cozum_bekleyen', 'kapatma_onayinda']);

                        // Get completed this month
                        const startOfMonth = new Date();
                        startOfMonth.setDate(1);
                        startOfMonth.setHours(0, 0, 0, 0);

                        const { count: completedDofs } = await supabase
                            .from('dofs')
                            .select('*', { count: 'exact', head: true })
                            .eq('facility_id', facility.id)
                            .eq('status', 'kapatıldı')
                            .gte('updated_at', startOfMonth.toISOString());

                        const { count: completedEvents } = await supabase
                            .from('events')
                            .select('*', { count: 'exact', head: true })
                            .eq('facility_id', facility.id)
                            .eq('status', 'kapatildi')
                            .gte('updated_at', startOfMonth.toISOString());

                        const totalActive = (dofCount || 0) + (eventCount || 0);
                        const status: 'normal' | 'warning' | 'critical' =
                            totalActive > 30 ? 'critical' :
                                totalActive > 15 ? 'warning' :
                                    'normal';

                        return {
                            facilityId: facility.id,
                            facilityName: facility.name,
                            activeDofs: dofCount || 0,
                            activeEvents: eventCount || 0,
                            completedThisMonth: (completedDofs || 0) + (completedEvents || 0),
                            status
                        };
                    })
                );

                setFacilityStats(facilityStatsData);
            } catch (err) {
                console.error('Error fetching facility stats:', err);
            }
        };

        fetchStats();
    }, [user, canSeeAllFacilities]);

    return {
        stats,
        facilityStats,
        recentActivities,
        canSeeAllFacilities
    };
};

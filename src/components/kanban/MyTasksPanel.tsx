import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Calendar, Search } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { User } from '../../types';
import * as assignedTasksApi from '../../lib/assignedTasksApi';
import { useAuth } from '../../contexts/AuthContext';

export const MyTasksPanel: React.FC = () => {
    const { hasRole } = useAuth();
    const [tasks, setTasks] = useState<assignedTasksApi.AssignedTask[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const isAdmin = hasRole('admin') || hasRole('merkez_kalite');

    useEffect(() => {
        loadTasks();
        if (isAdmin) {
            loadUsers();
        }
    }, [isAdmin]);

    const loadTasks = async () => {
        try {
            setLoading(true);
            if (isAdmin) {
                const data = await assignedTasksApi.fetchAllAssignedTasks();
                setTasks(data);
            } else {
                const data = await assignedTasksApi.fetchMyAssignedTasks();
                setTasks(data);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await assignedTasksApi.fetchAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const handleSearch = async () => {
        if (!isAdmin) return;

        try {
            setLoading(true);
            const data = await assignedTasksApi.fetchAllAssignedTasks({
                searchQuery: searchQuery || undefined,
                assignedTo: selectedUser || undefined,
            });
            setTasks(data);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {isAdmin && (
                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <Input
                            placeholder="Görev ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="w-64">
                        <Select
                            value={selectedUser}
                            onChange={(e) => {
                                setSelectedUser(e.target.value);
                            }}
                            options={[
                                { value: '', label: 'Tüm Kullanıcılar' },
                                ...users.map(u => ({ value: u.id, label: u.display_name })),
                            ]}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </div>
            )}

            {tasks.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">
                        {isAdmin ? 'Henüz atanmış görev yok' : 'Size atanmış görev bulunmuyor'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {tasks.map(task => (
                        <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                                    {task.description && (
                                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center">
                                            <span className="font-medium mr-1">Pano:</span>
                                            {task.board_title}
                                        </span>
                                        <span className="flex items-center">
                                            <span className="font-medium mr-1">Liste:</span>
                                            {task.list_title}
                                        </span>
                                    </div>
                                </div>
                                {task.due_date && (
                                    <div className="flex items-center text-xs text-gray-500 ml-4">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        <span>{new Date(task.due_date).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

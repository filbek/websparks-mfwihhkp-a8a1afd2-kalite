import React from 'react';
import { useSurveys } from '../../hooks/useSurveys';
import { Survey } from '../../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button } from '../ui/Button';

interface SurveyListProps {
    onEdit: (survey: Survey) => void;
    onCreate: () => void;
    onAnswer?: (surveyId: string) => void;
}

export const SurveyList: React.FC<SurveyListProps> = ({ onEdit, onCreate, onAnswer }) => {
    const { surveys, loading, deleteSurvey, updateSurvey } = useSurveys();

    if (loading) return <div>Yükleniyor...</div>;

    const handlePublish = async (survey: Survey) => {
        if (confirm('Bu anketi yayınlamak istediğinize emin misiniz?')) {
            await updateSurvey(survey.id, { status: 'published' });
        }
    };

    const handleClose = async (survey: Survey) => {
        if (confirm('Bu anketi sonlandırmak istediğinize emin misiniz?')) {
            await updateSurvey(survey.id, { status: 'closed' });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu anketi silmek istediğinize emin misiniz?')) {
            await deleteSurvey(id);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Anketler</h2>
                <Button onClick={onCreate}>
                    <i className="bi bi-plus-lg mr-2"></i>
                    Yeni Anket
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oluşturulma Tarihi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {surveys.map((survey) => (
                            <tr key={survey.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{survey.title}</div>
                                    <div className="text-sm text-gray-500">{survey.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${survey.status === 'published' ? 'bg-green-100 text-green-800' :
                                            survey.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'}`}>
                                        {survey.status === 'published' ? 'Yayında' :
                                            survey.status === 'closed' ? 'Kapalı' : 'Taslak'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {format(new Date(survey.created_at), 'd MMMM yyyy', { locale: tr })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {survey.status === 'published' && onAnswer && (
                                        <button onClick={() => onAnswer(survey.id)} className="text-blue-600 hover:text-blue-900">
                                            <i className="bi bi-pencil-fill mr-1"></i> Cevapla
                                        </button>
                                    )}

                                    <button onClick={() => onEdit(survey)} className="text-indigo-600 hover:text-indigo-900">
                                        <i className="bi bi-pencil-square mr-1"></i> Düzenle
                                    </button>
                                    {survey.status === 'draft' && (
                                        <button onClick={() => handlePublish(survey)} className="text-green-600 hover:text-green-900">
                                            <i className="bi bi-send mr-1"></i> Yayınla
                                        </button>
                                    )}
                                    {survey.status === 'published' && (
                                        <button onClick={() => handleClose(survey)} className="text-gray-600 hover:text-gray-900">
                                            <i className="bi bi-stop-circle mr-1"></i> Sonlandır
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(survey.id)} className="text-red-600 hover:text-red-900">
                                        <i className="bi bi-trash mr-1"></i> Sil
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {surveys.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Henüz anket oluşturulmamış.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

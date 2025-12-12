import React, { useState } from 'react';
import { SurveyList } from '../components/surveys/SurveyList';
import { SurveyBuilder } from '../components/surveys/SurveyBuilder';
import { SurveyResponse } from '../components/surveys/SurveyResponse';
import { Button } from '../components/ui/Button';
import { Survey } from '../types';

export const Surveys: React.FC = () => {
    const [view, setView] = useState<'list' | 'builder' | 'responding'>('list');
    const [editingSurvey, setEditingSurvey] = useState<Survey | undefined>(undefined);
    const [answeringSurveyId, setAnsweringSurveyId] = useState<string | undefined>(undefined);

    const handleCreate = () => {
        setEditingSurvey(undefined);
        setView('builder');
    };

    const handleEdit = (survey: Survey) => {
        setEditingSurvey(survey);
        setView('builder');
    };

    const handleAnswer = (surveyId: string) => {
        setAnsweringSurveyId(surveyId);
        setView('responding');
    }

    const handleSave = () => {
        setView('list');
        setEditingSurvey(undefined);
    };

    const handleCancel = () => {
        setView('list');
        setEditingSurvey(undefined);
        setAnsweringSurveyId(undefined);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    {view === 'list' ? 'Anket Yönetimi' :
                        view === 'responding' ? 'Anket Cevapla' :
                            editingSurvey ? 'Anket Düzenle' : 'Yeni Anket'}
                </h1>
                {view !== 'list' && (
                    <Button variant="secondary" onClick={handleCancel}>
                        <i className="bi bi-arrow-left mr-2"></i> Listeye Dön
                    </Button>
                )}
            </div>

            {view === 'list' ? (
                <SurveyList onCreate={handleCreate} onEdit={handleEdit} onAnswer={handleAnswer} />
            ) : view === 'builder' ? (
                <SurveyBuilder
                    initialData={editingSurvey}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            ) : (
                answeringSurveyId && <SurveyResponse surveyId={answeringSurveyId} onClose={handleCancel} />
            )}
        </div>
    );
};

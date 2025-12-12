import React, { useState, useEffect } from 'react';
import { Survey, SurveyQuestion, SurveyAnswer, QuestionType } from '../../types';
import { useSurveys } from '../../hooks/useSurveys';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface SurveyResponseProps {
    surveyId: string;
    onClose: () => void;
}

export const SurveyResponse: React.FC<SurveyResponseProps> = ({ surveyId, onClose }) => {
    const { getSurveyWithQuestions } = useSurveys();
    const { user } = useAuth();
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [answers, setAnswers] = useState<Record<string, any>>({}); // question_id -> value
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const loadSurvey = async () => {
            try {
                const data = await getSurveyWithQuestions(surveyId);
                setSurvey(data);
            } catch (error) {
                console.error('Error loading survey:', error);
            } finally {
                setLoading(false);
            }
        };
        loadSurvey();
    }, [surveyId]);

    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleMultiSelectChange = (questionId: string, option: string, checked: boolean) => {
        const currentSelected = (answers[questionId] as string[]) || [];
        let newSelected;
        if (checked) {
            newSelected = [...currentSelected, option];
        } else {
            newSelected = currentSelected.filter(item => item !== option);
        }
        setAnswers(prev => ({ ...prev, [questionId]: newSelected }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!survey || !user) return;

        // Validation check
        if (survey.questions) {
            for (const q of survey.questions) {
                if (q.is_required && (!answers[q.id] || (Array.isArray(answers[q.id]) && answers[q.id].length === 0))) {
                    alert(`Lütfen "${q.question_text}" sorusunu cevaplayınız.`);
                    return;
                }
            }
        }

        setSubmitting(true);
        try {
            // 1. Create Response
            const { data: responseData, error: responseError } = await supabase
                .from('survey_responses')
                .insert([{
                    survey_id: survey.id,
                    user_id: user.id
                }])
                .select()
                .single();

            if (responseError) throw responseError;

            // 2. Create Answers
            const answerRows = Object.entries(answers).map(([qId, value]) => {
                const question = survey.questions?.find(q => q.id === qId);
                const isText = question?.question_type === 'short_text' || question?.question_type === 'long_text';

                return {
                    response_id: responseData.id,
                    question_id: qId,
                    answer_text: isText ? value : null,
                    answer_value: !isText ? value : null
                };
            });

            if (answerRows.length > 0) {
                const { error: answersError } = await supabase
                    .from('survey_answers')
                    .insert(answerRows);

                if (answersError) throw answersError;
            }

            setSubmitted(true);
        } catch (error: any) {
            console.error('Error submitting survey:', error);
            if (error.code === '23505') { // Unique constraint violation
                alert('Bu anketi daha önce cevapladınız.');
            } else {
                alert('Gönderim sırasında bir hata oluştu: ' + error.message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Yükleniyor...</div>;
    if (!survey) return <div>Anket bulunamadı.</div>;

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow space-y-4">
                <i className="bi bi-check-circle-fill text-green-500 text-5xl"></i>
                <h3 className="text-xl font-bold text-gray-800">Teşekkürler!</h3>
                <p className="text-gray-600">Cevaplarınız başarıyla kaydedildi.</p>
                <Button onClick={onClose}>Listeye Dön</Button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white">{survey.title}</h2>
                {survey.description && <p className="text-indigo-100 mt-1">{survey.description}</p>}
                {survey.is_anonymous && (
                    <span className="inline-block mt-2 bg-indigo-500 text-xs text-white px-2 py-1 rounded">
                        <i className="bi bi-shield-lock mr-1"></i> Bu anket anonimdir
                    </span>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {survey.questions?.map((q, index) => (
                    <div key={q.id} className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800">
                            {index + 1}. {q.question_text} {q.is_required && <span className="text-red-500">*</span>}
                        </label>

                        {q.question_type === 'short_text' && (
                            <input
                                type="text"
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                onChange={e => handleAnswerChange(q.id, e.target.value)}
                                required={q.is_required}
                            />
                        )}

                        {q.question_type === 'long_text' && (
                            <textarea
                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                rows={3}
                                onChange={e => handleAnswerChange(q.id, e.target.value)}
                                required={q.is_required}
                            />
                        )}

                        {q.question_type === 'single_choice' && (
                            <div className="space-y-2">
                                {q.options?.map((opt, i) => (
                                    <label key={i} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={q.id}
                                            value={opt}
                                            onChange={e => handleAnswerChange(q.id, opt)}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                            required={q.is_required}
                                        />
                                        <span className="text-gray-700">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {q.question_type === 'multiple_choice' && (
                            <div className="space-y-2">
                                {q.options?.map((opt, i) => (
                                    <label key={i} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            value={opt}
                                            onChange={e => handleMultiSelectChange(q.id, opt, e.target.checked)}
                                            className="text-indigo-600 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-gray-700">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {q.question_type === 'rating' && (
                            <div className="flex space-x-4">
                                {[1, 2, 3, 4, 5].map((val) => (
                                    <label key={val} className="flex flex-col items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name={q.id}
                                            value={val}
                                            onChange={() => handleAnswerChange(q.id, val)}
                                            className="sr-only peer"
                                            required={q.is_required}
                                        />
                                        <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center peer-checked:bg-indigo-600 peer-checked:text-white hover:bg-gray-100 transition-all">
                                            {val}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                <div className="flex justify-end space-x-3 pt-6 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>Vazgeç</Button>
                    <Button type="submit" loading={submitting}>Gönder</Button>
                </div>
            </form>
        </div>
    );
};

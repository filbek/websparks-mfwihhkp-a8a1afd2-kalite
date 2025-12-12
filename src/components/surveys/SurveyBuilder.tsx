import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Survey, SurveyQuestion, QuestionType, SurveyTargetType } from '../../types';
import { useSurveys } from '../../hooks/useSurveys';
import { useAuth } from '../../contexts/AuthContext';

interface SurveyBuilderProps {
    initialData?: Survey;
    onSave: () => void;
    onCancel: () => void;
}

export const SurveyBuilder: React.FC<SurveyBuilderProps> = ({ initialData, onSave, onCancel }) => {
    const { createSurvey, updateSurvey, addQuestion, updateQuestion, deleteQuestion, getSurveyWithQuestions } = useSurveys();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<Survey>>({
        title: '',
        description: '',
        status: 'draft',
        is_anonymous: false,
        target_type: 'all',
        target_ids: [],
        ...initialData
    });

    const [questions, setQuestions] = useState<Partial<SurveyQuestion>[]>([]);

    useEffect(() => {
        if (initialData?.id) {
            const loadQuestions = async () => {
                const fullSurvey = await getSurveyWithQuestions(initialData.id);
                if (fullSurvey && fullSurvey.questions) {
                    setQuestions(fullSurvey.questions);
                }
            };
            loadQuestions();
        }
    }, [initialData]);

    const handleAddQuestion = () => {
        setQuestions([...questions, {
            question_text: '',
            question_type: 'short_text',
            is_required: true,
            order: questions.length,
            options: [] // Initialize for choice types
        }]);
    };

    const handleQuestionChange = (index: number, field: keyof SurveyQuestion, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, optionIndex: number, value: string) => {
        const newQuestions = [...questions];
        const options = [...(newQuestions[qIndex].options || [])];
        options[optionIndex] = value;
        newQuestions[qIndex].options = options;
        setQuestions(newQuestions);
    };

    const addOption = (qIndex: number) => {
        const newQuestions = [...questions];
        const options = [...(newQuestions[qIndex].options || [])];
        options.push(`Seçenek ${options.length + 1}`);
        newQuestions[qIndex].options = options;
        setQuestions(newQuestions);
    };

    const removeOption = (qIndex: number, optionIndex: number) => {
        const newQuestions = [...questions];
        const options = [...(newQuestions[qIndex].options || [])];
        options.splice(optionIndex, 1);
        newQuestions[qIndex].options = options;
        setQuestions(newQuestions);
    };

    const handleRemoveQuestion = async (index: number) => {
        const question = questions[index];
        if (question.id) {
            // It's an existing question, mark for deletion or delete immediately?
            // Simple approach: delete immediately from DB if survey is saved. 
            // Better: Delete immediately using hook.
            if (confirm('Soruyu silmek istediğinize emin misiniz?')) {
                await deleteQuestion(question.id);
                const newQuestions = questions.filter((_, i) => i !== index);
                setQuestions(newQuestions);
            }
        } else {
            const newQuestions = questions.filter((_, i) => i !== index);
            setQuestions(newQuestions);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let surveyId = initialData?.id;

            // 1. Save Survey Header
            if (surveyId) {
                await updateSurvey(surveyId, formData);
            } else {
                const newSurvey = await createSurvey(formData);
                surveyId = newSurvey.id;
            }

            // 2. Save Questions
            if (surveyId) {
                // Upsert questions (simple loop for now, ideally batch)
                for (let i = 0; i < questions.length; i++) {
                    const q = questions[i];
                    const qData = {
                        ...q,
                        survey_id: surveyId,
                        order: i
                    };

                    if (q.id) {
                        await updateQuestion(q.id, qData);
                    } else {
                        await addQuestion(qData);
                    }
                }
            }

            onSave();
        } catch (error) {
            console.error('Error saving survey:', error);
            alert('Kaydedilirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const { user } = useAuth(); // Import useAuth to access facility_id



    const handleTargetTypeChange = (value: SurveyTargetType) => {
        let newTargetIds: number[] = [];

        if (value === 'facility' && user?.facility_id) {
            newTargetIds = [user.facility_id];
        } else if (value === 'department' && user?.department_id) {
            newTargetIds = [user.department_id];
        }

        setFormData({
            ...formData,
            target_type: value,
            target_ids: value === 'all' ? null : newTargetIds
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <h3 className="text-lg font-medium">Anket Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Anket Başlığı"
                        value={formData.title || ''}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                    <Select
                        label="Hedef Kitle"
                        value={formData.target_type}
                        onChange={val => handleTargetTypeChange(val as SurveyTargetType)}
                        options={[
                            { value: 'all', label: 'Tüm Organizasyon' },
                            { value: 'facility', label: user?.facility_id ? 'Sadece Benim Şubem' : 'Şube Bazlı' },
                            { value: 'department', label: 'Sadece Benim Bölümüm' }
                        ]}
                    />
                </div>
                <Textarea
                    label="Açıklama"
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="is_anonymous"
                        checked={formData.is_anonymous}
                        onChange={e => setFormData({ ...formData, is_anonymous: e.target.checked })}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="is_anonymous" className="text-sm text-gray-700">Anonim Anket (İsim gizli)</label>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Sorular</h3>
                    <Button type="button" onClick={handleAddQuestion} variant="secondary">
                        <i className="bi bi-plus mr-2"></i> Soru Ekle
                    </Button>
                </div>

                {questions.map((q, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow border border-gray-200 relative">
                        <div className="absolute top-4 right-4">
                            <button type="button" onClick={() => handleRemoveQuestion(index)} className="text-red-500 hover:text-red-700">
                                <i className="bi bi-trash"></i>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="col-span-2">
                                <Input
                                    label="Soru Metni"
                                    value={q.question_text || ''}
                                    onChange={e => handleQuestionChange(index, 'question_text', e.target.value)}
                                    placeholder="Sorunuzu buraya yazın..."
                                    required
                                />
                            </div>
                            <Select
                                label="Soru Tipi"
                                value={q.question_type}
                                onChange={val => handleQuestionChange(index, 'question_type', val)}
                                options={[
                                    { value: 'short_text', label: 'Kısa Yanıt' },
                                    { value: 'long_text', label: 'Paragraf' },
                                    { value: 'single_choice', label: 'Çoktan Seçmeli (Tek)' },
                                    { value: 'multiple_choice', label: 'Onay Kutuları (Çoklu)' },
                                    { value: 'rating', label: 'Puanlama (1-5)' }
                                ]}
                            />
                        </div>

                        {(q.question_type === 'single_choice' || q.question_type === 'multiple_choice') && (
                            <div className="ml-8 space-y-2">
                                <label className="text-sm font-medium text-gray-700">Seçenekler</label>
                                {q.options?.map((opt, optIndex) => (
                                    <div key={optIndex} className="flex items-center space-x-2">
                                        <i className={`bi ${q.question_type === 'single_choice' ? 'bi-circle' : 'bi-square'} text-gray-400`}></i>
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={e => handleOptionChange(index, optIndex, e.target.value)}
                                            className="flex-1 border-b border-gray-300 focus:border-indigo-500 outline-none py-1 text-sm"
                                        />
                                        <button type="button" onClick={() => removeOption(index, optIndex)} className="text-gray-400 hover:text-red-500">
                                            <i className="bi bi-x"></i>
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addOption(index)} className="text-sm text-indigo-600 hover:text-indigo-800 mt-2">
                                    + Seçenek Ekle
                                </button>
                            </div>
                        )}

                        <div className="mt-4 flex items-center">
                            <input
                                type="checkbox"
                                id={`required-${index}`}
                                checked={q.is_required}
                                onChange={e => handleQuestionChange(index, 'is_required', e.target.checked)}
                                className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor={`required-${index}`} className="text-sm text-gray-600">Bu soru zorunludur</label>
                        </div>
                    </div>
                ))}

                {questions.length === 0 && (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-dashed border-2 border-gray-300">
                        Henüz soru eklenmemiş. "Soru Ekle" butonuna tıklayarak başlayın.
                    </div>
                )}
            </div>

            <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end space-x-3 shadow-lg rounded-t-lg">
                <Button type="button" variant="secondary" onClick={onCancel}>İptal</Button>
                <Button type="submit" loading={loading}>
                    <i className="bi bi-save mr-2"></i> Kaydet
                </Button>
            </div>
        </form>
    );
};

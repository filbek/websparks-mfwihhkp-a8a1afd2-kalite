import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Survey, SurveyQuestion } from '../types';

export const useSurveys = () => {
    const { user } = useAuth();
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all visible surveys based on RLS
    const fetchSurveys = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('surveys')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSurveys(data || []);
        } catch (err: any) {
            console.error('Error fetching surveys:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch a single survey with its questions
    const getSurveyWithQuestions = async (surveyId: string) => {
        try {
            const { data: survey, error: surveyError } = await supabase
                .from('surveys')
                .select('*')
                .eq('id', surveyId)
                .single();

            if (surveyError) throw surveyError;

            const { data: questions, error: questionsError } = await supabase
                .from('survey_questions')
                .select('*')
                .eq('survey_id', surveyId)
                .order('order', { ascending: true });

            if (questionsError) throw questionsError;

            return { ...survey, questions } as Survey;
        } catch (err: any) {
            console.error('Error fetching survey details:', err);
            throw err;
        }
    };

    const createSurvey = async (surveyData: Partial<Survey>) => {
        try {
            // Ensure target_ids is null if empty array, to match DB default if needed or keep existing logic
            const { data, error } = await supabase
                .from('surveys')
                .insert([{
                    ...surveyData,
                    organization_id: user?.organization_id,
                    created_by: user?.id
                }])
                .select()
                .single();

            if (error) throw error;
            setSurveys(prev => [data, ...prev]);
            return data;
        } catch (err: any) {
            console.error('Error creating survey:', err);
            throw err;
        }
    };

    const updateSurvey = async (id: string, updates: Partial<Survey>) => {
        try {
            const { data, error } = await supabase
                .from('surveys')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setSurveys(prev => prev.map(s => s.id === id ? data : s));
            return data;
        } catch (err: any) {
            console.error('Error updating survey:', err);
            throw err;
        }
    };

    const deleteSurvey = async (id: string) => {
        try {
            const { error } = await supabase
                .from('surveys')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setSurveys(prev => prev.filter(s => s.id !== id));
        } catch (err: any) {
            console.error('Error deleting survey:', err);
            throw err;
        }
    };

    // Questions Management
    const addQuestion = async (question: Partial<SurveyQuestion>) => {
        try {
            const { data, error } = await supabase
                .from('survey_questions')
                .insert([question])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (err: any) {
            throw err;
        }
    }

    const updateQuestion = async (id: string, updates: Partial<SurveyQuestion>) => {
        try {
            const { data, error } = await supabase
                .from('survey_questions')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (err: any) {
            throw err;
        }
    }

    const deleteQuestion = async (id: string) => {
        try {
            const { error } = await supabase
                .from('survey_questions')
                .delete()
                .eq('id', id);
            if (error) throw error;
        } catch (err: any) {
            throw err;
        }
    }

    useEffect(() => {
        fetchSurveys();
    }, [fetchSurveys]);

    return {
        surveys,
        loading,
        error,
        fetchSurveys,
        getSurveyWithQuestions,
        createSurvey,
        updateSurvey,
        deleteSurvey,
        addQuestion,
        updateQuestion,
        deleteQuestion
    };
};

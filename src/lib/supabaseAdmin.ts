import { createClient } from '@supabase/supabase-js';

// Supabase admin client for database operations
const supabaseUrl = 'https://vrdpaqndholgfowlcghl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZHBhcW5kaG9sZ2Zvd2xjZ2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Nzc3MzMsImV4cCI6MjA3MzI1MzczM30.QOmgYEhv1WtVm3AYFqqB75iTzCKgA0pDcIw5OI4cA4A';

export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);

// Database setup functions
export const setupFeedbackTables = async () => {
  try {
    console.log('Setting up feedback tables...');
    
    // 1. Create feedback_categories table
    const { error: categoriesError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS feedback_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          description TEXT,
          icon VARCHAR(50),
          color VARCHAR(20),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (categoriesError) throw categoriesError;
    
    // 2. Create feedback_suggestions table
    const { error: suggestionsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS feedback_suggestions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          category_id UUID REFERENCES feedback_categories(id) ON DELETE SET NULL,
          reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
          reporter_name VARCHAR(255),
          reporter_email VARCHAR(255),
          reporter_phone VARCHAR(20),
          priority VARCHAR(20) DEFAULT 'orta' CHECK (priority IN ('düşük', 'orta', 'yüksek', 'kritik')),
          status VARCHAR(20) DEFAULT 'yeni' CHECK (status IN ('yeni', 'inceleniyor', 'beklemede', 'cozuldu', 'kapatildi')),
          is_anonymous BOOLEAN DEFAULT false,
          facility_id INTEGER NOT NULL,
          department_id INTEGER,
          tags TEXT[],
          upvotes INTEGER DEFAULT 0,
          downvotes INTEGER DEFAULT 0,
          view_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (suggestionsError) throw suggestionsError;
    
    // 3. Create feedback_responses table
    const { error: responsesError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS feedback_responses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          feedback_id UUID REFERENCES feedback_suggestions(id) ON DELETE CASCADE,
          responder_id UUID REFERENCES users(id) ON DELETE CASCADE,
          response TEXT NOT NULL,
          is_internal BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (responsesError) throw responsesError;
    
    // 4. Create feedback_votes table
    const { error: votesError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS feedback_votes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          feedback_id UUID REFERENCES feedback_suggestions(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(feedback_id, user_id)
        );
      `
    });
    
    if (votesError) throw votesError;
    
    // 5. Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_feedback_categories_name ON feedback_categories(name);',
      'CREATE INDEX IF NOT EXISTS idx_feedback_categories_active ON feedback_categories(is_active);',
      'CREATE INDEX IF NOT EXISTS idx_feedback_suggestions_category_id ON feedback_suggestions(category_id);',
      'CREATE INDEX IF NOT EXISTS idx_feedback_suggestions_status ON feedback_suggestions(status);',
      'CREATE INDEX IF NOT EXISTS idx_feedback_suggestions_priority ON feedback_suggestions(priority);',
      'CREATE INDEX IF NOT EXISTS idx_feedback_suggestions_created_at ON feedback_suggestions(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_feedback_suggestions_facility_id ON feedback_suggestions(facility_id);',
      'CREATE INDEX IF NOT EXISTS idx_feedback_responses_feedback_id ON feedback_responses(feedback_id);'
    ];
    
    for (const indexSql of indexes) {
      const { error: indexError } = await supabaseAdmin.rpc('exec_sql', { sql: indexSql });
      if (indexError) throw indexError;
    }
    
    // 6. Insert default categories
    const { error: categoryInsertError } = await supabaseAdmin
      .from('feedback_categories')
      .upsert([
        { name: 'Hizmet Kalitesi', description: 'Hizmet kalitesi ile ilgili görüşler', icon: 'bi-star', color: '#3B82F6' },
        { name: 'Personel', description: 'Personel ile ilgili görüşler', icon: 'bi-people', color: '#10B981' },
        { name: 'Fiziksel Ortam', description: 'Hastane fiziksel ortamı', icon: 'bi-building', color: '#F59E0B' },
        { name: 'Teknoloji', description: 'Teknolojik sistemler', icon: 'bi-laptop', color: '#8B5CF6' },
        { name: 'Diğer', description: 'Diğer konulardaki görüşler', icon: 'bi-three-dots', color: '#6B7280' }
      ], { onConflict: 'name' });
    
    if (categoryInsertError) throw categoryInsertError;
    
    console.log('Feedback tables setup completed successfully!');
    return { success: true, message: 'All tables created successfully' };
  } catch (error) {
    console.error('Error setting up feedback tables:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Check if tables exist
export const checkTablesExist = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('feedback_categories')
      .select('count')
      .limit(1);
    
    if (error) {
      return { exists: false, error: error.message };
    }
    
    return { exists: true, error: null };
  } catch (error) {
    return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
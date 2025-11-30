import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://vrdpaqndholgfowlcghl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZHBhcW5kaG9sZ2Zvd2xjZ2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Nzc3MzMsImV4cCI6MjA3MzI1MzczM30.QOmgYEhv1WtVm3AYFqqB75iTzCKgA0pDcIw5OI4cA4A';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCategories() {
  try {
    console.log('Updating feedback categories...');

    // 1. Mevcut kategorileri devre dışı bırak
    const { error: disableError } = await supabase
      .from('feedback_categories')
      .update({ is_active: false })
      .eq('is_active', true);

    if (disableError) throw disableError;
    console.log('Existing categories disabled');

    // 2. Yeni kategorileri ekle
    const newCategories = [
      {
        name: 'İstek',
        description: 'Hastane ile ilgili talepler ve istekler',
        icon: 'bi-send',
        color: '#3B82F6',
        is_active: true
      },
      {
        name: 'Öneri',
        description: 'Hizmet iyileştirme önerileri',
        icon: 'bi-lightbulb',
        color: '#10B981',
        is_active: true
      },
      {
        name: 'Şikayet',
        description: 'Şikayet ve memnuniyetsizlik bildirimleri',
        icon: 'bi-exclamation-triangle',
        color: '#EF4444',
        is_active: true
      },
      {
        name: 'Teşekkür',
        description: 'Teşekkür ve takdir mesajları',
        icon: 'bi-heart',
        color: '#F59E0B',
        is_active: true
      }
    ];

    // First try to insert, if fails then update
    for (const category of newCategories) {
      // Try to insert first
      const { error: insertError } = await supabase
        .from('feedback_categories')
        .insert(category);

      if (insertError) {
        // If insert fails (probably duplicate), try to update
        const { error: updateError } = await supabase
          .from('feedback_categories')
          .update(category)
          .eq('name', category.name);
        
        if (updateError) {
          console.log(`Warning: Could not update ${category.name}:`, updateError.message);
        } else {
          console.log(`Updated ${category.name}`);
        }
      } else {
        console.log(`Inserted ${category.name}`);
      }
    }
    console.log('Categories processed successfully');

    // 3. Verify the changes
    const { data: categories, error: fetchError } = await supabase
      .from('feedback_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (fetchError) throw fetchError;

    console.log('Updated categories:');
    categories.forEach(cat => {
      console.log(`- ${cat.name}: ${cat.description} (${cat.icon}, ${cat.color})`);
    });

    console.log('Categories updated successfully!');

  } catch (error) {
    console.error('Error updating categories:', error);
  }
}

updateCategories();

-- Bu script, e-posta onayı bekleyen tüm kullanıcıları otomatik olarak onaylar.
-- Supabase SQL Editor'de çalıştırın.

UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- İsteğe bağlı: Gelecekteki sorunları önlemek için
-- Supabase Dashboard > Authentication > Providers > Email 
-- menüsünden "Confirm email" seçeneğini kapatmanızı öneririm.

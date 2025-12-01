export const generateSecurePassword = (length: number = 12): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = uppercase + lowercase + numbers + specialChars;

  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password.split('').sort(() => Math.random() - 0.5).join('');
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Şifre en az 8 karakter olmalıdır');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('En az bir büyük harf içermelidir');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('En az bir küçük harf içermelidir');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('En az bir rakam içermelidir');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('En az bir özel karakter içermelidir');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export interface PasswordResetResult {
  userId: string;
  email: string;
  newPassword: string;
  success: boolean;
  error?: string;
}

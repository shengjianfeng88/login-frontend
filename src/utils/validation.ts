export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z\d]/.test(password)) strength++;
  return strength;
};

export const getPasswordStrengthColor = (strength: number): string => {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];
  return colors[strength - 1] || "bg-gray-200";
};

export const getPasswordStrengthText = (strength: number): string => {
  const levels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  return levels[strength - 1] || "Very Weak";
};

export type AuthRole = 'customer' | 'vendor';

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  businessName: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

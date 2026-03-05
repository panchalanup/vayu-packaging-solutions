export interface ContactFormState {
  name: string;
  company: string;
  email: string;
  phone: string;
  requirements: string;
}

export const initialContactFormState: ContactFormState = {
  name: '',
  company: '',
  email: '',
  phone: '',
  requirements: '',
};

// API handler for Google Sheets form submission
export interface ContactFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  requirements: string;
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
}

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxSNUo_NgcZCkxfh-iHlZ_E7DFYmy_VmxYxEXU_nodWhCQg-vI32HwJYhwC5xXvpNPz6g/exec';

export async function submitContactForm(data: ContactFormData): Promise<SubmissionResponse> {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Important for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Note: with no-cors mode, we can't read the response
    // So we assume success if no error is thrown
    return {
      success: true,
      message: 'Form submitted successfully! We will get back to you soon.',
    };
  } catch (error) {
    console.error('Form submission error:', error);
    return {
      success: false,
      message: 'Failed to submit form. Please try again or contact us directly.',
    };
  }
}

declare global {
  interface Window {
    Swal: any;
  }
}

// Load SweetAlert2 dynamically
export const loadSweetAlert = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (window.Swal) {
      resolve(window.Swal);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
    script.onload = () => {
      resolve(window.Swal);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Utility functions for common SweetAlert patterns
export const showSuccess = async (title: string, text?: string) => {
  const Swal = await loadSweetAlert();
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: '#4c6ef5',
    timer: 2000,
    showConfirmButton: false
  });
};

export const showError = async (title: string, text?: string) => {
  const Swal = await loadSweetAlert();
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#4c6ef5'
  });
};

export const showConfirmation = async (title: string, text: string) => {
  const Swal = await loadSweetAlert();
  return Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#ef4444',
    confirmButtonText: 'Yes, confirm!'
  });
};

export const showPaymentSuccess = async () => {
  const Swal = await loadSweetAlert();
  return Swal.fire({
    icon: 'success',
    title: 'Payment Submitted!',
    text: 'Your payment is being verified. You will receive confirmation shortly.',
    confirmButtonColor: '#4c6ef5'
  });
};

export const showPremiumRequired = async () => {
  const Swal = await loadSweetAlert();
  return Swal.fire({
    title: 'Premium Required',
    text: 'Upgrade to premium to download high-resolution images without watermarks',
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#4c6ef5',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Upgrade Now',
    cancelButtonText: 'Maybe Later'
  });
};

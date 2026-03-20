import { toast } from 'react-toastify';

/**
 * Toast notification utility functions
 * Provides consistent notification styling across the application
 */

export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    containerId: "main-toast",
    autoClose: options.autoClose || 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options,
  });
};

export const showError = (message, options = {}) => {
  return toast.error(message, {
    containerId: "main-toast",
    autoClose: options.autoClose || 6000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options,
  });
};

export const showWarning = (message, options = {}) => {
  return toast.warning(message, {
    containerId: "main-toast",
    autoClose: options.autoClose || 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options,
  });
};

export const showInfo = (message, options = {}) => {
  return toast.info(message, {
    containerId: "main-toast",
    autoClose: options.autoClose || 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options,
  });
};

// For loading states (returns the toast ID to update/dismiss later)
export const showLoading = (message, options = {}) => {
  return toast.loading(message, {
    containerId: "main-toast",
    closeOnClick: false,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    ...options,
  });
};

// Update loading toast to success/error
export const updateLoadingToSuccess = (toastId, message) => {
  toast.update(toastId, {
    render: message,
    type: "success",
    isLoading: false,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const updateLoadingToError = (toastId, message) => {
  toast.update(toastId, {
    render: message,
    type: "error",
    isLoading: false,
    autoClose: 6000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Dismiss specific toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAll = () => {
  toast.dismiss();
};

// Example usage:
/*
// Basic notifications
showSuccess('Profile updated successfully!');
showError('Failed to save changes. Please try again.');
showWarning('Your session will expire in 5 minutes.');
showInfo('New job posting available!');

// Loading notifications
const loadingToast = showLoading('Saving your profile...');
try {
  // Your async operation
  await saveProfile(data);
  updateLoadingToSuccess(loadingToast, 'Profile saved successfully!');
} catch (error) {
  updateLoadingToError(loadingToast, 'Failed to save profile.');
}
*/
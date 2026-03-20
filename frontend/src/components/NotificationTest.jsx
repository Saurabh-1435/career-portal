import { showSuccess, showError, showWarning, showInfo, showLoading, updateLoadingToSuccess, updateLoadingToError } from '../utils/notifications';

export default function NotificationTest() {
  const testSuccess = () => {
    showSuccess('This is a success notification! 🎉');
  };

  const testError = () => {
    showError('This is an error notification! ❌');
  };

  const testWarning = () => {
    showWarning('This is a warning notification! ⚠️');
  };

  const testInfo = () => {
    showInfo('This is an info notification! ℹ️');
  };

  const testLoading = () => {
    const toastId = showLoading('Processing your request...');

    // Simulate an async operation
    setTimeout(() => {
      if (Math.random() > 0.5) {
        updateLoadingToSuccess(toastId, 'Request completed successfully! ✅');
      } else {
        updateLoadingToError(toastId, 'Request failed. Please try again. ❌');
      }
    }, 3000);
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">Toast Notification Test</h2>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card card-custom p-4">
            <h4 className="mb-4">Test Toast Notifications</h4>
            <p className="text-muted mb-4">
              Click the buttons below to test different types of toast notifications.
              Each notification should appear in the top-right corner with proper styling.
            </p>

            <div className="d-grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <button
                className="btn btn-primary btn-primary-custom"
                onClick={testSuccess}
              >
                Success Toast
              </button>

              <button
                className="btn btn-danger"
                onClick={testError}
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none' }}
              >
                Error Toast
              </button>

              <button
                className="btn btn-warning"
                onClick={testWarning}
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none', color: 'white' }}
              >
                Warning Toast
              </button>

              <button
                className="btn btn-info"
                onClick={testInfo}
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none', color: 'white' }}
              >
                Info Toast
              </button>

              <button
                className="btn btn-secondary"
                onClick={testLoading}
                style={{ background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', border: 'none', color: 'white' }}
              >
                Loading Toast
              </button>
            </div>

            <div className="mt-4 p-3 bg-light rounded">
              <h6>Features:</h6>
              <ul className="mb-0">
                <li>Auto-dismiss after 5 seconds (6 seconds for errors)</li>
                <li>Click to dismiss</li>
                <li>Hover to pause timer</li>
                <li>Draggable notifications</li>
                <li>Progress bar showing time remaining</li>
                <li>Maximum 3 notifications at once</li>
                <li>Modern gradient styling</li>
                <li>Mobile responsive</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

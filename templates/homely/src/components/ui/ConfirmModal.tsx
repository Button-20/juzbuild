"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  loading = false,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setIsClosing(false);
  }, [isOpen]);

  const handleClose = () => {
    if (loading) return; // Prevent closing while loading
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleConfirm = () => {
    if (loading) return;
    onConfirm();
  };

  const handleEscape = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !loading) {
      handleClose();
    }
  };

  if (!isOpen && !isClosing) return null;

  const typeStyles = {
    danger: {
      iconColor: "text-red-600",
      iconBg: "bg-red-100 dark:bg-red-900/20",
      buttonBg: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      icon: "ph:warning-circle",
    },
    warning: {
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/20",
      buttonBg: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
      icon: "ph:warning",
    },
    info: {
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      buttonBg: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      icon: "ph:info",
    },
  };

  const styles = typeStyles[type];

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-200 ease-out ${
        isOpen && !isClosing ? "opacity-100" : "opacity-0"
      }`}
      onKeyDown={handleEscape}
      tabIndex={-1}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-all duration-200 ease-out ${
            isOpen && !isClosing ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleClose}
        />

        {/* Modal content */}
        <div
          className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all duration-200 ease-out sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 ${
            isOpen && !isClosing
              ? "opacity-100 translate-y-0 sm:scale-100"
              : "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          }`}
        >
          <div className="sm:flex sm:items-start">
            {/* Icon */}
            <div
              className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}
            >
              <Icon
                icon={styles.icon}
                className={`h-6 w-6 ${styles.iconColor}`}
                aria-hidden="true"
              />
            </div>

            {/* Content */}
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${styles.buttonBg} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none`}
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {confirmText}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

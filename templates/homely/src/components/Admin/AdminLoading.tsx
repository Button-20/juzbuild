import { Icon } from "@iconify/react";

interface AdminLoadingProps {
  message?: string;
  fullPage?: boolean;
}

export default function AdminLoading({
  message = "Loading...",
  fullPage = false,
}: AdminLoadingProps) {
  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon
            icon="ph:spinner"
            className="animate-spin text-4xl text-primary mb-4 mx-auto"
          />
          <p className="text-gray-600 dark:text-gray-400">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Icon
          icon="ph:spinner"
          className="animate-spin text-3xl text-primary mb-3 mx-auto"
        />
        <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
      </div>
    </div>
  );
}

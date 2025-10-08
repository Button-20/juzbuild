"use client";

import "@uiw/react-markdown-preview/markdown.css";
import "@uiw/react-md-editor/markdown-editor.css";
import dynamic from "next/dynamic";
import React, { useCallback, useState } from "react";

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
  ),
});

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  className = "",
  error = false,
  onImageUpload,
}) => {
  const [mounted, setMounted] = useState(false);

  // Set mounted state after component mounts
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle image paste/drop functionality
  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!onImageUpload) {
        return Promise.resolve("");
      }

      try {
        const imageUrl = await onImageUpload(file);
        return imageUrl;
      } catch (error) {
        console.error("Image upload failed:", error);
        throw error;
      }
    },
    [onImageUpload]
  );

  // Handle paste events for image uploads
  const handlePaste = useCallback(
    async (event: React.ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items || !onImageUpload) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image/") === 0) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            try {
              const imageUrl = await handleImageUpload(file);
              const imageMarkdown = `![Image](${imageUrl})`;

              // Insert the image markdown at the current cursor position
              const textarea = event.target as HTMLTextAreaElement;
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const newValue =
                value.substring(0, start) +
                imageMarkdown +
                value.substring(end);
              onChange(newValue);
            } catch (error) {
              console.error("Failed to upload pasted image:", error);
            }
          }
          break;
        }
      }
    },
    [value, onChange, handleImageUpload, onImageUpload]
  );

  // Handle drag and drop for images
  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      if (!onImageUpload) return;

      const files = event.dataTransfer?.files;
      if (!files) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.indexOf("image/") === 0) {
          event.preventDefault();
          try {
            const imageUrl = await handleImageUpload(file);
            const imageMarkdown = `![${file.name}](${imageUrl})`;

            // Append the image markdown to the current content
            const newValue = value + (value ? "\n\n" : "") + imageMarkdown;
            onChange(newValue);
          } catch (error) {
            console.error("Failed to upload dropped image:", error);
          }
        }
      }
    },
    [value, onChange, handleImageUpload, onImageUpload]
  );

  if (!mounted) {
    return (
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    );
  }

  return (
    <div className={`wysiwyg-editor ${className} ${error ? "error" : ""}`}>
      <style jsx global>{`
        .wysiwyg-editor {
          min-height: 200px;
        }

        .wysiwyg-editor .w-md-editor {
          background-color: transparent;
        }

        .wysiwyg-editor .w-md-editor-text-textarea,
        .wysiwyg-editor .w-md-editor-text {
          min-height: 200px !important;
          font-size: 14px;
          line-height: 1.5;
        }

        .wysiwyg-editor .w-md-editor-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: rgb(209 213 219);
        }

        .wysiwyg-editor .w-md-editor {
          border-radius: 0.5rem;
          border-color: rgb(209 213 219);
        }

        /* Dark mode styles */
        .dark .wysiwyg-editor .w-md-editor {
          background-color: rgb(55 65 81);
          border-color: rgb(75 85 99);
          color: rgb(243 244 246);
        }

        .dark .wysiwyg-editor .w-md-editor-toolbar {
          background-color: rgb(55 65 81);
          border-color: rgb(75 85 99);
        }

        .dark .wysiwyg-editor .w-md-editor-text-textarea,
        .dark .wysiwyg-editor .w-md-editor-text {
          background-color: rgb(55 65 81);
          color: rgb(243 244 246);
        }

        /* Error styles */
        .wysiwyg-editor.error .w-md-editor {
          border-color: rgb(239 68 68);
        }

        .wysiwyg-editor.error .w-md-editor-toolbar {
          border-color: rgb(239 68 68);
        }

        /* Focus styles */
        .wysiwyg-editor .w-md-editor:focus-within {
          border-color: rgb(59 130 246);
          box-shadow: 0 0 0 1px rgb(59 130 246);
        }

        .dark .wysiwyg-editor .w-md-editor:focus-within {
          border-color: rgb(96 165 250);
          box-shadow: 0 0 0 1px rgb(96 165 250);
        }
      `}</style>

      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        preview="edit"
        hideToolbar={false}
        visibleDragbar={false}
        textareaProps={{
          placeholder,
          style: { minHeight: 200 },
          onPaste: handlePaste,
          onDrop: handleDrop,
          onDragOver: (e) => e.preventDefault(),
        }}
        height={300}
      />

      {onImageUpload && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          💡 Tip: You can paste or drag & drop images directly into the editor
          to upload them automatically.
        </div>
      )}
    </div>
  );
};

export default WysiwygEditor;

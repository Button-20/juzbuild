"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Author {
  name: string;
  authorImage?: string;
  blogCount: number;
  lastUsed: string;
}

interface AuthorSelectorProps {
  value: {
    author: string;
    authorImage: string;
  };
  onChange: (author: { author: string; authorImage: string }) => void;
  onImageUpload: (file: File) => Promise<string>;
  error?: string;
  imageUploading?: boolean;
}

const AuthorSelector: React.FC<AuthorSelectorProps> = ({
  value,
  onChange,
  onImageUpload,
  error,
  imageUploading = false,
}) => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Fetch existing authors
  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const response = await fetch("/api/admin/authors");
      if (response.ok) {
        const data = await response.json();
        setAuthors(data.authors || []);
      }
    } catch (error) {
      console.error("Failed to fetch authors:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter authors based on search term
  const filteredAuthors = authors.filter((author) =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if current author is in the list
  const isExistingAuthor = authors.some(
    (author) => author.name === value.author
  );

  // Handle author selection
  const handleAuthorSelect = (author: Author) => {
    onChange({
      author: author.name,
      authorImage: author.authorImage || "",
    });
    setShowDropdown(false);
    setSearchTerm("");
    setIsCreatingNew(false);
  };

  // Handle new author creation
  const handleNewAuthor = (name: string) => {
    onChange({
      author: name,
      authorImage: value.authorImage, // Keep existing image if any
    });
    setIsCreatingNew(true);
    setShowDropdown(false);
  };

  // Handle input change
  const handleInputChange = (inputValue: string) => {
    setSearchTerm(inputValue);
    onChange({
      author: inputValue,
      authorImage: value.authorImage,
    });

    // Check if it's a new author
    const existsInList = authors.some(
      (author) => author.name.toLowerCase() === inputValue.toLowerCase()
    );
    setIsCreatingNew(inputValue.length > 0 && !existsInList);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Author *
        </label>

        <div className="relative">
          <input
            type="text"
            value={value.author}
            onChange={(e) => {
              handleInputChange(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white pr-10 ${
              error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="Type to search authors or create new..."
          />

          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <Icon icon={showDropdown ? "ph:caret-up" : "ph:caret-down"} />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
              {loading ? (
                <div className="p-3 text-center text-gray-500">
                  <Icon
                    icon="ph:spinner"
                    className="animate-spin inline mr-2"
                  />
                  Loading authors...
                </div>
              ) : (
                <>
                  {/* Existing authors */}
                  {filteredAuthors.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                        Existing Authors ({filteredAuthors.length})
                      </div>
                      {filteredAuthors.map((author, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAuthorSelect(author)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          {author.authorImage ? (
                            <Image
                              src={author.authorImage}
                              alt={author.name}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <Icon
                                icon="ph:user"
                                className="w-4 h-4 text-gray-400"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium dark:text-gray-900 text-gray-100 truncate">
                              {author.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {author.blogCount} blog
                              {author.blogCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Create new author option */}
                  {searchTerm &&
                    !filteredAuthors.some(
                      (author) =>
                        author.name.toLowerCase() === searchTerm.toLowerCase()
                    ) && (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                          Create New
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNewAuthor(searchTerm)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                        >
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <Icon
                              icon="ph:plus"
                              className="w-4 h-4 text-blue-600 dark:text-blue-400"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Create &quot;{searchTerm}&quot;
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              New author
                            </p>
                          </div>
                        </button>
                      </div>
                    )}

                  {/* No results */}
                  {!loading && filteredAuthors.length === 0 && !searchTerm && (
                    <div className="p-3 text-center text-gray-500">
                      No authors found
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

        {isCreatingNew && (
          <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
            <Icon icon="ph:info" className="inline mr-1" />
            Creating new author: &quot;{value.author}&quot;
          </p>
        )}
      </div>

      {/* Author Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Author Image
        </label>
        <div className="space-y-4">
          {value.authorImage ? (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="relative">
                <Image
                  src={value.authorImage}
                  alt="Author"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Author Image Uploaded
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  80x80px • Circular crop
                </p>
              </div>
              <div className="flex gap-2">
                <label
                  htmlFor="authorImageUpload"
                  className="cursor-pointer inline-flex items-center px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                >
                  <Icon icon="ph:pencil-simple" className="mr-1" />
                  Change
                </label>
                <button
                  type="button"
                  onClick={() =>
                    onChange({ author: value.author, authorImage: "" })
                  }
                  className="inline-flex items-center px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                >
                  <Icon icon="ph:trash" className="mr-1" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                  <Icon icon="ph:user" className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  No author image uploaded
                </p>
                <label
                  htmlFor="authorImageUpload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {imageUploading ? (
                    <>
                      <Icon icon="ph:spinner" className="animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Icon icon="ph:upload" className="mr-2" />
                      Upload Author Image
                    </>
                  )}
                </label>
              </div>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                try {
                  const imageUrl = await onImageUpload(file);
                  onChange({
                    author: value.author,
                    authorImage: imageUrl,
                  });
                } catch (error) {
                  console.error("Image upload failed:", error);
                }
              }
            }}
            className="hidden"
            id="authorImageUpload"
            disabled={imageUploading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Recommended: Square image, minimum 200x200px. Image will be
            displayed as a circle.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthorSelector;

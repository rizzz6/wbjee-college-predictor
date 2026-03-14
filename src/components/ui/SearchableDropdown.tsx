import { useState, useEffect, useRef } from 'react';

interface SearchableDropdownProps {
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
  label: string;
}

export default function SearchableDropdown({ options, selectedOption, onSelect, label }: SearchableDropdownProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const listboxId = `${label.replace(/\s+/g, '-').toLowerCase()}-listbox`;

  return (
    <div className="relative" ref={dropdownRef}>
      <label htmlFor={label} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <button
        type="button"
        id={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption || `Select a ${label.toLowerCase()}`}
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md">
          <div className="p-2">
            <input
              type="text"
              placeholder={`Search ${label.toLowerCase()}...`}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ul
            id={listboxId}
            role="listbox"
            className="max-h-60 overflow-auto"
          >
            {filteredOptions.map((option) => (
              <li
                key={option}
                role="option"
                aria-selected={option === selectedOption}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

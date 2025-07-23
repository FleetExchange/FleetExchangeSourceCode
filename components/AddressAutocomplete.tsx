import { Combobox } from "@headlessui/react";
import React from "react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  ready: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  suggestions: google.maps.places.AutocompletePrediction[];
  status: string;
  clearSuggestions: () => void;
  label: string;
  disabled?: boolean; // Optional prop to disable the input
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value = "", // Provide default empty string
  onChange,
  onBlur,
  ready,
  inputValue = "", // Provide default empty string
  onInputChange,
  suggestions,
  status,
  clearSuggestions,
  label,
  disabled = false, // Default to false if not provided
}) => {
  const handleSelect = (address: string) => {
    onChange(address || ""); // Ensure we never pass null
    clearSuggestions();
  };

  return (
    <div className="w-full">
      <Combobox value={value || ""} onChange={handleSelect}>
        <div className="relative">
          <Combobox.Input
            className="input border-none w-full focus:outline-none focus:ring-0 shadow-none"
            placeholder="Type address"
            value={inputValue || ""}
            onChange={(e) => onInputChange(e.target.value)}
            onBlur={onBlur}
            disabled={!ready || disabled}
          />
          {suggestions.length > 0 && (
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-base-100 py-1 shadow-lg">
              {suggestions.map((suggestion) => (
                <Combobox.Option
                  key={suggestion.place_id}
                  value={suggestion.description}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 px-4 ${
                      active ? "bg-primary/10" : ""
                    }`
                  }
                >
                  {suggestion.description}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  );
};

import { Combobox } from "@headlessui/react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  ready: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  suggestions: Array<{ place_id: string; description: string }>;
  status: string;
  clearSuggestions: () => void;
  label: string;
}

export const AddressAutocomplete = ({
  value,
  onChange,
  ready,
  inputValue,
  onInputChange,
  suggestions,
  status,
  clearSuggestions,
  label,
}: AddressAutocompleteProps) => {
  const handleSelect = (address: string) => {
    onChange(address);
    onInputChange(address); // Update the input value
    clearSuggestions();
  };

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{label}</legend>
      <Combobox value={value} onChange={handleSelect}>
        <div className="relative">
          <Combobox.Input
            className="input w-full"
            placeholder="Type address"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            displayValue={(address: string) => address}
            disabled={!ready}
          />
          {status === "OK" && (
            <Combobox.Options className="absolute z-10 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto">
              {suggestions.map(({ place_id, description }) => (
                <Combobox.Option key={place_id} value={description}>
                  {({ active }) => (
                    <div
                      className={`px-4 py-2 ${
                        active ? "bg-blue-600 text-white" : "text-gray-900"
                      }`}
                    >
                      {description}
                    </div>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </fieldset>
  );
};

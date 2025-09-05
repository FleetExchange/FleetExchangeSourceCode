import { Combobox } from "@headlessui/react";
import React, {
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";
import { isAddressWithinRangeCached } from "../utils/addressValidationCache";
import { trackPlacesCall } from "../utils/apiUsageTracker";

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
  disabled?: boolean;
  cityName?: string; // Add cityName for validation
  onValidationChange?: (isValid: boolean) => void; // Callback for validation results
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value = "",
  onChange,
  onBlur,
  ready,
  inputValue = "",
  onInputChange,
  suggestions,
  status,
  clearSuggestions,
  label,
  disabled = false,
  cityName,
  onValidationChange,
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<boolean | null>(
    null
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Debounced address validation
  const debouncedValidateAddress = useCallback(
    async (address: string) => {
      if (!address || !cityName || address.length < 10) {
        setValidationResult(null);
        onValidationChange?.(false);
        return;
      }

      // Clear existing timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set new timeout
      debounceRef.current = setTimeout(async () => {
        setIsValidating(true);
        try {
          const isValid = await validateAddress(address, cityName, "pickup");
          setValidationResult(isValid);
          onValidationChange?.(isValid);
        } catch (error) {
          console.error("Address validation error:", error);
          setValidationResult(false);
          onValidationChange?.(false);
        } finally {
          setIsValidating(false);
        }
      }, 1000); // Validate 1 second after user stops typing
    },
    [cityName, onValidationChange]
  );

  const handleSelect = (address: string) => {
    onChange(address || "");
    clearSuggestions();

    // Validate selected address
    if (cityName) {
      debouncedValidateAddress(address);
    }
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      onInputChange(val);

      // Trigger validation for manual input
      if (cityName) {
        debouncedValidateAddress(val);
      }
    },
    [onInputChange, debouncedValidateAddress]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Get input styling based on validation
  const getInputStyling = () => {
    if (!cityName || validationResult === null) {
      return "input border-none w-full focus:outline-none focus:ring-0 shadow-none";
    }

    if (isValidating) {
      return "input border-none w-full focus:outline-none focus:ring-0 shadow-none border-l-4 border-l-warning";
    }

    return validationResult
      ? "input border-none w-full focus:outline-none focus:ring-0 shadow-none border-l-4 border-l-success"
      : "input border-none w-full focus:outline-none focus:ring-0 shadow-none border-l-4 border-l-error";
  };

  return (
    <div className="w-full">
      <Combobox value={value || ""} onChange={handleSelect}>
        <div className="relative">
          <Combobox.Input
            className={getInputStyling()}
            placeholder="Type address"
            value={inputValue || ""}
            onChange={handleInputChange}
            onBlur={onBlur}
            disabled={!ready || disabled}
          />

          {/* Validation indicator */}
          {cityName && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isValidating && (
                <div className="loading loading-spinner loading-sm text-warning"></div>
              )}
              {!isValidating && validationResult === true && (
                <div className="text-success">✓</div>
              )}
              {!isValidating && validationResult === false && (
                <div className="text-error">✗</div>
              )}
            </div>
          )}

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

      {/* Validation message */}
      {cityName && validationResult === false && (
        <div className="text-xs text-error mt-1">
          Address not within range of {cityName}
        </div>
      )}
    </div>
  );
};

// Now actually use this function
const validateAddress = async (
  address: string,
  cityName: string,
  type: "pickup" | "delivery"
): Promise<boolean> => {
  console.log(`🚨 ADDRESS VALIDATION API CALL: ${address} in ${cityName}`);
  const isValid = await isAddressWithinRangeCached(address, cityName);

  return Boolean(isValid);
};

import { useState, forwardRef, useCallback, ReactNode } from "react"
import { Input } from "./ui/input"

interface AutocompleteInputProps {
  /** Available suggestions to filter from */
  suggestions: string[]
  /** Called when a suggestion is selected */
  onSelect: (value: string) => void
  /** Controlled value (optional - component can be uncontrolled) */
  value?: string
  /** Called when input value changes (for controlled mode) */
  onChange?: (value: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Icon to display on the left side of the input */
  icon?: ReactNode
  /** Additional className for the input */
  className?: string
}

const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(
  ({ suggestions, onSelect, value, onChange, placeholder = "Search...", icon, className }, ref) => {
    const [internalValue, setInternalValue] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)

    // Support both controlled and uncontrolled modes
    const inputValue = value !== undefined ? value : internalValue
    const setInputValue = onChange ?? setInternalValue

    const filtered = suggestions.filter(s =>
      s.toLowerCase().includes(inputValue.toLowerCase())
    )

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      setShowSuggestions(newValue.length > 0)
    }, [setInputValue])

    const handleSelect = useCallback((selectedValue: string) => {
      setInputValue(selectedValue)
      setShowSuggestions(false)
      onSelect(selectedValue)
    }, [setInputValue, onSelect])
  
    const handleFocus = useCallback(() => {
      if (inputValue.length > 0) {
        setShowSuggestions(true)
      }
    }, [inputValue])

    const handleBlur = useCallback(() => {
      // Delay to allow click on suggestion to register
      setTimeout(() => setShowSuggestions(false), 150)
    }, [])

    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-1000">
            {icon}
          </div>
        )}
        <Input
          ref={ref}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={icon ? `pl-9 ${className ?? ''}` : className}
        />
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute top-full mt-1 w-full bg-card rounded-xl shadow-xl border z-1001 max-h-48 overflow-y-auto">
            {filtered.slice(0, 10).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onMouseDown={() => handleSelect(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-accent text-sm first:rounded-t-xl last:rounded-b-xl"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)

AutocompleteInput.displayName = 'AutocompleteInput'

export default AutocompleteInput
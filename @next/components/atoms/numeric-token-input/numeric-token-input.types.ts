export interface NumericInputProps {
  value: string | number
  className?: string
  setValue: (value: string) => void
  hideInputBtns?: boolean
  connected: boolean
  MIN_VALUE: number
  MAX_VALUE: number
  size?: "s" | "m" | "l"
  disabled?: boolean
  refresh?: () => void
  allowedDigit?: number
  placeholder?: string
}

import { isValidNumber } from "@utils"

export function formatSol(
  number: number | null,
  maxCharacters?: number
): string {
  if (number === 0) return "0"
  if (!number) return "--"
  if (!isValidNumber(number)) return "--"
  if (number >= 1000) {
    const numberFormatter = Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 5
    })
    const numStr = numberFormatter.format(number)
    if (numStr.length <= 10) {
      return numStr
    } else {
      const numStrWithoutDigits = numberFormatter.format(Math.round(number))
      const lengthWithoutDigits = numStrWithoutDigits.length
      if (lengthWithoutDigits >= 10) {
        return numStrWithoutDigits
      } else {
        const decimal = Math.min(9 - lengthWithoutDigits, maxCharacters ?? 4, 4)
        const numberStr = numberFormatter.format(
          Math.round(number * 10 ** decimal) / 10 ** decimal
        )
        const trimmedStr = numberStr
          .replace(/(\.\d*?)0+($|(?=[^0-9]))/, "$1")
          .replace(/\.$/, "")
        return trimmedStr
      }
    }
  } else if (Math.abs(number) >= 0.001) {
    const numberStr = number.toFixed(maxCharacters ?? 4)
    const trimmedStr = numberStr
      .replace(/(\.\d*?)0+($|(?=[^0-9]))/, "$1")
      .replace(/\.$/, "")
    return trimmedStr
  } else if (Math.abs(number) < 0.001 && Math.abs(number) >= 0.000_001) {
    const numStr = formatSmallToSubscript(number)
    return removeTrailingZeros(numStr)
  } else if (Math.abs(number) < 0.000_001 && Math.abs(number) >= 0.000_000_01) {
    const numStr = formatExponentialToSubscript(number, 2)
    return removeTrailingZeros(numStr)
  } else if (
    Math.abs(number) < 0.000_000_01 &&
    Math.abs(number) >= 0.000_000_000_1
  ) {
    const numStr = formatExponentialToSubscript(number, 4)
    return removeTrailingZeros(numStr)
  } else if (Math.abs(number) < 0.000_000_000_1) {
    const numStr = formatExponentialToSubscript(number, 6)
    return removeTrailingZeros(numStr)
  } else {
    return number.toString()
  }

  function formatExponentialToSubscript(
    number: number,
    multiplier: number
  ): string {
    const isNegative = number < 0
    if (isNegative) {
      number = Math.abs(number)
    }
    const numMultiplied = number * 10 ** multiplier
    const numStr = numMultiplied.toString()
    const nonZeroIndex = numStr.search(/[1-9]/)
    if (nonZeroIndex === -1 || nonZeroIndex === 0) {
      return numStr
    }
    const zerosCount = nonZeroIndex - 2
    const subscripts = [
      "₀",
      "₁",
      "₂",
      "₃",
      "₄",
      "₅",
      "₆",
      "₇",
      "₈",
      "₉",
      "₁₀",
      "₁₁"
    ]
    const afterNonZero = numStr.slice(nonZeroIndex, nonZeroIndex + 5)
    return isNegative
      ? `-0.0${subscripts[zerosCount + multiplier]}${afterNonZero}`
      : `0.0${subscripts[zerosCount + multiplier]}${afterNonZero}`
  }

  function formatSmallToSubscript(number: number): string {
    const isNegative = number < 0
    if (isNegative) {
      number = Math.abs(number)
    }
    const numStr = number.toString()
    const nonZeroIndex = numStr.search(/[1-9]/)
    if (nonZeroIndex === -1 || nonZeroIndex === 0) {
      return numStr
    }
    const zerosCount = nonZeroIndex - 2
    const subscripts = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉", "₁₀"]
    const afterNonZero = numStr.slice(nonZeroIndex, nonZeroIndex + 3)
    return isNegative
      ? `-0.0${subscripts[zerosCount]}${afterNonZero}`
      : `0.0${subscripts[zerosCount]}${afterNonZero}`
  }

  function removeTrailingZeros(input: string): string {
    return input.replace(/0+$/, "")
  }
}

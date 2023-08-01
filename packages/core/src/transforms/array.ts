import type { Transform } from "./index"

const array: Transform<unknown[]> = {
  stringify: (value) => JSON.stringify(value),
  parse: (value) => {
    if (value.trim().length === 0) return []

    let data
    try {
      data = JSON.parse(value)
    } catch {
      return value.trim().split(",")
    }

    if (!Array.isArray(data)) {
      throw new Error(`Failed to parse attribute value as an array: ${data}`)
    }

    return data
  },
}

export default array

import type { Transform } from "./index"

const array: Transform<unknown[]> = {
  stringify: (value) => JSON.stringify(value),
  parse: (value) => {
    let data

    try {
      data = JSON.parse(value)
    } catch {
      const str = value.trim()
      if (str.length === 0) return []
      return str.split(",")
    }

    if (!Array.isArray(data)) {
      throw new Error(`Failed to parse attribute value as an array: ${data}`)
    }

    return data
  },
}

export default array

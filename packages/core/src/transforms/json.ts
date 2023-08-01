import type { Transform } from "./index"

const json: Transform<ReturnType<typeof JSON.parse>> = {
  stringify: (value) => JSON.stringify(value),
  parse: (value) => JSON.parse(value),
}

export default json

import string from "./string"
import number from "./number"
import boolean from "./boolean"
import function_ from "./function"
import json from "./json"
import callback from "./callback"

export interface Transform<Type> {
  stringify?: (value: Type) => string
  parse?: (value: string, element: HTMLElement) => Type
}

const transforms = {
  string,
  number,
  boolean,
  function: function_,
  json,
  callback,
}

export type R2WCType = keyof typeof transforms

export default transforms

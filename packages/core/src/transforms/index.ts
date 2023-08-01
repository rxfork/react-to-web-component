import string from "./string"
import number from "./number"
import boolean from "./boolean"
import array from "./array"
import function_ from "./function"
import json from "./json"
import object_ from "./object"

export interface Transform<Type> {
  stringify?: (value: Type) => string
  parse?: (value: string, element: HTMLElement) => Type
}

const transforms = {
  string,
  number,
  boolean,
  array,
  function: function_,
  json,
  object: object_,
}

export type R2WCType = keyof typeof transforms

export default transforms

import { describe, test, it, expect, vi, afterEach } from "vitest"
import matchers from "@testing-library/jest-dom/matchers"

import r2wc from "./core"

expect.extend(matchers)

const mount = vi.fn(() => ({ why: "context" }))
const unmount = vi.fn()
const update = vi.fn()

function wait() {
  return new Promise((resolve) => setImmediate(resolve))
}

describe("core", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("mounts and unmounts in light mode", async () => {
    const ReactComponent: React.FC = () => <h1>Hello</h1>

    const WebComponent = r2wc(ReactComponent, {}, { mount, unmount, update })
    customElements.define("test-light", WebComponent)

    const element = new WebComponent()

    document.body.appendChild(element)
    expect(mount).toBeCalledTimes(1)

    document.body.removeChild(element)
    expect(unmount).toBeCalledTimes(1)
    expect(unmount).toBeCalledWith({ why: "context" })
  })

  it("mounts and unmounts in open shadow mode", async () => {
    const ReactComponent: React.FC = () => <h1>Hello</h1>

    const WebComponent = r2wc(
      ReactComponent,
      { shadow: "open" },
      { mount, unmount, update },
    )
    customElements.define("test-shadow-open", WebComponent)

    const element = new WebComponent()

    document.body.appendChild(element)
    expect(element).toHaveProperty("shadowRoot")
    expect(mount).toBeCalledTimes(1)

    document.body.removeChild(element)
    expect(unmount).toBeCalledTimes(1)
    expect(unmount).toBeCalledWith({ why: "context" })
  })

  it("mounts and unmounts in closed shadow mode", async () => {
    const ReactComponent: React.FC = () => <h1>Hello</h1>

    const WebComponent = r2wc(
      ReactComponent,
      { shadow: "closed" },
      { mount, unmount, update },
    )
    customElements.define("test-shadow-closed", WebComponent)

    const element = new WebComponent()

    document.body.appendChild(element)
    expect(element).toHaveProperty("shadowRoot")
    expect(mount).toBeCalledTimes(1)

    document.body.removeChild(element)
    expect(unmount).toBeCalledTimes(1)
    expect(unmount).toBeCalledWith({ why: "context" })
  })

  test("updated attribute updates the component prop and the HTMLElement property", async () => {
    function Button({ text }: { text: string }) {
      return <button>{text}</button>
    }

    const ButtonElement = r2wc(
      Button,
      { props: ["text"] },
      { mount, unmount, update },
    )

    customElements.define("test-button-element-attribute", ButtonElement)

    const body = document.body
    body.innerHTML =
      "<test-button-element-attribute text='hello'></test-button-element-attribute>"

    const element = body.querySelector(
      "test-button-element-attribute",
    ) as HTMLElement & { text: string }

    element.setAttribute("text", "world")

    await wait()

    expect(element.text).toBe("world")
  })

  test("updated HTMLElement property updates the component prop and the HTMLElement attribute", async () => {
    interface Props {
      text: string
      numProp: number
      boolProp: boolean
      arrProp: string[]
      csvProp: string[]
      emptycsvProp: string[]
      objProp: { [key: string]: string }
      funcProp: () => void
    }

    function ButtonWithDifferentPropTypes({
      text,
      numProp,
      boolProp,
      arrProp,
      emptycsvProp,
      csvProp,
      objProp,
      funcProp,
    }: Props) {
      return <button>{text}</button>
    }

    const ButtonElement = r2wc(
      ButtonWithDifferentPropTypes,
      {
        props: {
          text: "string",
          numProp: "number",
          boolProp: "boolean",
          arrProp: "array",
          csvProp: "array",
          emptycsvProp: "array",
          objProp: "json",
          funcProp: "function",
        },
      },
      { mount, unmount, update },
    )

    //@ts-ignore
    global.globalFn = function () {
      expect(true).toBe(true)
      return true
    }

    //@ts-ignore
    global.newFunc = function newFunc() {
      expect(this).toBe(document.querySelector("test-button-element-property"))
    }

    customElements.define("test-button-element-property", ButtonElement)

    const body = document.body
    body.innerHTML = `<test-button-element-property text='hello' obj-prop='{"greeting": "hello, world"}' arr-prop='["hello", "world"]' csv-prop=' hello,world ' emptycsv-prop='' num-prop='240' bool-prop='true' func-prop='globalFn'>
                      </test-button-element-property>`

    const element = body.querySelector(
      "test-button-element-property",
    ) as HTMLElement & Props

    await wait()

    expect(element.text).toBe("hello")
    expect(element.numProp).toBe(240)
    expect(element.boolProp).toBe(true)
    expect(element.arrProp).toEqual(["hello", "world"])
    expect(element.csvProp).toEqual(["hello", "world"])
    expect(element.emptycsvProp).toEqual([])
    expect(element.objProp).toEqual({ greeting: "hello, world" })
    expect(element.funcProp).toBeInstanceOf(Function)
    expect(element.funcProp()).toBe(true)

    element.text = "world"
    element.numProp = 100
    element.boolProp = false
    //@ts-ignore
    element.funcProp = global.newFunc

    await wait()

    expect(element.getAttribute("text")).toBe("world")
    expect(element.getAttribute("num-prop")).toBe("100")
    expect(element.getAttribute("bool-prop")).toBe("false")
    expect(element.getAttribute("func-prop")).toBe("newFunc")
  })

  test("sets HTML property not defined in props but found on HTML object", async () => {
    function Button({ text = "Hello, button" }: { text: string }) {
      return <button>{text}</button>
    }

    const ButtonElement = r2wc(
      Button,
      { props: ["text"] },
      { mount, unmount, update },
    )

    customElements.define("test-button-element-non-prop", ButtonElement)

    const body = document.body
    body.innerHTML = `<test-button-element-non-prop></test-button-element-non-prop>`

    const element = body.querySelector(
      "test-button-element-non-prop",
    ) as HTMLElement & { text: string }
    element.style.backgroundColor = "red"
    element.style.visibility = "hidden"
    element.id = "test-button-id"

    await wait()

    expect(element).toHaveStyle("background-color: rgb(255, 0, 0);")
    expect(element).not.toBeVisible()
    expect(body.querySelector("#test-button-id")).toBe(element)
  })

  test("object prop type as function", async () => {
    expect.assertions(4)

    interface Props {
      objectProp: () => void
    }

    function ButtonWithObjectPropType({ objectProp }: Props) {
      return <button>foo</button>
    }

    const ButtonElement = r2wc(
      ButtonWithObjectPropType,
      {
        props: {
          objectProp: "object",
        },
      },
      { mount, unmount, update },
    )

    function newFunc() {
      //@ts-ignore
      expect(this).toBe(document.querySelector("test-button-element-property"))
    }

    customElements.define("test-button-object-property", ButtonElement)

    const body = document.body
    body.innerHTML = `<test-button-element-property>
                      </test-button-element-property>`

    const element = body.querySelector(
      "test-button-element-property",
    ) as HTMLElement & Props

    element.objectProp = () => {
      expect(true).toBe(true)
      return true
    }

    await wait()

    expect(element.objectProp()).toBe(true)

    //@ts-ignore
    element.objectProp = newFunc
    element.objectProp()

    await wait()
    expect(element.getAttribute("object-prop")).toBe(null)
  })
})

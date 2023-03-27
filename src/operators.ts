const Operators = [
  {
    name: "Add",
    text: "+",
    label: "+",
    fn: (x: number, y: number) => x + y,
  },
  {
    name: "Minus",
    text: "-",
    label: "-",
    fn: (x: number, y: number) => x - y,
  },
  {
    name: "Multiply",
    text: "*",
    label: "×",
    fn: (x: number, y: number) => x * y,
  },
  {
    name: "Divide",
    text: "/",
    label: "÷",
    fn: (x: number, y: number) => x / y,
  },
  {
    name: "None",
    text: "",
    label: "",
    fn: (x: number, y: number) => x + y,
  },
];
export function getOperator(text: string) {
  return Operators.filter((o) => o.text == text)[0];
}

export const allowableOperators = Operators.filter((x) => x.name != "None").map(
  (x) => x.text
);

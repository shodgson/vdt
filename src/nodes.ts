import "./styles.css";
//import "@picocss/pico";

class ValueInput {
  value: number;
  minValue: number;
  maxValue: number;
  step: number;
  constructor(
    value: number,
    minValue: number = 0,
    maxValue: number = 0,
    step: number = value / 5
  ) {
    this.value = value;
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.step = step;
  }
  isRange() {
    return this.step && this.maxValue;
  }
  toDOM(): HTMLInputElement {
    const input = document.createElement("input");

    if (this.isRange()) {
      // Slider
      input.type = "range";
      input.min = this.minValue.toString();
      input.max = this.maxValue.toString();
      input.step = this.step.toString();
      input.value = this.value.toString();
    } else {
      // Input box
      input.type = "number";
      input.value = this.value.toString();
    }

    return input;
  }

  toText(): string {
    if (this.isRange()) {
      return `[${this.value}; ${this.minValue}; ${this.maxValue}; ${this.step}]`;
    }
    return `[${this.value}]`;
  }
}

type NodeConnection = {
  start: HTMLElement;
  end: HTMLElement;
  operator: string;
};

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
function getOperator(text: string) {
  return Operators.filter((o) => o.text == text)[0];
}

export const allowableOperators = Operators.filter((x) => x.name != "None").map(
  (x) => x.text
);

//type NodeValue = ValueInput | ValueCalculation //| ValueConstant

export class VDTNode {
  name: any;
  operator: string;
  unit: string;

  constructor(name: string, unit: string = "", operator: string = "") {
    this.name = name;
    this.unit = unit;
    this.operator = operator;
  }

  //getValue() {
  //return this.input ? this.input.value : this.value;
  //}
  getValue() {
    return 0;
  }

  getMaxDepth() {
    return 0;
  }

  contains(nodeName: string): boolean {
    return this.name == nodeName;
  }

  valueToDOM(): HTMLElement {
    return document.createElement("div");
  }

  toText(): string {
    return "";
  }

  unitsToText(): string {
    if (this.unit == "") {
      return "";
    }
    return `[${this.name}] = ${this.unit}\n`;
  }

  // calculateValue will set the value for the selected and all child nodes
}

export class CalculationNode extends VDTNode {
  children: VDTNode[] = [];

  addChild(node: VDTNode) {
    this.children.push(node);
    return this;
  }

  calculateValue() {
    this.getValue();
    return this;
  }

  getValue() {
    if (this.children.length === 0) {
      return 0;
    }

    let total = 0;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      const childValue = child.getValue();
      if (i == 0) {
        total = childValue;
      } else {
        total = getOperator(child.operator).fn(total, childValue);
      }
    }

    //this.value = total;
    return total;
  }

  valueToDOM(): HTMLElement {
    const div = document.createElement("div");
    div.classList.add("nodeValue");
    div.innerHTML = this.getValue().toLocaleString();
    return div;
  }

  toText(): string {
    return `${this.name} = ${this.children
      .map((c) => c.operator + " " + c.name)
      .join(" ")}`;
  }

  getMaxDepth() {
    // Recursively calculate the maximum depth of each child node
    const depths = this.children.map((e) => e.getMaxDepth());
    const maxDepth = Math.max(...depths);

    // Add 1 to the maximum depth to account for the current node
    return maxDepth + 1;
  }

  countLeafNodes(): number {
    if (this.children.length === 0) {
      // If the node has no children, it's a leaf node and we return 1
      return 1;
    }

    // Recursively count the number of leaf nodes in each child node
    const leafCounts = this.children.map((x) => {
      if (x instanceof CalculationNode) {
        return x.countLeafNodes();
      }
      return 1;
    });
    const totalLeafCount = leafCounts.reduce((a, b) => a + b, 0);

    return totalLeafCount;
  }

  contains(nodeName: string): boolean {
    if (this.name == nodeName) return true;
    if (this.children.filter((x) => x.contains(nodeName)).length > 0)
      return true;
    return false;
  }
}

export class InputNode extends VDTNode {
  input: ValueInput = new ValueInput(0);

  constructor(
    name: string,
    unit: string,
    operator: string,
    defaultValue: number = 0,
    minValue?: number,
    maxValue?: number,
    step?: number
  ) {
    super(name, unit, operator);
    this.input = new ValueInput(defaultValue, minValue, maxValue, step);
  }
  getValue() {
    return this.input.value;
  }

  getMaxDepth() {
    return 1;
  }
  valueToDOM(): HTMLElement {
    const div = document.createElement("div");
    if (this.input.isRange()) {
      div.classList.add("nodeInput");
      div.innerHTML = this.getValue().toLocaleString();
    }
    return div;
  }
  toText(): string {
    return `${this.name} = ${this.input.toText()}`;
  }
}

export class StaticNode extends VDTNode {
  value: number;
  constructor(name: string, unit: string, operator: string, value: number = 0) {
    super(name, unit, operator);
    this.value = value;
  }
  getValue() {
    return this.value;
  }

  getMaxDepth() {
    return 1;
  }

  valueToDOM(): HTMLElement {
    const div = document.createElement("div");
    div.classList.add("nodeValue");
    div.innerHTML = this.getValue().toLocaleString();
    return div;
  }
  toText(): string {
    return `${this.name} = ${this.value}`;
  }
}

const container = document.getElementById("tree-container");

const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.style.position = "absolute";
svg.style.top = "0";
svg.style.top = "0";
svg.style.width = "100%";
svg.style.height = "100%";
svg.style.zIndex = "-100";

export function updateView(node: CalculationNode | undefined) {
  if (node && container != null) {
    container.innerHTML = "";
    svg.innerHTML = "";
    container.style.display = "grid";
    //console.debug(`Number of leaf nodes: ${node.countLeafNodes()}`);
    container.style.gridTemplateRows = `repeat(${node.countLeafNodes()})`;
    container.style.gridTemplateColumns = `repeat(${node.getMaxDepth()})`;
    const nodes = renderNode(node.calculateValue(), node);
    renderConnections(nodes.nodeConnections);
    new ResizeObserver(function redrawConnections() {
      svg.innerHTML = "";
      renderConnections(nodes.nodeConnections);
    }).observe(container);
  }
}

function renderConnections(connections: NodeConnection[]) {
  //Connect nodes
  connections.forEach((c) => connectNodes(c.start, c.end, c.operator));
}

function renderNode(
  node: VDTNode,
  rootNode: CalculationNode,
  level = 1,
  row = 1
) {
  let numLeaves = 0;
  const nodeCardContainer = document.createElement("div");
  nodeCardContainer.classList.add("nodeContainer");
  nodeCardContainer.style.gridColumn = `${level} / span 1`;
  const nodeCard = document.createElement("article");

  let nodeConnections: NodeConnection[] = [];
  //console.log(node.name, nodeCard, node.operator, level);
  //const operatorLabel =
  const nodeContent = `
    <header>
      <div class="nodeName">${getOperator(node.operator).label} ${
    node.name
  }</div>
      <div class="nodeUnit"">${node.unit}</div>
    </header>
  `;
  nodeCard.innerHTML = nodeContent;
  nodeCard.appendChild(node.valueToDOM());
  nodeCardContainer.appendChild(nodeCard);
  container?.appendChild(nodeCardContainer);

  if (node instanceof CalculationNode && node.children.length > 0) {
    let childLeaves = 0;
    //nodeContainer.appendChild(subNodeContainer);
    for (const child of node.children) {
      //console.log( `Rendering ${child.name} at (${childLeaves} + ${row},${level + 1})`);
      const childNode = renderNode(
        child,
        rootNode,
        level + 1,
        row + childLeaves
      );
      childLeaves += childNode.numLeaves;
      numLeaves = childLeaves;
      nodeConnections.push(...childNode.nodeConnections, {
        start: nodeCard,
        end: childNode.nodeCard,
        operator: child.operator,
      });
    }
  } else {
    if (node instanceof InputNode) {
      const inputWrapper = document.createElement("div");
      inputWrapper.className = "nodeInput";
      nodeCard.appendChild(inputWrapper);
      /*
      const input = document.createElement("input");
      input.type = "text";
      input.value = node.getValue().toString();
      input.onchange = () => {
        const newValue = parseFloat(input.value.replace(/,/g, ""));
        if (!isNaN(newValue) && node.input) {
          node.input.value = newValue;
          //node.calculateValue();
          //this.render(this.rootNode);
          updateView(profit);
        }
      };
      inputWrapper.appendChild(input);
      */

      const inputDongle = node.input.toDOM();
      inputDongle.onchange = () => {
        //input.value = slider.value;
        const newValue = parseFloat(inputDongle.value);
        if (node.input) {
          node.input.value = newValue;
          //node.calculateValue();
          //this.render(this.rootNode);
          updateView(rootNode);
        }
      };
      inputWrapper.appendChild(inputDongle);
    }
    numLeaves++;
  }

  // Position offset
  /*
  let toprow = 0;
  let bottomrow = 0;
  if (numLeaves % 2 == 0) {
    toprow = numLeaves / 2;
    //nodeCard.style.gridRow = `${row + numLeaves / 2} / span 1`;
    nodeCard.style.backgroundColor = "deeppink";
  } else {
    toprow = (numLeaves + 1) / 2;
    //const bottomrow = toprow + 1
  }
  */
  nodeCardContainer.style.gridRowStart = `${row} `;
  nodeCardContainer.style.gridRowEnd = `${row + numLeaves}`;

  return { nodeCard, numLeaves, nodeConnections };
}

// console.log("Depth:", getMaxDepth(profit));
// console.log("Leaves:", countLeafNodes(profit));

function connectNodes(
  nodeCard: HTMLElement,
  childNode: HTMLElement,
  operator: string | null | undefined
) {
  /*console.log(
    "Connect ",
    nodeCard,
    childNode,
    operator,
    nodeCard.offsetLeft,
    nodeCard.offsetWidth
  );
  */
  //const rect = nodeCard.getBoundingClientRect();
  const startingPoint = {
    x: nodeCard.offsetLeft + nodeCard.offsetWidth,
    y: nodeCard.offsetTop + nodeCard.offsetHeight / 2,
  };
  //console.log(startingPoint);

  const endPoint = {
    x: childNode.offsetLeft,
    y: childNode.offsetTop + childNode.offsetHeight / 2,
  };

  // Create an SVG path element
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

  // Set the path data to draw two horizontal lines and a vertical line
  const pathData = `
  M ${startingPoint.x}, ${startingPoint.y}
  H ${(startingPoint.x + endPoint.x) / 2}
  v ${Math.floor(endPoint.y - startingPoint.y)}
  H ${endPoint.x}
`;

  path.setAttribute("d", pathData);

  // Set the stroke and stroke-width of the path
  path.setAttribute("stroke", "black");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke-width", "2");

  // Add the path to an SVG element and add the SVG element to the document
  svg.appendChild(path);

  if (container != null) {
    container.appendChild(svg);
  }

  //throw new Error("Function not implemented.");
}

export function nodeToText(node: VDTNode) {
  let text = node.toText() + "\n" + node.unitsToText();
  if (node instanceof CalculationNode) {
    text += node.children.map((c) => nodeToText(c)).join("");
  }
  return text;
}

// DONE: refactor: VDTNode, InputNode, CalculationNode, ConstantNode
// DONE: allow constants
// DONE: on container resize, redraw connections
// DONE: operators
// DONE: create form (text view, but reverse)
// DONE: refactor: operators to proper class
// DONE: text view
// TODO: vertical view
// TODO: collaps/expand
// TODO: non-range inputs (e.g. radio box)
// TODO: refactor: separate nodes and the rendering. clean the latter up. toDOM() separately
// TODO: use tempNodes in parser

/*
Text parse

Profit = Sales - COGS 
Sales = Widgets sold x Price per widget
COGS = Direct costs + Labor
Direct costs = Materials
Labor = Hours * Rate

Widgets sold = [1000; 500; 2000; 100]
Price per widget = 6
Materials = 1000
Hours = 100
Rate = 50

*/

import {
  allowableOperators,
  CalculationNode,
  InputNode,
  StaticNode,
  VDTNode,
} from "./nodes";

export function ParseVDT(input: string) {
  // "Big value = C * D\nX = A - B + Big value\nA = 3\nB = 2\nC=4\nD=5";

  // Split the input string into individual lines
  const lines = input.split("\n");

  type TempNode = {
    nodeName: string;
    children: string[];
    operators: string[];
    unit: string;
  };

  const calcNodes: TempNode[] = [];
  const nodes: VDTNode[] = [];
  const units: { nodeName: string; unit: string }[] = [];

  //   console.log(allowableOperators);
  function hasOperator(text: string) {
    return allowableOperators.some((o) => text.includes(o));
  }

  // Loop over each line of the input
  for (const line of lines) {
    // Split the line into its constituent parts
    if (line.trim().length == 0) continue;

    const parts = line.split(/ *= */);

    if (parts.length != 2) {
      throw new Error("Each line have one and only one equals sign (=)");
    }

    const name = parts[0];
    const value = parts[1];

    // Check for units
    if (name.trim().startsWith("[") && name.trim().endsWith("]")) {
      units.push({
        nodeName: name.trim().slice(1, -1),
        unit: value,
      });
      continue;
    }

    if (hasOperator(parts[1])) {
      // Calculation Node
      //console.log("calc");
      const substrings = value.split(
        new RegExp(
          `\\s*(${allowableOperators
            .map((operator) => `\\${operator}`)
            .join("|")})\\s*`
        )
      );
      let tempCalcNode: TempNode = {
        nodeName: name,
        children: [],
        operators: [],
        unit: "",
      };
      for (let i = 0; i < substrings.length; i++) {
        const element = substrings[i].trim();
        if (i % 2 == 0) {
          // new node
          if (hasOperator(element)) {
            throw new Error(`${element} should not contain any operators`);
          }
          tempCalcNode.children.push(element);
        } else {
          // operator
          if (!hasOperator(element)) {
            throw new Error(`${element} is not a valid operator`);
          }
          tempCalcNode.operators.push(element);
        }
      }
      calcNodes.push(tempCalcNode);
    } else {
      // Leaf Node
      //   console.log("input");
      // Check the string to the right is a number

      // Check for input context
      if (value.trim().startsWith("[") && value.trim().endsWith("]")) {
        // Input
        const regex = /[+-]?\d+(\.|\,\d+)?/g;
        const matches = value.match(regex);
        console.log("input value detected");
        if (matches !== null) {
          nodes.push(
            new InputNode(name, "", "", ...matches.map((m) => parseFloat(m)))
          );
        }
      } else if (isNaN(Number(value))) {
        // Actually, could be a x = y; y = 1 + 2 situation
        calcNodes.push({
          nodeName: name,
          children: [value],
          operators: [],
          unit: "",
        });
        //throw new Error(`${value} is not a valid value for ${name}`);
      } else {
        nodes.push(new StaticNode(name, "", "", Number(value)));
      }
      //nodes.push(new InputNode(name, "", "operator", ))
    }
  }

  //console.debug("CALCS", calcNodes);
  //console.debug("INPUTS", nodes);

  // Add units
  for (let i = 0; i < calcNodes.length; i++) {
    for (let j = 0; j < units.length; j++) {
      if (units[j].nodeName == calcNodes[i].nodeName) {
        calcNodes[i].unit = units[j].unit;
      }
    }
  }
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < units.length; j++) {
      if (nodes[i].name == units[j].nodeName) {
        nodes[i].unit = units[j].unit;
      }
    }
  }

  let topNode: CalculationNode | undefined;
  // Create structure

  function addChildren(
    parentNode: CalculationNode,
    node: TempNode,
    calcNodes: TempNode[]
  ) {
    // Find referenced node in either nodes or inside tree already
    for (let j = 0; j < node.children.length; j++) {
      const childName = node.children[j];
      const childLeafNodes = nodes.filter((cn) => cn.name == childName);
      const childCalcNodes = calcNodes.filter((cn) => cn.nodeName == childName);
      //console.log("Child node of", n.nodeName, childName, childNodes);
      if (childLeafNodes.length + childCalcNodes.length != 1) {
        throw new Error(
          `${
            childLeafNodes.length + childCalcNodes.length
          } instances of ${childName} defined`
        );
      }
      const childOperator = j == 0 ? "" : node.operators[j - 1];
      if (childLeafNodes.length == 1) {
        childLeafNodes[0].operator = childOperator;
        parentNode.addChild(childLeafNodes[0]);
      } else {
        const childCalc = childCalcNodes[0];
        const childNode = new CalculationNode(
          childCalc.nodeName,
          childCalc.unit,
          childOperator
        );
        addChildren(childNode, childCalc, calcNodes);
        parentNode.addChild(childNode);
      }
    }
  }

  // TODO: use tempNodes to create multiple trees and push them together
  //const tempNodes = [];
  for (let i = 0; i < calcNodes.length; i++) {
    const n = calcNodes[i];
    if (i == 0) {
      topNode = new CalculationNode(n.nodeName, n.unit);
      addChildren(topNode, n, calcNodes);
      //topNode.addChild()
    } else {
      // check if already in calculation tree
      /*
      if (topNode && !topNode.contains(n.nodeName)) {
        console.log(n.nodeName, "not contained");
        // If not, this is new topNode
        //tempNodes.push(topNode);
        topNode = new CalculationNode(n.nodeName);
        addChildren(topNode, n, calcNodes);
      }
      */
    }
  }

  // Log the resulting objects to the console
  //console.log(nodes);
  //console.log(topNode);
  return topNode;
}

export const sampleTreeComplex = `
Profit =  Sales - COGS - Expenses
[Profit] = USD
Sales =  Widgets sold * Price per widget
[Sales] = USD
Widgets sold = [1000; 0; 10000; 100]
Price per widget = [65]
[Price per widget] = USD
COGS =  Direct costs + Labor
[COGS] = USD
Direct costs =  Materials
[Direct costs] = USD
Materials = [1000]
[Materials] = USD
Labor =  Hours * Rate
[Labor] = USD
Hours = [100]
[Hours] = Hours
Rate = [50]
[Rate] = USD/hour
Expenses =  Marketing + Salaries
[Expenses] = USD
Marketing =  Online ads
[Marketing] = USD
Online ads =  Clicks * Cost per click
[Online ads] = USD
Clicks = [8000]
[Clicks] = clicks
Cost per click = 0.5
[Cost per click] = USD
Salaries =  Management + Staff
[Salaries] = USD
Management =  Managers * Salary per manager
[Management] = USD
Managers = [3]
Salary per manager = [3000]
[Salary per manager] = USD
Staff =  Employees * Salary per employee
[Staff] = USD
Employees = [10]
[Employees] = USD
Salary per employee = [2500]
[Salary per employee] = USD
`;

/*const input =
    //    "X = A - B + Big value\nA = 3\nB = 2\nBig value = C * D\nC=4\nD=5";
    `
Profit =  Sales - COGS - Expenses
[Profit] = USD
Sales =  Widgets sold * Price per widget
[Sales] = USD
Widgets sold = [1000; 0; 10000; 100]
Price per widget = [65]
[Price per widget] = USD
COGS =  Direct costs + Labor
[COGS] = USD
Direct costs =  Materials
[Direct costs] = USD
Materials = [1000]
[Materials] = USD
Labor =  Hours * Rate
[Labor] = USD
Hours = [100]
[Hours] = Hours
Rate = [50]
[Rate] = USD/hour
Expenses =  Marketing + Salaries
[Expenses] = USD
Marketing =  Online ads
[Marketing] = USD
Online ads =  Clicks * Cost per click
[Online ads] = USD
Clicks = [8000]
[Clicks] = clicks
Cost per click = 0.5
[Cost per click] = USD
Salaries =  Management + Staff
[Salaries] = USD
Management =  Managers * Salary per manager
[Management] = USD
Managers = [3]
Salary per manager = [3000]
[Salary per manager] = USD
Staff =  Employees * Salary per employee
[Staff] = USD
Employees = [10]
[Employees] = USD
Salary per employee = [2500]
[Salary per employee] = USD
`;
  const simplerTree = `
Profit = Sales - COGS 
Sales = Widgets sold * Price
COGS = Direct costs + Labor
Direct costs = Materials
Labor = Hours * Rate

Widgets sold = [1000] 
Price = [6]
Materials = 1000
Hours = 100
Rate = 50

[Sales] = USD
[Profit] = USD
[COGS] = USD
[Widgets sold] = #
[Price] = USD/widget
[Direct costs] = USD
[Labor] = USD
[Materials] = USD
[Hours] = #
[Rate] = USD/hour
`;
*/

import {
  CalculationNode,
  InputNode,
  nodeToText,
  StaticNode,
  updateView,
} from "./nodes";
import ParseVDT from "./parser";

export const parsed = ParseVDT();
updateView(parsed);
/*
const profit = new CalculationNode("Profit", "USD");

const sales = new CalculationNode("Sales", "USD");
const cogs = new CalculationNode("COGS", "USD", "-");
const expenses = new CalculationNode("Expenses", "USD", "-");
const marketing = new CalculationNode("Marketing", "USD");
const salaries = new CalculationNode("Salaries", "USD", "+");
sales.addChild(new InputNode("Widgets sold", "", "", 1000, 0, 10000, 100));
sales.addChild(new InputNode("Price per widget", "USD", "*", 65));
cogs
  .addChild(
    new CalculationNode("Direct costs", "USD").addChild(
      new InputNode("Materials", "USD", "", 1000)
    )
  )
  .addChild(
    new CalculationNode("Labor", "USD", "+")
      .addChild(new InputNode("Hours", "Hours", "", 100))
      .addChild(new InputNode("Rate", "USD/hour", "*", 50))
  );
marketing.addChild(
  new CalculationNode("Online ads", "USD")
    .addChild(new InputNode("Clicks", "clicks", "", 8000))
    .addChild(new StaticNode("Cost per click", "USD", "*", 0.5))
);
salaries.addChild(
  new CalculationNode("Management", "USD")
    .addChild(new InputNode("Managers", "", "", 3))
    .addChild(new InputNode("Salary per manager", "USD", "*", 3000))
);
salaries.addChild(
  new CalculationNode("Staff", "USD", "+")
    .addChild(new InputNode("Employees", "USD", "", 10))
    .addChild(new InputNode("Salary per employee", "USD", "*", 2500))
);
expenses.addChild(marketing);
expenses.addChild(salaries);
profit.addChild(sales);
profit.addChild(cogs);
profit.addChild(expenses);
//updateView(profit);
console.log(nodeToText(parsed));

//export default updateView(profit);

*/

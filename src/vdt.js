var NodeValue = /** @class */ (function () {
    function NodeValue(value, minValue, maxValue, step) {
        if (value === void 0) { value = null; }
        this.value = value;
        this.minValue = minValue || 0;
        this.maxValue = maxValue || value * 2;
        this.step = step || value / 5;
    }
    return NodeValue;
}());
var VDTNode = /** @class */ (function () {
    function VDTNode(name, unit, operator, input, children) {
        if (unit === void 0) { unit = null; }
        if (operator === void 0) { operator = null; }
        if (input === void 0) { input = null; }
        if (children === void 0) { children = []; }
        this.name = name;
        this.input = input;
        this.operator = operator;
        this.unit = unit;
        this.children = children;
        this.value = input;
    }
    VDTNode.prototype.getValue = function () {
        return this.input ? this.input.value : this.value;
    };
    VDTNode.prototype.addChild = function (node) {
        this.children.push(node);
    };
    VDTNode.prototype.calculateValue = function () {
        if (this.children.length === 0) {
            this.value = this.input.value;
            return this;
        }
        var total = 0;
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            var childValue = child.calculateValue().getValue();
            if (child.operator == null && i == 0) {
                total = childValue;
            }
            else if (child.operator === "+") {
                total += childValue;
            }
            else if (child.operator === "-") {
                total -= childValue;
            }
            else if (child.operator === "*") {
                total *= childValue;
            }
            else if (child.operator === "/") {
                total /= childValue;
            }
        }
        this.value = total;
        //console.log(this.name, this.value);
        return this;
    };
    return VDTNode;
}());
/*
function renderTree(node) {
  const li = document.createElement("li");
  li.textContent = `${node.name}:\t\t${node.value.toLocaleString()} ${
    node.unit
  }`;

  if (node.children.length > 0) {
    const ul = document.createElement("ul");
    for (const child of node.children) {
      ul.appendChild(renderTree(child));
    }
    li.appendChild(ul);
  }

  return li;
}
*/
var container = document.getElementById("tree-container");
var profit = new VDTNode("Profit", "USD");
function updateView(node) {
    container.innerHTML = "";
    renderNode(node.calculateValue(), container);
}
function renderNode(node, parentEl) {
    var li = document.createElement("li");
    li.textContent = "".concat(node.name, ": ").concat(node.getValue().toLocaleString(), " ").concat(node.unit);
    parentEl.appendChild(li);
    if (node.children.length > 0) {
        var ul = document.createElement("ul");
        li.appendChild(ul);
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
            this.renderNode(child, ul);
        }
    }
    else {
        var inputWrapper = document.createElement("div");
        //inputWrapper.className = "input-wrapper";
        li.appendChild(inputWrapper);
        var input_1 = document.createElement("input");
        input_1.type = "text";
        input_1.value = node.getValue();
        input_1.onchange = function () {
            var newValue = parseFloat(input_1.value.replace(/,/g, ""));
            if (!isNaN(newValue)) {
                node.input.value = newValue;
                //node.calculateValue();
                //this.render(this.rootNode);
                updateView(profit);
            }
        };
        inputWrapper.appendChild(input_1);
        var slider_1 = document.createElement("input");
        slider_1.type = "range";
        slider_1.min = node.input.minValue;
        slider_1.max = node.input.maxValue;
        slider_1.step = node.input.step;
        slider_1.value = node.getValue();
        slider_1.onchange = function () {
            input_1.value = slider_1.value;
            var newValue = parseFloat(slider_1.value);
            node.input.value = newValue;
            //node.calculateValue();
            //this.render(this.rootNode);
            updateView(profit);
        };
        inputWrapper.appendChild(slider_1);
    }
}
var sales = new VDTNode("Sales", "USD");
var cogs = new VDTNode("COGS", "USD", "-");
var expenses = new VDTNode("Expenses", "USD", "-");
var marketing = new VDTNode("Marketing", "USD");
var salaries = new VDTNode("Salaries", "USD", "+");
sales.addChild(new VDTNode("Widgets sold", "", null, new NodeValue(1000)));
sales.addChild(new VDTNode("Price per widget", "USD", "*", new NodeValue(6)));
cogs.addChild(new VDTNode("Direct costs", "USD", "+", null, [
    new VDTNode("Materials", "USD", null, new NodeValue(1000)),
    new VDTNode("Labor", "USD", "+", null, [
        new VDTNode("Hours", "Hours", null, new NodeValue(100)),
        new VDTNode("Rate", "USD/hour", "*", new NodeValue(50)),
    ]),
]));
marketing.addChild(new VDTNode("Online ads", "USD", null, null, [
    new VDTNode("Clicks", "clicks", null, new NodeValue(8000)),
    new VDTNode("Cost per click", "USD", "*", new NodeValue(0.5)),
]));
/*
salaries.addChild(
  new VDTNode("Management", "USD", null, "+", "USD", [
    new VDTNode("Managers", "", 3, null, ""),
    new VDTNode("Salary per manager", "USD", 5000, "*", "USD"),
  ])
);
salaries.addChild(
  new VDTNode("Staff", "USD", null, "+", "USD", [
    new VDTNode("Employees", "USD", 10, null, "USD"),
    new VDTNode("Salary per employee","USD",  2000, "*", "USD"),
  ])
);
*/
expenses.addChild(marketing);
//expenses.addChild(salaries);
profit.addChild(sales);
profit.addChild(cogs);
profit.addChild(expenses);
updateView(profit);

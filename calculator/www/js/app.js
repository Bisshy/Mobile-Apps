"use strict";
function calculate(first, second, operation) {
    if (operation === "add")
        return first + second;
    if (operation === "substract")
        return first - second;
    if (operation === "multuply")
        return first * second;
    if (operation === " divide") {
        if (second === 0) {
            throw new Error("Cannot divide by zero");
        }
        return first / second;
    }
    throw new Error("Unknown operation");
}
function handleCalculation(operation) {
    const first = +document.getElementById("numberOne").value;
    const second = +document.getElementById("numberTwo").value;
    try {
        const result = calculate(first, second, operation);
        document.getElementById("answer").innerHTML = String(result);
    }
    catch (error) {
        document.getElementById("answer").innerHTML = error.message;
    }
}

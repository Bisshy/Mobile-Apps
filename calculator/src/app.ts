function calculate(
    first: number,
    second: number,
    operation: string
): number {
    
    if(operation === "add") return first + second;
    if(operation === "substract") return first - second;
    if(operation === "multuply") return first * second
    if(operation === " divide"){
        if(second === 0){
            throw new Error("Cannot divide by zero");
        }
        return first/second
    }
    throw new Error("Unknown operation")
}

function handleCalculation(operation:string): void{
    const first: number = +(document.getElementById("numberOne") as HTMLInputElement).value;
    const second: number = +(document.getElementById("numberTwo") as HTMLInputElement).value;

    try {
        const result = calculate(first, second, operation);
        document.getElementById("answer")!.innerHTML = String(result);
    }catch(error){
        document.getElementById("answer")!.innerHTML = (error as Error).message
    }
   
}

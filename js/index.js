/*
  Calculator function takes the button pressed
  as an argument and returns a calculation object,
  which holds both the problem and solution as strings

  This allows for a two-line calculator display
*/
var Calculator = function() { // this is an IIFE
    
  // variables to hold the state of the calculator
    
  var probArray = []; // - the problem stored as an array
  /*
    numbers are stored as subarrays, to make it
    easier to add and delete single digits
        
    e.g [['1','2'],'+', ['2','1']] for 12+21
  */
    
  var parenBalance = 0; // used to keep the balance of parentheses
  /*
    parenBalance = 0 when the number of '(' and ')' are equal
    parenBalance > 0 when the number of '(' > ')'
    parenBalance < 0 is not allowed, because '(' < ')' is
    not able to be evaluated
  */
    
  var equalsPressed = false; // - whether equals was the previous button pressed
  var calculation = { // the returned object
    problem: '',
    solution: ''
  };

  return function(button) { // the function stored in Calculator
    // button determines the changes made to probArray
    // helper functions explained at their declaration
    switch (button) {
      case '=':
        // since the solution is tracked at all times
        // equals only has to copy it to the probArray
        probArray = [[calculation.solution]];
        break;
      case 'AC':
        reset();
        break;
      case '←':
        probArray = popFrom(probArray);
        break;
      case '(':
        probArray = parenOpen(probArray);
        break;
      case ')':
        probArray = parenClose(probArray);
        break;
      default: // for all numbers and operators
        probArray = pushTo(probArray,button);
    }
        // store whether '=' was pressed or not
        if (button === '=') {
            equalsPressed = true;
        } else {
            equalsPressed = false;
        }
        // problem is evaluated to a solution after every button press
        evaluate(probArray,calculation);
        return calculation; // problem and solution returned in object
    };
    
  // reset(): resets the state variables
  // equalsPressed is reset by the main function
  function reset() {
    probArray = [];
    parenBalance = 0;
    calculation = {
      problem: '',
      solution: ''
    };   
  }
    
  // popFrom(arr): deletes the last item from the problem array
  function popFrom(arr) {
    // if the last item is a number, then only its last digit is deleted
    if (isLastNum(arr)) {
      var lastItem = arr[arr.length-1];
      lastItem.pop();
      if (lastItem.length === 0) {
        arr.pop();
      }
    }
    else {
      arr.pop();
    }
    return arr;
  }
    
  // parenOpen(arr): adds '(' to the problem array
  function parenOpen(arr) {
    // if equals was the last button pressed, replace the probArray
    if (equalsPressed) {
      arr = [];
    }
    if (!isLastNum(arr)) { // only if last item is not a number
      arr.push('(');
      parenBalance++; // keeping track of parentheses
    }    
    return arr;
  }
    
  // parenClose(arr): adds ')' to the problem array
  function parenClose(arr) {
    if (parenBalance > 0) { // only if there is a matching '('
      arr.push(')');
      parenBalance--; // keeping track of parentheses
    }
    return arr;
  }
    
  // pushTo(arr, item): adds numbers and operators to the problem array
  function pushTo(arr,item) {
    var lastItem = arr[arr.length-1]; // simplifies the code
    // if item is a number (or decimal point)
    // handle it with the pushNumber function
    if (!isNaN(item) || item === '.') {
      arr = pushNumber(item,arr);
    } 
    // if the last item is a number or ')', simply push the item to probArray
    else if (isLastNum(arr) || lastItem === ')') {
      arr.push(item);
    } 
    // special handling of '-' since it doubles as subtraction and negative
    // '--' becomes '+' and '+-' becomes '-'
    else if (item === '-' && lastItem === '-') {
      arr[arr.length-1] = '+';  
    } else if (item === '-' && lastItem !== '+') {
      arr.push(item);
    } 
    // otherwise replace the previous operator
    else {
      arr[arr.length-1] = item;
    }
    return arr;
  }
    
  // isLastNum(arr): tests to see if the last item in the probArray is a number
  function isLastNum(arr) {
    // since numbers are stored as subarrays
    return Array.isArray(arr[arr.length-1]);
  }
    
  // pushNumber(num, arr): pushes a number to the probArray
  function pushNumber(num, arr) {
    // if equals was the last button pressed, replace the probArray
    if (equalsPressed) {
      arr = [];
    }
        
    // if the last item on probArray is not a number, begin one
    if (!isLastNum(arr)) {
      arr.push([]);
    }
    numArr = arr[arr.length-1]; // simplifies the code
        
    // special handling of '.'
    if ( num === '.') {
      // ignore if the last number already has a '.'
      if ( ~numArr.indexOf('.')) {
        return arr;
      } 
      // if '.' is beginning of number, add a '0' in front of it 
      else if (numArr.length === 0) {
        numArr.push('0');
      }
    }
    numArr.push(num); // push the number to the subarray
    return arr;
  }
    
  // evaluate(arr, obj): evaluates the problem
  function evaluate(arr, obj) {
    // join probArray into a string, with no commas
    obj.problem = arr.join('').replace(/\,/g, '');
    // try...catch for debugging purposes
    try {
      // turn probArray in a solved string
      // willEval explained below
      obj.solution = String(eval(willEval(arr)));
    }
    catch (err) {
      console.log(err.message);
    }
    return obj;
  }
    
  // willEval(arr): turns probArray into a string
  // that is solvable by eval
  function willEval(arr) {
        
    // variables used temporarily to assist in process
        
    // popped and tempPopped work together to hold any trailing operators
    var popped = [];
    var tempPopped = "";
        
    // manipulate the parenBalance value without changing state of calculator
    var tempParenBalance = parenBalance;
        
    // string must end in either a number or ')'
    while (!isLastNum(arr) && arr[arr.length-1] !== ')') {
      // if not, remove the trailing operators
      tempPopped = arr.pop();
      // if a '(' is removed, we don't want to add a ')' for it
      if (tempPopped === '(') {
        tempParenBalance--;
      }
      // store removed operators in a stack
      popped.push(tempPopped);
      // stop if the array is empty
      if (!arr.length) {
        break;
      }
    }
        
    // join array into a string, with no commas
    str = arr.join('').replace(/\,/g, '');
        
    // since string is already made, put removed operators back on the probArray
    while ( popped.length > 0 ) {
      arr.push(popped.pop());
    }
        
    // replace multiply and divide with ones eval will recognize
    str = str.replace(/÷/g, '/');
    str = str.replace(/×/g, '*');
        
    // add a ')' for each unmatched '('
    for (var i = 0; i < tempParenBalance; i++) {
      str += ')';
    }
        
    // make sure a blank string will eval to a blank string
    if (str === '') {
      return '""';
    }
    return str;
  }
}(); // invoke the IIFE

/*
  With that out of the way, the jQuery needed
  to handle the interface is simple
*/
$(document).ready(function() {
  
  /*
    when a button is clicked, send its text to 
    the Calculator and update the displays
    with the returned strings
  */
  $('button').click(function() {
    calculation = Calculator($(this).text());
    $('#problem').val(calculation.problem);
    $('#solution').val(calculation.solution);
  });
  
});
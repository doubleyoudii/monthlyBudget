
//```````````````````````Budget Controller````````````````````````````````````````````````````````
var budgetController = (function(){

  //Function Constructor
  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1

  };
  Expense.prototype.calculatePercentage = function(totalIncome){
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome)*100);
    } else {
      this.percentage = -1;
    }
    
  };
  Expense.prototype.getPercentage = function (){
    return this.percentage;
  }

  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;

  };

  var calculateTotal = function (type){
    var sum = 0;

    data.allItems[type].forEach(function(cur){
      sum += cur.value;

    });

    data.totalItems[type]= sum;
  };

  //Storing Variables
  var data = {

    allItems : {
      exp : [],
      inc : [],
    },
    
    totalItems : {
      exp : 0,
      inc : 0
    },
    budget : 0 , percentage : -1
    
  };


  return {

    addItem : function (type, descrip, valU){

      var newItem, ID;


      //Create Unique ID for every new Item that you make
      if (data.allItems[type].length > 0 ){
        ID = data.allItems[type][data.allItems[type].length-1].id +1;
      } else {
        ID = 0;
      }
      
      //Create new Item depends on its type
      if (type === "exp") {
        newItem = new Expense(ID, descrip, valU);

      } else if (type === "inc") {
        newItem = new Income(ID, descrip, valU);
      }

      //pushes that item to its specific array or type
      data.allItems[type].push(newItem);

      //returns the item in the cloud -_-
      return newItem;

    },
    deleteItem  : function (type, id) {

      var ids = data.allItems[type].map(function(current){
        return current.id
      });

      var index = ids.indexOf(id);

      if (index !== -1){
        data.allItems[type].splice(index, 1);
      }

    },

    calculateBudget : function (){

      //Calculate income and expense
      calculateTotal("exp");
      calculateTotal("inc");

      // calculate the budget 
      data.budget = data.totalItems.inc - data.totalItems.exp;
      // Calculate the percentage
      if (data.totalItems.inc > 0) {
        data.percentage = Math.round((data.totalItems.exp / data.totalItems.inc) * 100);
      } else {
        data.percentage = -1
      };
      
    },

    calculatePercentage : function (){
      data.allItems.exp.forEach(function(cur){
        cur.calculatePercentage(data.totalItems.inc)
      })
    },

    getPercentage : function(){
      var allPec = data.allItems.exp.map(function(cur){
        return cur.getPercentage();
      });
      return allPec;
    },

    getBudget : function(){
      return {
        budget : data.budget,
        totalInc : data.totalItems.inc,
        totalExp : data.totalItems.exp,
        percentage : data.percentage
      };
    },

    testing : function (){
      console.log(data);
    }

  };

})();


//```````````````````````UI Controller```````````````````````````````````````````````````````````

var UIController = (function(){

  //some code
  //Kaya nilagay sa STRINGS para kapag i-eedit, hindi na kelangan pumunta pa sa ibang parts ng code
  var DOMstrings = {
    inputType : ".add__type",
    inputDescription : ".add__description",
    inputValue : ".add__value",
    inputBtn : ".add__btn",
    incomeContainer : ".income__list",
    expensesContainer : ".expenses__list",
    bugetLabel : ".budget__value",
    incomeLabel : ".budget__income--value",
    expensesLabel : ".budget__expenses--value",
    percentageLabel : ".budget__expenses--percentage",
    container : ".container",
    expPerc : ".item__percentage",
    dateLabel : ".budget__title--month"
  };

  var formatNumber = function(num, type){
    var numSplit, int, dec, type;
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3){
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3); 
    }

    dec = numSplit[1];

    return (type === "exp" ? "-": "+") + " " + int + "." + dec;

  };

  var nodeListForEach = function(list, callback){
    for (var i = 0; i < list.length; i++ ){
      callback(list[i], i);
    }
  };

  ////// returning OBJECTS >> function with return >>> produce method that can be available to the other modules
  return {
    getInput : function (){ //accept the input in the DOM
      return {
        type : document.querySelector(DOMstrings.inputType).value,
        description : document.querySelector(DOMstrings.inputDescription).value,
        value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    }, //Beware sa kuwit. remember you are returning a objects

    addListItem : function (obj, type){ //Prints data in the DOM
      var html, newHTML, element;
      //1. Create html string with place holder (sa case natin, na build na sya)

      if (type === "inc"){
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'; 

      } else if (type === "exp"){
        element = DOMstrings.expensesContainer;

        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

      };

      //2. replace the placeholder with the actual  data
      newHTML = html.replace("%id%", obj.id);
      newHTML = newHTML.replace("%description%", obj.description);
      newHTML = newHTML.replace("%value%", formatNumber(obj.value, type));

      //3. isert that file in to the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);
      
    },
    deleteListItem: function (selectedId){

      var el = document.getElementById(selectedId);
      el.parentNode.removeChild(el);
    },

    clearField : function (){ //Erased all the input fields
      var field, fieldArr;

      field = document.querySelectorAll(DOMstrings.inputDescription + "," + DOMstrings.inputValue);
      fieldArr = Array.prototype.slice.call(field);

      fieldArr.forEach(function(current, index, array ) {
        current.value = "";
      });

      fieldArr[0].focus(); // Transfer the focus in the description

    },

    showBudget : function(obj) {
      var type;
      obj.budget > 0 ? type = "inc": type = "exp";
      // if (obj.budget > 0){
      //   type === "inc";
      // } else {
      //   type === "exp"
      // } 

      document.querySelector(DOMstrings.bugetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage+ "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "----";
      }
      
    },

    displayPercentage : function(percentages) {

      var fields = document.querySelectorAll(DOMstrings.expPerc);
          //loop for nodeList!! can be reuse.
      // var nodeListForEach = function(list, callback){
      //   for (var i = 0; i < list.length; i++ ){
      //     callback(list[i], i);
      //   }
      // };
        
      nodeListForEach(fields, function(current, index){
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
        
      });


    },

    displayDate : function (){

      var now, month, months, year;

      now = new Date();

      months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      month = now.getMonth();

      year = now.getFullYear();

      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;


    },

    changeType : function (){

      var fields = document.querySelectorAll(
        DOMstrings.inputType + "," + 
        DOMstrings.inputDescription + "," + 
        DOMstrings.inputValue
      );
      
      nodeListForEach(fields, function (cur){
        cur.classList.toggle("red-focus");
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");

    },

    getDomStrings : function(){ 
      return DOMstrings;
    }

  }

})();



//```````````````````````Global Controller```````````````````````````````````````````````````````````

var controller = (function (bdgtCtrlr, uiCtrlr){

  var setUpEventListener = function (){

    var DOM = uiCtrlr.getDomStrings();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function(event){
      if (event.keyCode === 13 || event.which === 13){
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener("change", uiCtrlr.changeType);

  };

  var updateBudget = function (){
    // 4. Calculate budget
    bdgtCtrlr.calculateBudget();

    //4.5 retun vbudget
    var budget = bdgtCtrlr.getBudget();

    // 5. update Ui
    uiCtrlr.showBudget(budget);
  };

  var updatePercentage = function (){

    //calculate Percentage
    bdgtCtrlr.calculatePercentage();
    // update percentage
    var percentages = bdgtCtrlr.getPercentage();
    // update UI
    uiCtrlr.displayPercentage(percentages);
  };

  var ctrlAddItem = function (){

    
      // ```````````Todo List```````````````
    // 1. Get input Values
    var input = uiCtrlr.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0){
      // 2. Add New item in Data Structure

      var newItem  = bdgtCtrlr.addItem(input.type, input.description, input.value)

      // 3. Add new item in UI
      uiCtrlr.addListItem(newItem, input.type);

      // 3.5 clear Input Fields
      uiCtrlr.clearField();


      updateBudget();

      updatePercentage();

    }

  };

  var ctrlDeleteItem = function (event){
    var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    var splitID, type, ID;

    if (itemID){

      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);


      // 1. delete the item from the data Structure
      bdgtCtrlr.deleteItem(type, ID);
      // 2. delete item from the ui
      uiCtrlr.deleteListItem(itemID);
      // 3. Update and show the new budget
      updateBudget();

      updatePercentage();
    }

  };


  return {
    init : function (){
      console.log("Application started");
      uiCtrlr.displayDate();
      uiCtrlr.showBudget({budget : 0,
        totalInc : 0,
        totalExp : 0,
        percentage : -1});
      setUpEventListener();
    }
  };

  


  
})(budgetController, UIController);



controller.init();
























































































// categories is the main data structure for the app; it looks like this:
const jepUrl = "https://jservice.io/api/";
const numCats = 6;
const numClues = 5;
let categories = [];
const spinContainer = $('#spin-container')

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() { // says function is async so it knows its calling an api
  try { //try catch setup in case of api 404 error
    let response = await axios.get(`https://jservice.io/api/categories?count=100`); //tells it to wait for the response
    let catIds = response.data.map(cat => cat.id); //tells it that we want the response data in an array format and we want the ids with it
    return _.sampleSize(catIds, numCats); // uses the samplesize from the lodash library to return 6 random catagories
  } catch {
    console.log('error retrieving catagory id number')
  }
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) { //async function so it can get things from the URL (saying we want the catagory ids)
  let response = await axios.get(`${jepUrl}category?id=${catId}`); //use the catagory number to select catagory based on id num
  let catagory = response.data; //create a variable for the response data to be stored in
  let questionClues = catagory.clues; // create a variable for the clues
  let randomClues = _.sampleSize(questionClues, numClues); // select five random clues from the returned array
  let clues = randomClues.map(c => ({ //create an object to be returned that includes the question, answer, and showing null
    question: c.question,
    answer: c.answer,
    showing: null,
  }));

  return {
    title: catagory.title,
    clues
  }; //return object with catagory set as title
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  $("#jeopardy thead").empty(); //start with an empty head
  let $tr = $("<tr>"); // creating a variable from the tr on html side that places a question mark in its place
  for (let catIdx = 0; catIdx < numCats; catIdx++) { //create a reader to read the cats
    $tr.append($("<th>").text(categories[catIdx].title)); // append cats into the table heads
  }
  $("#jeopardy thead").append($tr); // append the table head with our fresh new cats

  $("#jeopardy tbody").empty(); // start with an empty table
  for (let clueIdx = 0; clueIdx < 5; clueIdx++) { //sets up a reader for the clues
    let $tr = $("<tr>"); // creates a variable to store the tr data from the html side
    for (let catIdx = 0; catIdx < 6; catIdx++) { // creates a reader to iterate over the clue index
      $tr.append($("<td>").attr("id", `${catIdx}-${clueIdx}`).text("?")); // appends the table data and gives it an id attribure of the cat and clue indexs
    }
    $("#jeopardy tbody").append($tr); // appends the table data to the table row
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    let id = evt.target.id; //event handler for target thats clicked
  let [catId, clueId] = id.split("-"); //creates a variable fpr the id tiles
  let clue = categories[catId].clues[clueId]; // creates the clue varibles

  let tile = ""; // sets us up with an empty "tile" to push info into

  if (!clue.showing) { //if the clue isnt whats showing it should be showing the question
    tile = clue.question;
    clue.showing = "question";
  } else if (clue.showing == "question") { // if the question isnt showing then it should be showing the clue
    tile = clue.answer;
    clue.showing = "answer";
  } else {
    return
  }

  $(`#${catId}-${clueId}`).html(tile); // pushes the cat info to the tiles (clue and catagories)
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() { // gets the spin container and sets the opacity to 100 so its visible
spinContainer.css("opacity", "100");
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() { // hides the load wheel once its loaded
  setInterval(function(){
    spinContainer.css("opacity", "0");
  }, 3000);
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  let catIds = await getCategoryIds(); //get catagory ids form the catIds function once its loaded


  categories = [];

  for (let catId of catIds) { //read the ids and push then into catid
    categories.push(await getCategory(catId));
  }

  fillTable(); // push everythinng to the table
}

$("#restart").on("click", setupAndStart); // when the retart button is clicked, run the startup(thus clearing the board)


$(async function () {
  setupAndStart(); //once restart has been clicked run startup function
  $("#jeopardy").on("click", "td", handleClick); 
  showLoadingView();//show load
  hideLoadingView();// hide load
});
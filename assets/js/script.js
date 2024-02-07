var clickedImgId = '';
var carousel = $('#cover-carousel');
var innerCarousel = $("#innerCarousel");
var defaultCover = "../../images/default-book-cover.png"


pageLoad();

function pageLoad(){
  var defaultAuthor = " "
  if(localStorage.getItem("author")!==null){
    defaultAuthor = localStorage.getItem("author");
  }else{
    defaultAuthor = "Dan Brown"
  }
  fetchAuthorWorks(defaultAuthor);
  searchAuthorName(defaultAuthor);
  fetchRandomDrinkInformation();  
}

function saveAuthorToLocalStorage(author){
  localStorage.setItem("author", author);
}

// Listen for any input that is entered into the search box
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const authorName = document.getElementById('author-search').value;
    saveAuthorToLocalStorage(authorName);
    fetchAuthorWorks(authorName);
    searchAuthorName(authorName);
    fetchRandomDrinkInformation();
    resetPage();
  });
});

// ## Open Library code ##
function searchAuthorName(authorName) {
  const authorAPI = 'https://openlibrary.org/search/authors.json?q=';

  // Fetch author information
  fetch(authorAPI + authorName)
    .then(function (response) {
      return response.json();
    })
    .then(function (authorData) {

      displayAuthorInformation(authorData);
    });
  // Call the function to fetch random drink information
  fetchRandomDrinkInformation();
}

//fetch author works
function fetchAuthorWorks(name) {
  var apiKey = "AIzaSyDtC1WiKcd8r4Tngf5rf4wik_-WLFWrAeo"; 
  const worksQueryUrl = "https://www.googleapis.com/books/v1/volumes?q=inauthor:" +name+ "&langRestrict=en&maxResults=30&key="+apiKey;
  
  fetch(worksQueryUrl)
    .then(function (response) {
      return response.json()
    })
    .then(function (authorWorks) {
      var coversArray = [];
      console.log(authorWorks)
      //create array of objects with keys of book id, book cover thumbnail, 
      //and book title for caption
      for (var i = 0; i < (authorWorks.items).length; i++) {
          var coverObj = {};
          var bookCover = '';
          if("imageLinks" in authorWorks.items[i].volumeInfo){
            bookCover = authorWorks.items[i].volumeInfo.imageLinks.thumbnail;
          }else{
            bookCover = defaultCover;
          }
          var bookId = authorWorks.items[i].id;
          var bookTitle = authorWorks.items[i].volumeInfo.title;
          coverObj.id = bookId;
          coverObj.thumbnail = bookCover;
          coverObj.title = bookTitle;
          coversArray.push(coverObj);  
        }

      displayBookCarousel(coversArray);
      //Handle book cover click event
      carousel.on("click", ".card", function (event) {
        clickedImgId = ($(event.target)).attr('id');
        displayBookDesc(authorWorks.items);
      })
    })
}

function displayBookCarousel(array) {

  if(array.length){
    //create an array of sub-arrays of a length = number of books per carsousel item
  var arrayOfArrays = [];
  var size = 3;
  for (var i = 0; i < array.length; i++) {
    arrayOfArrays.push(array.slice(i, i += size))
  }

  //append carousel items
  for (var j = 0; j < arrayOfArrays.length; j++) {

    var newCarouselItem = $('<div>')
    if(j === 0){
      //set class active for first carousel item
      newCarouselItem.addClass('carousel-item active');
    }else{
      newCarouselItem.addClass('carousel-item');
    }
    //create html for carousel structure and assign values
    var newCardDiv = $('<div>');
    newCardDiv.addClass("card-wrapper")
    newCarouselItem.append(newCardDiv);
    for (var i = 0; i < arrayOfArrays[j].length; i++) {
      var coverUrl = arrayOfArrays[j][i].thumbnail;
      var coverId = arrayOfArrays[j][i].id;
      var newCard = $('<div>');
      newCard.addClass("card book-card");
      var fig = $('<figure>');
      fig.attr('id', 'cover-fig');
      var coverImg = $('<img>');
      coverImg.attr('src', coverUrl);
      coverImg.attr('id', coverId);
      var caption = $('<figcaption>');
      caption.attr('id', 'cover-caption');
      if(coverUrl === defaultCover){
        //set caption as book title for default cover image
        caption.text(arrayOfArrays[j][i].title);
      }else{
        caption.text('');
      }
      fig.append(coverImg);
      fig.append(caption);
      newCard.append(fig);
      newCardDiv.append(newCard);
    }

    innerCarousel.append(newCarouselItem);
    $('#book-desc').text("Click on a book to view its description");
  }
  }else{
    //If no books are returned
    var coverCarousel = $('#cover-carousel');
    coverCarousel.addClass('invisible');
    var bookCol = $('#book-col');
    var newP = $('<p>');
    newP.text("Sorry, no books to display!")
    bookCol.append(newP);
  }  
}

function displayBookDesc(items){

  var bookDescCol = $('#book-desc-col')
  //set all fields to blank to begin with
  $('book-desc-col').children().text("");

  // Fetch book description for clicked image id
  for(var i = 0; i < items.length; i++){
      if(items[i].id === clickedImgId){
        var bookTitle = items[i].volumeInfo.title;
        var bookUrl = items[i].volumeInfo.canonicalVolumeLink;
        var bookDesc = items[i].volumeInfo.description;
          $('#book-title').text(bookTitle);
          $('#book-desc').text(bookDesc);
          $('#book-url').text('View in Google Books')
          $('#book-url').attr("href", bookUrl);
          $('#book-url').attr("target", "_blank");        
        }      
    }
}

function displayAuthorInformation(authorData) {
  // Console log data to work out the data structure
  console.log(authorData);

  // Pull top work of the author into the HTML element
  document.getElementById('top-work').textContent = `Top Work: ${authorData.docs[0].top_work}`;

  var key = authorData.docs[0].key;
  const authorKeyAPI = `https://openlibrary.org/authors/${key}.json`;

// Fetch additional author information using the obtained key
fetch(authorKeyAPI)
  .then(function (response) { 
    return response.json();
  })
  .then(function (authorKey) {
    console.log(authorKey);

    // Check if 'bio' property exists and contains words relating to sources
    let indexOfWords;
    // Search for various words in the bio api section
    if (authorKey.bio.includes('([Source')) {    
      indexOfWords = authorKey.bio.indexOf('([Source');
    } else if (authorKey.bio.includes('[Source')) {      
      indexOfWords = authorKey.bio.indexOf('[Source');
    } else if (authorKey.bio.includes('[Wikipedia')) {      
      indexOfWords = authorKey.bio.indexOf('[Wikipedia');
    } else if (authorKey.bio.includes('<sup>')) {      
      indexOfWords = authorKey.bio.indexOf('<sup>');
    }
    // Remove text after the above words are located    
      authorKey.bio = authorKey.bio.substring(0, indexOfWords);    

    // Display author information on the HTML elements
    document.getElementById('name').textContent = `Author: ${authorKey.name}`;
    document.getElementById('dob').textContent = `Date of Birth: ${authorKey.birth_date}`;
    document.getElementById('bio').textContent = `Bio: ${authorKey.bio}`;
  });
}

function fetchRandomDrinkInformation() {
  var cocktailUrl = "https://thecocktaildb.com/api/json/v1/1/random.php";


  // $("#author-search").on("keypress", function (event) {
  //     if (event.key === "Enter") {
  //       event.preventDefault();

  //       var bookInput = $("#author-search").val().trim();
  //       var cocktailUrl = "https://thecocktaildb.com/api/json/v1/1/random.php";

  //       // Clear previous data and reset the page
  //       resetPage();

  // Fetch random cocktail data
  fetch(cocktailUrl)
    .then(function (response) {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(function (cocktailData) {
      console.log("Cocktail API Response:", cocktailData);
      var drinkName = cocktailData.drinks[0].strDrink;
      var drinkImg = cocktailData.drinks[0].strDrinkThumb;
      var drinkInst = cocktailData.drinks[0].strInstructions;

      // Get all ingredients from cocktailData
      var allIngredients = [];
      cocktailData.drinks.forEach(function (drink) {
        var ingredients = getAllIngredients(drink);
        allIngredients = allIngredients.concat(ingredients);
      });

      console.log("All Ingredients:", allIngredients);

      console.log(drinkName);
      console.log(drinkImg);
      console.log(drinkInst);

      $(".drinkName").text(`Drink name: ${drinkName}`);
      $(".drinkinst").text(`Instruction: ${drinkInst}`);
      $(".drinking").text(`Ingredients: ${allIngredients.join(", ")}`);
      $(".drinkImg").attr("src", drinkImg);

      // Save data to local storage
      saveToLocalStorage({
        drinkName: drinkName,
        drinkInst: drinkInst,
        allIngredients: allIngredients.join(", "),
        drinkImg: drinkImg
      });


    })
    .catch(function (error) {
      console.error("Error fetching cocktail data:", error.message);
    })
    .finally(function () {
      // Clear the search input field
      $("#author-search").val("");
    });

}

// Function to get all ingredients from a drink object
function getAllIngredients(drink) {
  var ingredients = [];
  for (var i = 1; i <= 15; i++) {
    var ingredientKey = "strIngredient" + i;
    var measureKey = "strMeasure" + i;

    if (drink[ingredientKey]) {
      var ingredient = drink[measureKey]
        ? drink[measureKey] + " " + drink[ingredientKey]
        : drink[ingredientKey];
      ingredients.push(ingredient);
    }
  }
  return ingredients;
}

// Function to reset the page
function resetPage() {
  $("#author-search").val(""); // Assuming .drinkImg is the class of your image element
  $('#book-desc-col').children().text('');
  $('#author').children().text('');
  innerCarousel.empty();
}

// Function to save data to local storage
function saveToLocalStorage(data) {
  localStorage.setItem("cocktailData", JSON.stringify(data));
}

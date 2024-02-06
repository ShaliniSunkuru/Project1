// Listen for any input that is entered into the search box
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('search-form').addEventListener('submit', function (event) {
      event.preventDefault();
      const authorName = document.getElementById('author-search').value;
      searchAuthorName(authorName);
      fetchRandomDrinkInformation();
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
        var authorKey = authorData.docs[0].key;
        fetchAuthorWorks(authorKey);
        displayAuthorInformation(authorData);
      });
    // Call the function to fetch random drink information
    fetchRandomDrinkInformation();
  }
  
  //fetch author works
  function fetchAuthorWorks(key) {
    const worksQueryUrl = "https://openlibrary.org/authors/" + key + "/works.json"
    fetch(worksQueryUrl)
      .then(function (response) {
        return response.json()
      })
      .then(function (authorWorks) {
        var coversArray = [];
        for (var i = 0; i < (authorWorks.entries).length; i++) {
          //check if cover ID exists for work
          if ('covers' in authorWorks.entries[i]) {
            var coverToPush = authorWorks.entries[i].covers[0];
            if (coverToPush > 0) {
              coversArray.push(coverToPush);
            }
          }
        }
        displayBookCarousel(coversArray);
      })
  }
  
  
  function displayBookCarousel(array) {
  
    //create an array of sub-arrays of a length = number of books per carsousel item
    var arrayOfArrays = [];
    var size = 3;
    for (var i = 0; i < array.length; i++) {
      arrayOfArrays.push(array.slice(i, i += size))
    }
  
    var innerCarousel = $("#innerCarousel");
    //clear carousel to begin with
    innerCarousel.empty();
    
    //append carousel items
    for (var j = 0; j < arrayOfArrays.length; j++) {
  
  
      var newCarouselItem = $('<div>')
      if(j === 0){
        //set class active for first carousel item
        newCarouselItem.addClass('carousel-item active');
      }else{
        newCarouselItem.addClass('carousel-item');
      }
      
      var newCardDiv = $('<div>');
      newCardDiv.addClass("card-wrapper")
      newCarouselItem.append(newCardDiv);
      for (var i = 0; i < arrayOfArrays[j].length; i++) {
        var coverUrl = "https://covers.openlibrary.org/b/id/" + arrayOfArrays[j][i] + "-M.jpg"
        var newCard = $('<div>')
        newCard.addClass("card book-card")
        var coverImg = $('<img>')
        coverImg.attr('src', coverUrl);
        newCard.append(coverImg);
        newCardDiv.append(newCard);
  
      }
  
      innerCarousel.append(newCarouselItem);
    }
  
  }
  var carousel = $('#cover-carousel');
  carousel.on("click", ".card", function (event) {
    console.log("I'm clicked");
    var clickedImgSrc = ($(event.target)).attr('src');
    //replace all non-numeric character in string with empty string to extract cover ID
    var clickedImgCover = clickedImgSrc.replace(/\D/g, "");
    console.log(clickedImgCover);
    // TO DO: fetch book synopsis from cover id
  })
  
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
        $("#search-input").val("");
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
    $("#search-input").val(""); // Assuming .drinkImg is the class of your image element
  }
  
  // Function to save data to local storage
  function saveToLocalStorage(data) {
    localStorage.setItem("cocktailData", JSON.stringify(data));
  }
  
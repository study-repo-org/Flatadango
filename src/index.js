// API URLs
const movieUrl = " http://localhost:3000/films";
const ticketUrl = " http://localhost:3000/tickets";


// DOM elements
const movieContainer = document.getElementById("films");
const placeholderList = document.querySelector(".film.item");
const buyMovieTickets = document.getElementById("buy-ticket");
const formContainer = document.getElementById("tecket-form");



// Function to fetch movies from the API
const fetchMovies = () => {
  return fetch(movieUrl)
    .then((res) => res.json())
    .catch((error) => {
      console.error("Error fetching movies:", error);
    });
};



// Function to handle submission of ticket form
const handleTicketFormSubmission = () => {
  let ticketForm = document.createElement("form");

  ticketForm.innerHTML = `
  <form id="addForm">
  <p>Add Tickets</p>
  <input type="text" id="filmId" placeholder="Film ID">
  <input type="number" id="numberOfTickets" placeholder="Number of Tickets">
  <button type="submit">Submit</button>
   </form>
  `;
  formContainer.appendChild(ticketForm);

  ticketForm.addEventListener("submit", (e) => {
    // e.preventDefault();
    const filmId = document.getElementById("filmId").value;
    const numberOfTickets = document.getElementById("numberOfTickets").value;
    const data = {
      filmId: filmId,
      numberOfTickets: numberOfTickets
    };

    // post request
    fetch(ticketUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .catch(error => {
      console.error("Error adding ticket:", error);
    });
  });
};
handleTicketFormSubmission();


  
  

// Function to create list item for each movie
const createMovieListItem = (movie) => {
  return `<li class="film item">
    <span class="film item">${movie.title}</span>
     <button class="delete-button" onClick="handleDeleteMovie(${movie.id})">Delete</button>
  </li>`;
}


// Function to fetch and display movies
const displayMovies= () => {
  fetchMovies()
   .then((movies) => {
     if (placeholderList) {
       placeholderList.remove();
     }
     const movieListItems = movies.map((movie) => createMovieListItem(movie)) .join("");
     movieContainer.innerHTML = movieListItems;

     if (movies.length > 0) {
       displayMovieDetails(movies[0]);
     }
   })
   .catch((error) => {
     // error catching if their is
     console.error("Error fetching movies:", error);
   });
};
displayMovies();



// Function to fetch movie details and display them
const displayMovieDetails  = (movie) => {
  const poster = movie.poster;
  const title = movie.title;
  const description = movie.description;
  const runtime = movie.runtime;
  const showtime = movie.showtime;
  const ticketsSold = movie.tickets_sold;
  const capacity = movie.capacity;
  const availableTickets = capacity - ticketsSold;

  // Updating DOM elements with details from the movie
  document.getElementById("poster").src = poster;
  document.getElementById("title").textContent = title;
  document.getElementById("film-info").textContent = description;
  document.getElementById("runtime").textContent = `${runtime} minutes`;
  document.getElementById("showtime").textContent = `${showtime}`;
  document.getElementById("ticket-num").textContent = `${availableTickets}`;
};


// Function to handle click event on movie items
const handleMovieItemClick = (event) => {
  if (event.target.classList.contains("film")) {
    const movieTitle = event.target.textContent;
     fetchMovies()
      .then((movies) => {
        const selectedMovie = movies.find(
          (movie) => movie.title === movieTitle
        );
        if (selectedMovie) {
          displayMovieDetails(selectedMovie);
        } else {
          console.error("Movie not found");
        }
      })
      .catch((error) => {
        console.error("Error fetching movie details:", error);
      });
  }
};


// Function to handle buying movie tickets
// Function to handle buying movie tickets
const handleBuyMovieTickets = (e) => {
  e.preventDefault();
  const movieTitleElement = document.getElementById("title");
  const movieTitle = movieTitleElement.textContent;

  fetch(movieUrl)
    .then((response) => response.json())
    .then((movies) => {
      const getMovie = movies.find((movie) => movie.title === movieTitle);

      if (getMovie) {
        const updatedTicketsSold = getMovie.tickets_sold + 1;

        if (getMovie.capacity - updatedTicketsSold < 0) {
          // Update the button text to "Sold Out"
          buyMovieTickets.textContent = "Sold Out";

          // Adding 'sold-out' class
          const filmItems = document.querySelectorAll('.film.item');
          filmItems.forEach(item => {
            if (item.textContent === movieTitle) {
              item.classList.add('sold-out');
            }
          });
          return;
        }

        fetch(`${movieUrl}/${getMovie.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tickets_sold: updatedTicketsSold }),
        })
        .then(() => {
          // Update the displayed ticket count without reloading the entire movie details
          const availableTicketsElement = document.getElementById("ticket-num");
          const availableTickets = getMovie.capacity - updatedTicketsSold;
          availableTicketsElement.textContent = availableTickets;
          
          // Update the buy button text if tickets are sold out
          if (availableTickets === 0) {
            buyMovieTickets.textContent = "Sold Out";
          }
        })
        .catch((error) => {
          console.error("Error updating movie details:", error);
        });
      } else {
        console.error("Movie not found");
      }    

    })
    .catch((error) => {
      console.error("Error fetching movie details:", error);
    });
};


// Function to handle deleting a movie
const handleDeleteMovie = (id) => {
  fetch(`${movieUrl}/${id}`, {
    method: "DELETE",
  })
  .then(() => {
    // Refresh the movie list after deletion
    displayMovies();
  })
  .catch(error => console.error("Error deleting movie:", error));
};


document.addEventListener("DOMContentLoaded", () => { displayMovies();});
movieContainer.addEventListener("click", handleMovieItemClick);
buyMovieTickets.addEventListener("click", handleBuyMovieTickets);
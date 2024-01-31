// Wait for the HTML content to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Fetch movies and populate the menu
    fetchMovies();

    // Add event listener for Buy Ticket button
    document.getElementById("buyTicketBtn").addEventListener("click", buyTicket);

    // Add event listener for Search Input
    document.getElementById("searchInput").addEventListener("input", filterMovies);
});

// Fetch movies from the server and populate the films menu
async function fetchMovies() {
    const filmsContainer = document.getElementById("films");
    try {
        // Fetch movies data from the server
        const response = await fetch("http://localhost:3000/films");
        const movies = await response.json();

        // Iterate through each movie and create a list item
        movies.forEach(movie => {
            const listItem = document.createElement("li");
            listItem.textContent = movie.title;
            listItem.classList.add("film");
            listItem.dataset.movieId = movie.id;

            // Check if the movie is sold out and add a class accordingly
            if (movie.tickets_sold >= movie.capacity) {
                listItem.classList.add("sold-out");
            }

            // Create delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.classList.add("delete-btn");

            // Add click event to delete button
            deleteBtn.addEventListener("click", (event) => {
                event.stopPropagation(); // Prevents the click event from reaching the film item
                deleteFilm(movie.id);
            });

            // Append delete button to the list item
            listItem.appendChild(deleteBtn);

            // Add click event to the list item to fetch movie details
            listItem.addEventListener("click", () => {
                fetchMovieDetails(movie.id);
            });

            // Append list item to the films container
            filmsContainer.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

// Fetch detailed information about a specific movie
async function fetchMovieDetails(movieId) {
    const detailsContainer = document.getElementById("movie-details");
    try {
        // Fetch movie details from the server
        const response = await fetch(`http://localhost:3000/films/${movieId}`);
        const movieDetails = await response.json();

        // Display movie details in the designated container
        detailsContainer.innerHTML = `
            <div class="movie-container" data-movie-id="${movieDetails.id}">
                <img src="${movieDetails.poster}" alt="${movieDetails.title} Poster" />
                <h2>${movieDetails.title}</h2>
                <p>${movieDetails.description}</p>
                <p>Runtime: ${movieDetails.runtime} minutes</p>
                <p>Showtime: ${movieDetails.showtime}</p>
                <p>Available Tickets: ${movieDetails.capacity - movieDetails.tickets_sold}</p>
            </div>
        `;

        // Add click event to the movie container to buy a ticket
        const movieContainer = detailsContainer.querySelector(".movie-container");
        movieContainer.addEventListener("click", () => {
            buyTicket(movieDetails.id);
        });
    } catch (error) {
        console.error("Error fetching movie details:", error);
    }
}

// Handle the process of buying a movie ticket
async function buyTicket(movieId) {
    try {
        // Fetch movie details from the server
        const response = await fetch(`http://localhost:3000/films/${movieId}`);
        const movieDetails = await response.json();

        // Check if there are available tickets
        if (movieDetails.tickets_sold < movieDetails.capacity) {
            // Update the tickets_sold count on the server
            await fetch(`http://localhost:3000/films/${movieId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tickets_sold: movieDetails.tickets_sold + 1,
                }),
            });

            // Refresh movie details
            fetchMovieDetails(movieId);
        } else {
            // Display a message if the show is sold out
            alert("Sorry, the show is sold out!");
        }
    } catch (error) {
        console.error("Error buying ticket:", error);
    }
}

// Handle the deletion of a film
async function deleteFilm(movieId) {
    try {
        // Delete the film on the server
        await fetch(`http://localhost:3000/films/${movieId}`, {
            method: "DELETE",
        });

        // Remove the film item from the list
        const filmItem = document.querySelector(`[data-movie-id="${movieId}"]`);
        filmItem.remove();
    } catch (error) {
        console.error("Error deleting film:", error);
    }
}

// Filter movies based on the search input
function filterMovies() {
    const searchInput = document.getElementById("searchInput");
    const films = document.querySelectorAll(".film");

    films.forEach(film => {
        const title = film.textContent.toLowerCase();
        const searchQuery = searchInput.value.toLowerCase();

        // Display or hide films based on the search query
        if (title.includes(searchQuery)) {
            film.style.display = "block";
        } else {
            film.style.display = "none";
        }
    });
}

import { getAllUsers, handleOnClick, insertUsersToDOM, getPostsByUserId, getFromLocalStorage } from "./utilties.js";


// Wait for the DOM to be fully loaded before executing the script
document.addEventListener("DOMContentLoaded", () => {
  // Get the main element after the DOM is loaded
    const loader = document.querySelector(".loader");
    const main = document.querySelector("main");

  if (main) {
    // Add event listener to main element
    main.addEventListener("click", handleOnClick);

    // Fetch users and insert them to the DOM
    getAllUsers().then((users) => {
      insertUsersToDOM(users, main);
    });
  } else {
    console.error("Main element not found");
  }
});




const baseURL = "https://jsonplaceholder.typicode.com";




// Function to save to LocalStorage
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Function to read from LocalStorage
export function getFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// Function to create user card HTML
function createUserCard(user) {
  return /*html*/ `
    <article class="card" id="${user.id}">
      <h3 class="name">${user.name}</h3>
      <p class="username">Username: ${user.username}</p>
      <p class="phone">Phone: ${user.phone}</p>
      <p class="email">Email: ${user.email}</p>
    </article>
  `;
}

// Function to create user page HTML
function createUserPage(user) {
  return /*html*/ `
    <section class="user-page">
      <h3 class="name">${user.name}</h3>
      <p class="username">Username: ${user.username}</p>
      <p class="phone">Phone: ${user.phone}</p>
      <p class="email">Email: ${user.email}</p>
      <div class="address">
        <p>City: ${user.address.city}</p>
        <p>Street: ${user.address.street}</p>
      </div>
      <div class="actions">
        <button id="back-btn">Back to user list</button>
      </div>
      <div id="posts-container" style="display: none;">
        <h1>Posts</h1>
        <h4>Posts by:${user.name}</h4>
        <button id="show-posts-btn">Show Posts</button>
        <ul id="post-list"></ul>
      </div>
    </section>
  `;
}

// Get all users from the API or LocalStorage
export async function getAllUsers() {
  const cachedUsers = getFromLocalStorage("users");
  if (cachedUsers) {
    console.log("Users loaded from LocalStorage");
    return cachedUsers;
  }

  insertLoaderToDOM();

  console.log("Fetching users from API...");
  const res = await fetch(`${baseURL}/users`);
  const users = await res.json();

  saveToLocalStorage("users", users);
  return users;
}

export async function getUserById(userId) {
  const cachedUsers = getFromLocalStorage("users");
  
  if (cachedUsers) {
    const user = cachedUsers.find((u) => u.id === userId);
    if (user) return user;
  }

  console.log("Fetching user from API...");
  const res = await fetch(`${baseURL}/users/${userId}`);
  const user = await res.json();

  // Optionally update the cached users in localStorage
  const updatedUsers = cachedUsers ? [...cachedUsers, user] : [user];
  saveToLocalStorage("users", updatedUsers);

  return user;
}


// Get posts by user ID from the API or LocalStorage
export async function getPostsByUserId(userId) {
  const cachedPosts = getFromLocalStorage(`posts_${userId}`);
  if (cachedPosts) {
    console.log("Posts loaded from LocalStorage");
    return cachedPosts;
  }

  console.log("Fetching posts from API...");
  const res = await fetch(`${baseURL}/posts?userId=${userId}`);
  const posts = await res.json();

  saveToLocalStorage(`posts_${userId}`, posts);
  return posts;
}

// Handle showing posts for a user
function handleShowPosts(userId) {
  const postsContainer = document.querySelector("#posts-container");
  const postList = document.querySelector("#post-list");
  const showPostsBtn = document.querySelector("#show-posts-btn");

  if (postsContainer.style.display === "block") {
    postsContainer.style.display = "none";
    showPostsBtn.textContent = "Show Posts";
    postList.innerHTML = ""; // Clear previous content
    return;
  }

  postList.innerHTML = "<div class='loader'></div>"; 
  postsContainer.style.display = "block";

  getPostsByUserId(userId).then((posts) => {
    if (posts.length > 0) {
      postList.innerHTML = posts.map(createPost).join("");
    } else {
      postList.innerHTML = "<li>No posts available for this user.</li>";
    }
    showPostsBtn.textContent = "Hide Posts";
  });
}

// Function to create a post card HTML
function createPost(post) {
  return /*html*/ `
    <li class="post-card">
      <h4 class="title">${post.title}</h4>
      <p class="body">${post.body}</p>
    </li>
  `;
}

// Handle clicking on a user card to show more details
function handleOnCardClick(card) {
  const userId = card.id;
  insertLoaderToDOM();
  getUserById(userId).then((user) => {
    const main = document.querySelector("main");
    main.innerHTML = createUserPage(user);

    const backBtn = document.querySelector("#back-btn");
    const showPostsBtn = document.querySelector("#show-posts-btn");

    backBtn.addEventListener("click", () => {
      getAllUsers().then(users => insertUsersToDOM(users, main));
    });

    showPostsBtn.addEventListener("click", () => {
      handleShowPosts(user.id);
    });
  });
}

// Insert loader in the DOM
function insertLoaderToDOM() {
  const main = document.querySelector("main");
  main.innerHTML = "<div class='loader'></div>";
}

// Insert users into the DOM
export function insertUsersToDOM(users, main) {
  main.innerHTML = users.map(createUserCard).join("");
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", handleOnCardClick);
  });
}

// Handle click event on user card
export function handleOnClick(event) {
  const { target } = event;
  const closestCard = target.closest(".card");
  if (closestCard) handleOnCardClick(closestCard);
}

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady(){
    console.log("device is ready")
}

import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
}
from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDE263dpVp9wmAH39k7oB44rdnTb2LCy2o",
    authDomain: "bincompostapp.firebaseapp.com",
    projectId: "bincompostapp",
    storageBucket: "bincompostapp.firebasestorage.app",
    messagingSenderId: "589150843723",
    appId: "1:589150843723:web:8f199bc34b371609396ece",
    measurementId: "G-VB2DKQJC1Y"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

const apiUrl = "https://public-api.wordpress.com/wp/v2/sites/oakinronbi-zdiym.wordpress.com/posts"; 

const loginScreen = document.getElementById("login-form");
const signUpScreen = document.getElementById("signup-form");
const userScreen = document.getElementById("user-profile");
const showSignUp = document.getElementById("show-signup");
const showLogin = document.getElementById("show-login");
const loginForm = document.getElementById("login");
const loginButton = document.getElementById("login-button");
const signupForm = document.getElementById("signup")
const authMessage = document.getElementById("auth-message");
const signupButton = document.getElementById("signup-button");
const loginMessage = document.getElementById("login-message");
const userEmail = document.getElementById("profile-email");
//const username = document.getElementById("profile-username");
//const phonenumber = document.getElementById("profile-phone");
const logoutButton = document.getElementById("log-out");
const postContainer = document.getElementById("posts");

function switchScreen(screenToShow, ...screenToHide){
  screenToHide.forEach(screen => {
    screen.classList.add("hidden");
  });
  screenToShow.classList.remove("hidden");
}

showSignUp.addEventListener("click", (event)=>{
  event.preventDefault();
  switchScreen(signUpScreen, loginScreen, userScreen);
});

showLogin.addEventListener("click", (event)=>{
  event.preventDefault();
  switchScreen(loginScreen, signUpScreen, userScreen);
});

loginForm.addEventListener("submit", async (event)=>{

  event.preventDefault();
  loginMessage.textContent = "logging in..."
  loginMessage.className = "";
  loginButton.disabled = true;

  const email = document
      .getElementById("loginEmail")
      .value
      .trim();
  const password = document
      .getElementById("loginPassword")
      .value;

  try{
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    

    loginMessage.textContent = "Login successful.";
    loginMessage.classList.add("valid");
    loginForm.reset();

  }catch(error){

    console.error("Firebase Authentication Error:", error);
    loginMessage.textContent = getFriendlyError(error.code);
    loginMessage.classList.add("error");

  }finally{

    loginButton.disabled = false;
  }
});

signupForm.addEventListener("submit", async(event)=>{

  event.preventDefault();

  authMessage.textContent = "please wait..."
  authMessage.className = "";
  signupButton.disabled = true;

  const username = document
      .getElementById("usernameInput")
      .value
      .trim();

  const password = document
      .getElementById("passwordInput")
      .value;

  const email = document
      .getElementById("emailInput")
      .value
      .trim();

  const phone = document
      .getElementById("phoneInput")
      .value
      .trim();

  try{
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    

    authMessage.textContent = "Account created successfully"
    authMessage.classList.add("success");

    signupForm.reset();

  }catch(error){

    console.error("Firebase Authentication Error:", error);
    authMessage.textContent = getFriendlyError(error.code);
    authMessage.classList.add("error");

  }finally{

    signupButton.disabled = false;
  }
})

onAuthStateChanged(auth, (user)=>{
  if(user){
    switchScreen(userScreen, loginScreen, signUpScreen);
    //username.textContent = `${user.username}`
    userEmail.textContent = `${user.email}`;
    //phonenumber.textContent = `${user.phone}`;
  loadPosts()
  }else{
    switchScreen(loginScreen, signUpScreen, userScreen);

    userEmail.textContent = "";
    postContainer.innerHTML = "loading posts..."
  }
});

logoutButton.addEventListener("click", async()=>{
  try{
    await signOut(auth);
  }catch(error){
    console.error("Logout Error:", error)
  }
})

async function loadPosts() {
  postContainer.innerHTML = "<p>Loading posts...</p>"

  try{
    const response = await fetch(apiUrl);

    if(!response.ok){
      throw new Error(`HTTP error:  ${response.status}`);
    } 

    const posts = await response.json();
    postContainer.innerHTML = "";

    if(posts.length === 0){
      postContainer.innerHTML = "<p>No posts available</p>"
      return;
    }

    posts.forEach(post => {
      postContainer.innerHTML += `
        <article class="post">
          <h2>${post.title.rendered}</h2>
          <div>${post.excerpt.rendered}</div>
          <a href="${post.linl}" 
              target="_blank"
              rel = "noopener noreferrer">
          </a>
        </article>
      `;
    });
  } catch(error){
    postContainer.innerHTML = "<p> could not load posts</p>";
    console.error("wordPress ApI Error:", error);
  }
}


function getFriendlyError(code) { switch (code) {
  case "auth/email-already-in-use":
  return "An account already exists with this email.";
  case "auth/invalid-email":
  return "Please enter a valid email address.";
  case "auth/weak-password":
  return "Please choose a stronger password.";
  case "auth/invalid-credential":
  return "Invalid email or password.";
  case "auth/too-many-requests":
  return "Too many attempts. Please try again later.";
  case "auth/network-request-failed":
  return "Network error. Check your internet connection.";
  default:
  return "Authentication failed. Please try again.";

 } }

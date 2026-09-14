document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady(){
    console.log("Cordova is working");
    console.log("Device is ready");
}


import {
  subscribeToAuthState,
  logOut
} from "./app.js";


import {
  loadUserUI
} from "./user.js";


import {
  initializeProfilePage
} from "./profile.js";


import {
  initializeHomePage,
  initializeMyPostsPage,
  initializeLikedPage,
  setPostsCurrentUser,
  initializePostModal
} from "./posts.js";


import {
  initializeBookmarks
} from "./bookmark.js";


import {
  $,
  getFirebaseErrorMessage
} from "./utils.js";


import {
  initializeAuthPage
} from "./auth.js";


// ========================================
// GLOBAL STATE
// ========================================

let currentUser =
  null;


let logoutInitialized =
  false;


// ========================================
// AUTH REDIRECT
// ========================================

function redirectToLogin() {

  const currentPage =
    window.location.pathname
      .split("/")
      .pop();


  /*
   * Your authentication page is index.html.
   */

  if (
    currentPage !== "index.html"
  ) {

    window.location.href =
      "./index.html";

  }

}


// ========================================
// AUTH STATE
// ========================================

subscribeToAuthState(
  async (user) => {

    currentUser =
      user;


    if (!user) {

      redirectToLogin();

      return;

    }


    try {

      setPostsCurrentUser(
        user
      );


      await loadUserUI(
        user
      );


      await initializePage();

    } catch (error) {

      console.error(
        "Page initialization failed:",
        error
      );

    }

  }
);


// ========================================
// INITIALIZE PAGE
// ========================================

async function initializePage() {

  /*
   * HOME
   */

  if (
    document.querySelector(
      "#posts-list"
    )
  ) {

    await initializeHomePage();

  }


  /*
   * MY POSTS
   */

  if (
    document.querySelector(
      "#my-posts-list"
    )
  ) {

    await initializeMyPostsPage();

  }


  /*
   * LIKED
   */

  if (
    document.querySelector(
      "#liked-posts-list"
    )
  ) {

    await initializeLikedPage();

  }


  /*
   * PROFILE
   */

  if (
    document.querySelector(
      ".profile-page"
    )
  ) {

    initializeProfilePage(
      currentUser,
      loadUserUI
    );

  }


  /*
   * COMMON
   */

  initializeLogout();

  initializePostModal();

  initializeProfilePopover();

  initializeBookmarks();

}


// ========================================
// LOGOUT
// ========================================

function initializeLogout() {

  const logoutButton =
    $("#logout-btn");


  if (
    !logoutButton ||
    logoutInitialized
  ) {

    return;

  }


  logoutInitialized =
    true;


  logoutButton.addEventListener(
    "click",
    async () => {

      logoutButton.disabled =
        true;


      logoutButton.textContent =
        "Logging out...";


      try {

        await logOut();

        /*
         * Auth state listener will
         * redirect to auth.html.
         */

      } catch (error) {

        console.error(
          "Logout failed:",
          error
        );


        logoutButton.disabled =
          false;


        logoutButton.textContent =
          "Logout";


        alert(
          getFirebaseErrorMessage(
            error
          )
        );

      }

    }
  );

}


// ========================================
// PROFILE POPOVER
// ========================================

function initializeProfilePopover() {

  const avatarButton =
    $("#avatar-btn");


  const profileMenu =
    $("#profile-menu");


  if (
    !avatarButton ||
    !profileMenu
  ) {

    return;

  }


  profileMenu.addEventListener(
    "toggle",
    () => {

      avatarButton.setAttribute(
        "aria-expanded",
        profileMenu.matches(
          ":popover-open"
        )
          ? "true"
          : "false"
      );

    }
  );

}


// ========================================
// AUTH PAGE
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializeAuthPage();

  }
);

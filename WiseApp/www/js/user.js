import {
  getUserProfile
} from "./app.js";

import {
  $,
  getInitial
} from "./utils.js";

import {
  setAvatar
} from "./ui.js";


// ========================================
// LOAD USER UI
// ========================================

export async function loadUserUI(user) {

  if (!user) {
    return;
  }


  let profile;


  try {

    profile =
      await getUserProfile();

  } catch (error) {

    console.error(
      "Could not load user profile:",
      error
    );


    profile = {

      username:
        user.displayName ||
        user.email?.split("@")[0] ||
        "User",

      email:
        user.email || "",

      phone:
        "",

      about:
        "",

      photoURL:
        user.photoURL || ""

    };
  }


  const username =
    profile.username ||
    user.displayName ||
    user.email?.split("@")[0] ||
    "User";


  const email =
    profile.email ||
    user.email ||
    "";


  const photoURL =
    profile.photoURL ||
    user.photoURL ||
    "";


  // ======================================
  // HEADER AVATAR
  // ======================================

  setAvatar(
    $("#avatar-image"),
    $("#avatar-letter"),
    username,
    photoURL
  );


  // ======================================
  // PROFILE MENU
  // ======================================

  const profileName =
    $("#profile-name");

  const profileEmail =
    $("#profile-email");


  if (profileName) {

    profileName.textContent =
      username;
  }


  if (profileEmail) {

    profileEmail.textContent =
      email;
  }


  // ======================================
  // COMPOSER AVATAR
  // ======================================

  const composerAvatar =
    $("#composer-avatar");


  if (composerAvatar) {

    composerAvatar.innerHTML =
      "";


    if (photoURL) {

      const image =
        document.createElement("img");


      image.src =
        photoURL;

      image.alt =
        "Your profile picture";

      image.className =
        "composer-avatar-image";


      image.onerror = () => {

        composerAvatar.textContent =
          getInitial(username);
      };


      composerAvatar.appendChild(
        image
      );

    } else {

      composerAvatar.textContent =
        getInitial(username);
    }
  }


  // ======================================
  // PROFILE PAGE
  // ======================================

  const profilePage =
    document.querySelector(
      ".profile-page"
    );


  if (profilePage) {

    const pageUsername =
      profilePage.querySelector(
        "#profile-username"
      );

    const pageEmail =
      profilePage.querySelector(
        "#profile-email"
      );

    const pageEmailDetail =
      profilePage.querySelector(
        "#profile-email-detail"
      );

    const pagePhone =
      profilePage.querySelector(
        "#profile-phone"
      );

    const pageAbout =
      profilePage.querySelector(
        "#profile-about-text"
      );


    if (pageUsername) {

      pageUsername.textContent =
        username;
    }


    if (pageEmail) {

      pageEmail.textContent =
        email;
    }


    if (pageEmailDetail) {

      pageEmailDetail.textContent =
        email;
    }


    if (pagePhone) {

      pagePhone.textContent =
        profile.phone ||
        "Not added";
    }


    if (pageAbout) {

      pageAbout.textContent =
        profile.about ||
        "Tell people a little about yourself.";
    }


    const pageAvatarImage =
      profilePage.querySelector(
        "#profile-avatar-img"
      );

    const pageAvatarLetter =
      profilePage.querySelector(
        "#profile-avatar-letter"
      );


    setAvatar(
      pageAvatarImage,
      pageAvatarLetter,
      username,
      photoURL
    );


    // ====================================
    // EDIT FORM
    // ====================================

    const editUsername =
      $("#edit-username");

    const editPhone =
      $("#edit-phone");

    const editPhotoURL =
      $("#edit-photo-url");

    const editAbout =
      $("#edit-about");


    if (editUsername) {

      editUsername.value =
        username;
    }


    if (editPhone) {

      editPhone.value =
        profile.phone || "";
    }


    if (editPhotoURL) {

      editPhotoURL.value =
        profile.photoURL || "";
    }


    if (editAbout) {

      editAbout.value =
        profile.about || "";
    }
  }
}
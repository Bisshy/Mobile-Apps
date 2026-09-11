import {
  $
} from "./utils.js";


// ========================================
// SET AVATAR
// ========================================

export function setAvatar(
  imageElement,
  letterElement,
  name,
  photoURL
) {

  if (
    !imageElement ||
    !letterElement
  ) {

    return;
  }


  const initial =
    String(name || "U")
      .trim()
      .charAt(0)
      .toUpperCase() ||
    "U";


  letterElement.textContent =
    initial;


  if (photoURL) {

    imageElement.src =
      photoURL;

    imageElement.alt =
      `${name || "User"} profile picture`;

    imageElement.hidden =
      false;

    letterElement.hidden =
      true;


    imageElement.onerror = () => {

      imageElement.hidden =
        true;

      letterElement.hidden =
        false;

      letterElement.textContent =
        initial;
    };

  } else {

    imageElement.removeAttribute(
      "src"
    );

    imageElement.hidden =
      true;

    letterElement.hidden =
      false;

    letterElement.textContent =
      initial;
  }
}


// ========================================
// SHOW MESSAGE
// ========================================

export function showMessage(
  container,
  message,
  error = false
) {

  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  const paragraph =
    document.createElement("p");


  paragraph.className =
    error
      ? "posts-empty danger"
      : "posts-empty";


  paragraph.textContent =
    message;


  container.appendChild(
    paragraph
  );
}


// ========================================
// POST MESSAGE
// ========================================

export function showPostMessage(
  element,
  message,
  error = false
) {

  if (!element) {
    return;
  }


  element.textContent =
    message;


  element.className =
    error
      ? "danger"
      : "valid";
}


// ========================================
// CLEAR POST MESSAGE
// ========================================

export function clearPostMessage(
  element
) {

  if (!element) {
    return;
  }


  element.textContent =
    "";

  element.className =
    "";
}


// ========================================
// PROFILE MESSAGE
// ========================================

export function showProfileMessage(
  message,
  error = false
) {

  const element =
    $("#profile-message");


  if (!element) {
    return;
  }


  element.textContent =
    message;


  element.className =
    error
      ? "profile-message error"
      : "profile-message success";
}


// ========================================
// CLEAR PROFILE MESSAGE
// ========================================

export function clearProfileMessage() {

  const element =
    $("#profile-message");


  if (!element) {
    return;
  }


  element.textContent =
    "";

  element.className =
    "profile-message";
}
import {
  updateUserProfile
} from "./app.js";

import {
  $,
  getFirebaseErrorMessage
} from "./utils.js";

import {
  clearProfileMessage,
  showProfileMessage
} from "./ui.js";


let profilePageInitialized = false;


// ========================================
// PROFILE PAGE
// ========================================

export function initializeProfilePage(
  currentUser,
  loadUserUI
) {

  if (profilePageInitialized) {
    return;
  }


  const editButton =
    $("#edit-profile-btn");

  const closeButton =
    $("#close-edit-profile-btn");

  const editSection =
    $("#profile-edit-section");

  const saveButton =
    $("#save-profile-btn");


  if (
    !editButton &&
    !closeButton &&
    !saveButton
  ) {

    return;
  }


  profilePageInitialized =
    true;


  editButton?.addEventListener(
    "click",
    () => {

      editSection?.classList.remove(
        "hidden"
      );


      clearProfileMessage();


      $("#edit-username")?.focus();
    }
  );


  closeButton?.addEventListener(
    "click",
    () => {

      editSection?.classList.add(
        "hidden"
      );


      clearProfileMessage();
    }
  );


  saveButton?.addEventListener(
    "click",
    () => {

      handleSaveProfile(
        currentUser,
        loadUserUI
      );

    }
  );
}


// ========================================
// SAVE PROFILE
// ========================================

async function handleSaveProfile(
  currentUser,
  loadUserUI
) {

  if (!currentUser) {
    return;
  }


  const username =
    $("#edit-username")?.value.trim() ||
    "";


  const phone =
    $("#edit-phone")?.value.trim() ||
    "";


  const about =
    $("#edit-about")?.value.trim() ||
    "";


  const photoURL =
    $("#edit-photo-url")?.value.trim() ||
    "";


  const saveButton =
    $("#save-profile-btn");


  clearProfileMessage();


  if (saveButton) {

    saveButton.disabled =
      true;

    saveButton.innerHTML =
      `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Saving...
      `;
  }


  try {

    await updateUserProfile(
      {
        username,
        phone,
        about,
        photoURL
      }
    );


    await loadUserUI(
      currentUser
    );


    showProfileMessage(
      "Profile updated successfully.",
      false
    );


    setTimeout(
      () => {

        $("#profile-edit-section")
          ?.classList.add(
            "hidden"
          );


        clearProfileMessage();

      },
      800
    );

  } catch (error) {

    console.error(
      "Profile update failed:",
      error
    );


    showProfileMessage(
      getFirebaseErrorMessage(
        error
      ),
      true
    );

  } finally {

    if (saveButton) {

      saveButton.disabled =
        false;

      saveButton.innerHTML =
        `
          <i class="fa-solid fa-check"></i>
          Save changes
        `;
    }
  }
}
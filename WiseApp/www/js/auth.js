import {
  signIn,
  logIn
} from "./app.js";

import {
  $,
  getFirebaseErrorMessage
} from "./utils.js";


// ========================================
// AUTH PAGE
// ========================================

export function initializeAuthPage() {

  initializeAuthenticationForms();

  initializeAuthSwitching();

}


// ========================================
// AUTH SWITCHING
// ========================================

function initializeAuthSwitching() {

  const loginSection =
    $("#login-section");

  const signupSection =
    $("#signin-section");

  const showSignupButton =
    $("#show-signin-button");

  const showLoginButton =
    $("#show-login-button");


  if (
    !loginSection ||
    !signupSection
  ) {

    return;
  }


  // ======================================
  // SHOW SIGNUP
  // ======================================

  showSignupButton?.addEventListener(
    "click",
    () => {

      loginSection.classList.add(
        "hidden"
      );


      signupSection.classList.remove(
        "hidden"
      );

    }
  );


  // ======================================
  // SHOW LOGIN
  // ======================================

  showLoginButton?.addEventListener(
    "click",
    () => {

      signupSection.classList.add(
        "hidden"
      );


      loginSection.classList.remove(
        "hidden"
      );

    }
  );


  // ======================================
  // KEYBOARD SUPPORT
  // ======================================

  showSignupButton?.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();

        showSignupButton.click();
      }
    }
  );


  showLoginButton?.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();

        showLoginButton.click();
      }
    }
  );
}


// ========================================
// AUTHENTICATION FORMS
// ========================================

function initializeAuthenticationForms() {

  // ======================================
  // LOGIN FORM
  // ======================================

  const loginForm =
    $("#login-form");


  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();


        const email =
          $("#login-email")
            ?.value
            .trim();


        const password =
          $("#login-password")
            ?.value;


        const message =
          $("#login-message");


        const submitButton =
          loginForm.querySelector(
            'button[type="submit"]'
          );


        if (
          !email ||
          !password
        ) {

          if (message) {

            message.textContent =
              "Please enter your email and password.";
          }


          return;
        }


        if (submitButton) {

          submitButton.disabled =
            true;

          submitButton.textContent =
            "Logging in...";
        }


        if (message) {

          message.textContent =
            "";
        }


        try {

          await logIn(
            email,
            password
          );


          window.location.href =
            "./posts.html";

        } catch (error) {

          console.error(
            "Login failed:",
            error
          );


          if (message) {

            message.textContent =
              getFirebaseErrorMessage(
                error
              );
          }

        } finally {

          if (submitButton) {

            submitButton.disabled =
              false;

            submitButton.textContent =
              "Log in";
          }
        }

      }
    );
  }


  // ======================================
  // REGISTER FORM
  // ======================================

  const registerForm =
    $("#register-form");


  if (registerForm) {

    registerForm.addEventListener(
      "submit",
      async event => {

        event.preventDefault();


        const name =
          $("#register-name")
            ?.value
            .trim();


        const phone =
          $("#register-phone")
            ?.value
            .trim();


        const email =
          $("#register-email")
            ?.value
            .trim();


        const password =
          $("#register-password")
            ?.value;


        const message =
          $("#signin-message");


        const submitButton =
          registerForm.querySelector(
            'button[type="submit"]'
          );


        if (
          !name ||
          !phone ||
          !email ||
          !password
        ) {

          if (message) {

            message.textContent =
              "Please complete all fields.";
          }


          return;
        }


        if (submitButton) {

          submitButton.disabled =
            true;

          submitButton.textContent =
            "Creating account...";
        }


        if (message) {

          message.textContent =
            "";
        }


        try {

          await signIn(
            name,
            email,
            password
          );


          window.location.href =
            "./posts.html";

        } catch (error) {

          console.error(
            "Registration failed:",
            error
          );


          if (message) {

            message.textContent =
              getFirebaseErrorMessage(
                error
              );
          }

        } finally {

          if (submitButton) {

            submitButton.disabled =
              false;

            submitButton.textContent =
              "Sign up";
          }
        }

      }
    );
  }

}
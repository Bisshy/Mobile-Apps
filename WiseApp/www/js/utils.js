// ========================================
// DOM HELPER
// ========================================

export function $(selector) {

  return document.querySelector(
    selector
  );

}


// ========================================
// ESCAPE HTML
// ========================================

export function escapeHTML(value) {

  const div =
    document.createElement("div");

  div.textContent =
    value ?? "";

  return div.innerHTML;
}


// ========================================
// GET INITIAL
// ========================================

export function getInitial(name) {

  const value =
    String(name || "U").trim();

  return (
    value.charAt(0).toUpperCase() ||
    "U"
  );
}


// ========================================
// FORMAT DATE
// ========================================

export function formatDate(timestamp) {

  if (!timestamp) {
    return "";
  }

  let date;

  try {

    if (
      typeof timestamp.toDate === "function"
    ) {

      date =
        timestamp.toDate();

    } else if (
      timestamp instanceof Date
    ) {

      date =
        timestamp;

    } else if (
      timestamp.seconds
    ) {

      date =
        new Date(
          timestamp.seconds * 1000
        );

    } else {

      date =
        new Date(timestamp);

    }

  } catch {

    return "";

  }


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";

  }


  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric"
    }
  );
}


// ========================================
// FIREBASE ERROR MESSAGE
// ========================================

export function getFirebaseErrorMessage(
  error
) {

  const code =
    error?.code || "";


  const messages = {

    "auth/invalid-credential":
      "Invalid email or password.",

    "auth/invalid-email":
      "Please enter a valid email address.",

    "auth/user-not-found":
      "No account was found with this email.",

    "auth/wrong-password":
      "Incorrect password.",

    "auth/email-already-in-use":
      "An account already exists with this email.",

    "auth/weak-password":
      "Password is too weak.",

    "auth/network-request-failed":
      "Network error. Please check your internet connection.",

    "auth/too-many-requests":
      "Too many attempts. Please try again later.",

    "auth/user-disabled":
      "This account has been disabled.",

    "permission-denied":
      "You don't have permission to perform this action."

  };


  return (
    messages[code] ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}
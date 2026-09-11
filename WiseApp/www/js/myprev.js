import {
  getCurrentUser,
  subscribeToAuthState,
  signIn,
  logIn,
  logOut,
  getUserProfile,
  updateUserProfile,
  createPost,
  getPublishedPosts,
  getUserPosts,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getLikedPostIds,
  getLikedPosts
} from "./app.js";


// ========================================
// GLOBAL STATE
// ========================================

let currentUser = null;

let editingPostId = null;

let likedPostIds = new Set();

let logoutInitialized = false;

let postModalInitialized = false;

let profilePageInitialized = false;


// ========================================
// DOM HELPER
// ========================================

function $(selector) {
  return document.querySelector(selector);
}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

  const div =
    document.createElement("div");

  div.textContent =
    value ?? "";

  return div.innerHTML;
}


// ========================================
// GET INITIAL
// ========================================

function getInitial(name) {

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

function formatDate(timestamp) {

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
// AUTH REDIRECT
// ========================================

function redirectToLogin() {

  const currentPage =
    window.location.pathname
      .split("/")
      .pop();


  /*
   * Your authentication page is auth.html.
   */

  if (
    currentPage !== "auth.html"
  ) {

    window.location.href =
      "./auth.html";
  }
}


// ========================================
// SET AVATAR
// ========================================

function setAvatar(
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
    getInitial(name);


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
// LOAD USER UI
// ========================================

async function loadUserUI(user) {

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

      await loadUserUI(user);

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
   * LIKED POSTS
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

    initializeProfilePage();
  }


  /*
   * COMMON
   */

  initializeLogout();

  initializePostModal();

  initializeProfilePopover();
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
// HOME PAGE
// ========================================

async function initializeHomePage() {

  const postsList =
    $("#posts-list");


  if (!postsList) {
    return;
  }


  showMessage(
    postsList,
    "Loading posts..."
  );


  try {

    const [
      posts,
      likedIds
    ] = await Promise.all([

      getPublishedPosts(),

      getLikedPostIds()

    ]);


    likedPostIds =
      new Set(likedIds);


    renderPosts(
      posts,
      postsList,
      false
    );

  } catch (error) {

    console.error(
      "Failed to load posts:",
      error
    );


    showMessage(
      postsList,
      getFirebaseErrorMessage(
        error
      ),
      true
    );
  }
}


// ========================================
// MY POSTS PAGE
// ========================================

async function initializeMyPostsPage() {

  const postsList =
    $("#my-posts-list");


  if (!postsList) {
    return;
  }


  showMessage(
    postsList,
    "Loading your posts..."
  );


  try {

    const posts =
      await getUserPosts();


    renderPosts(
      posts,
      postsList,
      true
    );

  } catch (error) {

    console.error(
      "Failed to load your posts:",
      error
    );


    showMessage(
      postsList,
      getFirebaseErrorMessage(
        error
      ),
      true
    );
  }
}


// ========================================
// LIKED PAGE
// ========================================

async function initializeLikedPage() {

  const postsList =
    $("#liked-posts-list");


  if (!postsList) {
    return;
  }


  showMessage(
    postsList,
    "Loading liked posts..."
  );


  try {

    const [
      posts,
      likedIds
    ] = await Promise.all([

      getLikedPosts(),

      getLikedPostIds()

    ]);


    likedPostIds =
      new Set(likedIds);


    renderPosts(
      posts,
      postsList,
      false
    );

  } catch (error) {

    console.error(
      "Failed to load liked posts:",
      error
    );


    showMessage(
      postsList,
      getFirebaseErrorMessage(
        error
      ),
      true
    );
  }
}


// ========================================
// SHOW MESSAGE
// ========================================

function showMessage(
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
// RENDER POSTS
// ========================================

function renderPosts(
  posts,
  container,
  allowEditing
) {

  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (
    !posts ||
    posts.length === 0
  ) {

    const empty =
      document.createElement("p");


    empty.className =
      "posts-empty";


    empty.textContent =
      allowEditing
        ? "You haven't created any posts yet."
        : "No posts to show.";


    container.appendChild(
      empty
    );


    return;
  }


  posts.forEach(
    post => {

      const postElement =
        createPostElement(
          post,
          allowEditing
        );


      container.appendChild(
        postElement
      );
    }
  );
}


// ========================================
// CREATE POST ELEMENT
// ========================================

function createPostElement(
  post,
  allowEditing
) {

  const article =
    document.createElement(
      "article"
    );


  article.className =
    "post";


  article.dataset.postId =
    post.id;


  const authorName =
    post.authorName ||
    "User";


  const authorEmail =
    post.authorEmail ||
    "";


  const authorPhoto =
    post.authorPhotoURL ||
    "";


  const createdDate =
    formatDate(
      post.createdAt
    );


  const isLiked =
    likedPostIds.has(
      post.id
    );


  const isOwner =
    currentUser &&
    post.authorId ===
      currentUser.uid;


  // ======================================
  // USER ROW
  // ======================================

  const userRow =
    document.createElement(
      "div"
    );


  userRow.className =
    "post-user-row";


  // ======================================
  // AVATAR
  // ======================================

  const avatar =
    document.createElement(
      "div"
    );


  avatar.className =
    "post-avatar";


  if (authorPhoto) {

    const image =
      document.createElement(
        "img"
      );


    image.src =
      authorPhoto;

    image.alt =
      `${authorName} profile picture`;

    image.className =
      "post-avatar-image";


    image.onerror = () => {

      avatar.innerHTML =
        "";

      avatar.textContent =
        getInitial(authorName);
    };


    avatar.appendChild(
      image
    );

  } else {

    avatar.textContent =
      getInitial(authorName);
  }


  // ======================================
  // USER DETAILS
  // ======================================

  const userDetails =
    document.createElement(
      "div"
    );


  userDetails.className =
    "post-user-details";


  const name =
    document.createElement(
      "strong"
    );


  name.textContent =
    authorName;


  const meta =
    document.createElement(
      "small"
    );


  if (authorEmail) {

    meta.textContent =
      createdDate
        ? `${authorEmail} · ${createdDate}`
        : authorEmail;

  } else {

    meta.textContent =
      createdDate;
  }


  userDetails.appendChild(
    name
  );

  userDetails.appendChild(
    meta
  );


  userRow.appendChild(
    avatar
  );

  userRow.appendChild(
    userDetails
  );


  // ======================================
  // TITLE
  // ======================================

  const title =
    document.createElement(
      "h3"
    );


  title.className =
    "post-title";


  title.textContent =
    post.title || "";


  // ======================================
  // CONTENT
  // ======================================

  const content =
    document.createElement(
      "p"
    );


  content.className =
    "post-text";


  content.textContent =
    post.content || "";


  // ======================================
  // ACTIONS
  // ======================================

  const actions =
    document.createElement(
      "div"
    );


  actions.className =
    "post-actions-buttons";


  // ======================================
  // LIKE BUTTON
  // ======================================

  const likeButton =
    document.createElement(
      "button"
    );


  likeButton.type =
    "button";


  likeButton.className =
    `like-btn${
      isLiked
        ? " liked"
        : ""
    }`;


  const heart =
    document.createElement(
      "i"
    );


  heart.className =
    isLiked
      ? "fa-solid fa-heart like-icon"
      : "fa-regular fa-heart like-icon";


  const likeText =
    document.createElement(
      "span"
    );


  likeText.textContent =
    isLiked
      ? "Liked"
      : "Like";


  likeButton.appendChild(
    heart
  );

  likeButton.appendChild(
    likeText
  );


  likeButton.addEventListener(
    "click",
    () => {

      handleLike(
        post.id,
        likeButton
      );

    }
  );


  actions.appendChild(
    likeButton
  );


  // ======================================
  // EDIT
  // ======================================

  if (
    allowEditing &&
    isOwner
  ) {

    const editButton =
      document.createElement(
        "button"
      );


    editButton.type =
      "button";


    editButton.className =
      "edit-btn";


    editButton.innerHTML =
      `
        <i class="fa-solid fa-pen"></i>
        <span>Edit</span>
      `;


    editButton.addEventListener(
      "click",
      () => {

        openEditPost(
          post
        );

      }
    );


    actions.appendChild(
      editButton
    );


    // ====================================
    // DELETE
    // ====================================

    const deleteButton =
      document.createElement(
        "button"
      );


    deleteButton.type =
      "button";


    deleteButton.className =
      "delete-btn";


    deleteButton.innerHTML =
      `
        <i class="fa-solid fa-trash"></i>
        <span>Delete</span>
      `;


    deleteButton.addEventListener(
      "click",
      () => {

        handleDeletePost(
          post.id
        );

      }
    );


    actions.appendChild(
      deleteButton
    );
  }


  // ======================================
  // ASSEMBLE
  // ======================================

  article.appendChild(
    userRow
  );

  article.appendChild(
    title
  );

  article.appendChild(
    content
  );

  article.appendChild(
    actions
  );


  return article;
}


// ========================================
// LIKE POST
// ========================================

async function handleLike(
  postId,
  button
) {

  if (!currentUser) {
    return;
  }


  if (button.disabled) {
    return;
  }


  const wasLiked =
    likedPostIds.has(
      postId
    );


  button.disabled =
    true;


  try {

    if (wasLiked) {

      await unlikePost(
        postId
      );


      likedPostIds.delete(
        postId
      );


      setLikeButton(
        button,
        false
      );

    } else {

      await likePost(
        postId
      );


      likedPostIds.add(
        postId
      );


      setLikeButton(
        button,
        true
      );
    }

  } catch (error) {

    console.error(
      "Like action failed:",
      error
    );


    alert(
      getFirebaseErrorMessage(
        error
      )
    );

  } finally {

    button.disabled =
      false;
  }
}


// ========================================
// SET LIKE BUTTON
// ========================================

function setLikeButton(
  button,
  liked
) {

  button.classList.toggle(
    "liked",
    liked
  );


  const icon =
    button.querySelector(
      ".like-icon"
    );


  const text =
    button.querySelector(
      "span"
    );


  if (icon) {

    icon.className =
      liked
        ? "fa-solid fa-heart like-icon"
        : "fa-regular fa-heart like-icon";
  }


  if (text) {

    text.textContent =
      liked
        ? "Liked"
        : "Like";
  }
}


// ========================================
// POST MODAL
// ========================================

function initializePostModal() {

  if (postModalInitialized) {
    return;
  }


  const modal =
    $("#post-modal");

  const addButton =
    $("#add-post-btn");

  const closeButton =
    $("#close-post-btn");

  const form =
    $("#create-post-form");

  const titleInput =
    $("#post-title");

  const contentInput =
    $("#post-content");

  const message =
    $("#post-message");

  const modalTitle =
    $("#post-modal-title");

  const submitButton =
    $("#post-submit-btn");


  if (!modal) {
    return;
  }


  postModalInitialized =
    true;


  // ======================================
  // ADD POST
  // ======================================

  addButton?.addEventListener(
    "click",
    () => {

      editingPostId =
        null;


      if (modalTitle) {

        modalTitle.textContent =
          "Create post";
      }


      if (submitButton) {

        submitButton.textContent =
          "Post";
      }


      if (form) {

        form.reset();
      }


      clearPostMessage(
        message
      );


      modal.showModal();


      setTimeout(
        () => {

          titleInput?.focus();

        },
        50
      );
    }
  );


  // ======================================
  // CLOSE
  // ======================================

  closeButton?.addEventListener(
    "click",
    () => {

      modal.close();

    }
  );


  // ======================================
  // BACKDROP
  // ======================================

  modal.addEventListener(
    "click",
    event => {

      if (
        event.target === modal
      ) {

        modal.close();
      }
    }
  );


  // ======================================
  // FORM SUBMIT
  // ======================================

  form?.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (!currentUser) {
        return;
      }


      const title =
        String(
          titleInput?.value || ""
        ).trim();


      const content =
        String(
          contentInput?.value || ""
        ).trim();


      if (!title) {

        showPostMessage(
          message,
          "Please enter a post title.",
          true
        );


        titleInput?.focus();

        return;
      }


      if (!content) {

        showPostMessage(
          message,
          "Please enter some content.",
          true
        );


        contentInput?.focus();

        return;
      }


      const buttons =
        form.querySelectorAll(
          "button"
        );


      buttons.forEach(
        button => {

          button.disabled =
            true;

        }
      );


      if (submitButton) {

        submitButton.textContent =
          editingPostId
            ? "Saving..."
            : "Posting...";
      }


      clearPostMessage(
        message
      );


      const postBeingEdited =
        editingPostId;


      try {

        if (postBeingEdited) {

          await updatePost(
            postBeingEdited,
            {
              title,
              content
            }
          );

        } else {

          await createPost(
            {
              title,
              content
            }
          );
        }


        modal.close();


        form.reset();


        editingPostId =
          null;


        await refreshCurrentPostsPage();

      } catch (error) {

        console.error(
          "Post operation failed:",
          error
        );


        showPostMessage(
          message,
          getFirebaseErrorMessage(
            error
          ),
          true
        );

      } finally {

        buttons.forEach(
          button => {

            button.disabled =
              false;

          }
        );


        if (submitButton) {

          submitButton.textContent =
            "Post";
        }
      }

    }
  );
}


// ========================================
// OPEN EDIT POST
// ========================================

function openEditPost(post) {

  const modal =
    $("#post-modal");

  const titleInput =
    $("#post-title");

  const contentInput =
    $("#post-content");

  const modalTitle =
    $("#post-modal-title");

  const submitButton =
    $("#post-submit-btn");

  const message =
    $("#post-message");


  if (!modal) {
    return;
  }


  editingPostId =
    post.id;


  if (titleInput) {

    titleInput.value =
      post.title || "";
  }


  if (contentInput) {

    contentInput.value =
      post.content || "";
  }


  if (modalTitle) {

    modalTitle.textContent =
      "Edit post";
  }


  if (submitButton) {

    submitButton.textContent =
      "Save";
  }


  clearPostMessage(
    message
  );


  modal.showModal();


  setTimeout(
    () => {

      titleInput?.focus();

    },
    50
  );
}


// ========================================
// DELETE POST
// ========================================

async function handleDeletePost(
  postId
) {

  if (!currentUser) {
    return;
  }


  const confirmed =
    window.confirm(
      "Are you sure you want to delete this post?"
    );


  if (!confirmed) {
    return;
  }


  try {

    await deletePost(
      postId
    );


    await refreshCurrentPostsPage();

  } catch (error) {

    console.error(
      "Delete failed:",
      error
    );


    alert(
      getFirebaseErrorMessage(
        error
      )
    );
  }
}


// ========================================
// REFRESH POSTS
// ========================================

async function refreshCurrentPostsPage() {

  const postsList =
    $("#posts-list");

  const myPostsList =
    $("#my-posts-list");

  const likedList =
    $("#liked-posts-list");


  // ======================================
  // HOME
  // ======================================

  if (postsList) {

    showMessage(
      postsList,
      "Loading posts..."
    );


    try {

      const [
        posts,
        likedIds
      ] = await Promise.all([

        getPublishedPosts(),

        getLikedPostIds()

      ]);


      likedPostIds =
        new Set(likedIds);


      renderPosts(
        posts,
        postsList,
        false
      );

    } catch (error) {

      showMessage(
        postsList,
        getFirebaseErrorMessage(
          error
        ),
        true
      );
    }


    return;
  }


  // ======================================
  // MY POSTS
  // ======================================

  if (myPostsList) {

    showMessage(
      myPostsList,
      "Loading your posts..."
    );


    try {

      const posts =
        await getUserPosts();


      renderPosts(
        posts,
        myPostsList,
        true
      );

    } catch (error) {

      showMessage(
        myPostsList,
        getFirebaseErrorMessage(
          error
        ),
        true
      );
    }


    return;
  }


  // ======================================
  // LIKED
  // ======================================

  if (likedList) {

    showMessage(
      likedList,
      "Loading liked posts..."
    );


    try {

      const [
        posts,
        likedIds
      ] = await Promise.all([

        getLikedPosts(),

        getLikedPostIds()

      ]);


      likedPostIds =
        new Set(likedIds);


      renderPosts(
        posts,
        likedList,
        false
      );

    } catch (error) {

      showMessage(
        likedList,
        getFirebaseErrorMessage(
          error
        ),
        true
      );
    }
  }
}


// ========================================
// POST MESSAGE
// ========================================

function showPostMessage(
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

function clearPostMessage(
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
// PROFILE PAGE
// ========================================

function initializeProfilePage() {

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
    handleSaveProfile
  );
}


// ========================================
// SAVE PROFILE
// ========================================

async function handleSaveProfile() {

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


// ========================================
// PROFILE MESSAGE
// ========================================

function showProfileMessage(
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

function clearProfileMessage() {

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


// ========================================
// FIREBASE ERROR MESSAGE
// ========================================

function getFirebaseErrorMessage(
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


// ========================================
// AUTH PAGE
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializeAuthenticationForms();

    initializeAuthSwitching();

  }
);


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


          /*
           * Firebase auth state will also
           * update, but redirect immediately.
           */

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

          /*
           * Your app.js signIn function
           * should create the Firebase account.
           */

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

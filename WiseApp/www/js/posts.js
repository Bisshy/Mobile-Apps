import {
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


import {
  $,
  getInitial,
  formatDate,
  getFirebaseErrorMessage
} from "./utils.js";


import {
  showMessage,
  showPostMessage,
  clearPostMessage
} from "./ui.js";


// ========================================
// GLOBAL STATE
// ========================================

let currentUser =
  null;


let editingPostId =
  null;


let likedPostIds =
  new Set();


let postModalInitialized =
  false;


// ========================================
// SET CURRENT USER
// ========================================

export function setPostsCurrentUser(
  user
) {

  currentUser =
    user;

}


// ========================================
// HOME PAGE
// ========================================

export async function initializeHomePage() {

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
      new Set(
        likedIds
      );


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

export async function initializeMyPostsPage() {

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

export async function initializeLikedPage() {

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
      new Set(
        likedIds
      );


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
      document.createElement(
        "p"
      );


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
        getInitial(
          authorName
        );

    };


    avatar.appendChild(
      image
    );

  } else {

    avatar.textContent =
      getInitial(
        authorName
      );

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
  // BOOKMARK BUTTON
  // ======================================

  /*
   * Bookmark functionality itself is handled
   * entirely by bookmark.js.
   *
   * This section only creates the button.
   */

  const bookmarkButton =
    document.createElement(
      "button"
    );


  bookmarkButton.type =
    "button";


  bookmarkButton.className =
    "bookmark-btn";


  bookmarkButton.setAttribute(
    "aria-label",
    "Bookmark post"
  );


  bookmarkButton.setAttribute(
    "title",
    "Bookmark post"
  );


  const bookmarkIcon =
    document.createElement(
      "i"
    );


  bookmarkIcon.className =
    "fa-regular fa-bookmark bookmark-icon";


  const bookmarkText =
    document.createElement(
      "span"
    );


  bookmarkText.textContent =
    "Save";


  bookmarkButton.appendChild(
    bookmarkIcon
  );


  bookmarkButton.appendChild(
    bookmarkText
  );


  actions.appendChild(
    bookmarkButton
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

export function initializePostModal() {

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

function openEditPost(
  post
) {

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
        new Set(
          likedIds
        );


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
        new Set(
          likedIds
        );


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

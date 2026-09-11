import {
    bookmarkPost,
    unbookmarkPost,
    getBookmarkedPostIds,
    getBookmarkedPosts
} from "./app.js";

import {
    getFirebaseErrorMessage
} from "./utils.js";


// ========================================
// GLOBAL STATE
// ========================================

let bookmarkedPostIds =
    new Set();

let bookmarkInitialized =
    false;


// ========================================
// INITIALIZE BOOKMARKS
// ========================================

export async function initializeBookmarks() {

    if (bookmarkInitialized) {

        return;

    }


    bookmarkInitialized =
        true;


    try {

        // ====================================
        // GET BOOKMARKED POST IDS
        // ====================================

        const ids =
            await getBookmarkedPostIds();


        bookmarkedPostIds =
            new Set(ids);


        // ====================================
        // UPDATE BUTTONS
        // ====================================

        updateBookmarkButtons();


        // ====================================
        // BOOKMARK PAGE
        // ====================================

        const bookmarkList =
            document.getElementById(
                "bookmark-list"
            );


        if (bookmarkList) {

            await renderBookmarkedPosts();

        }

    } catch (error) {

        console.error(
            "Failed to initialize bookmarks:",
            error
        );


        const message =
            document.getElementById(
                "bookmark-message"
            );


        if (message) {

            message.textContent =
                getFirebaseErrorMessage(
                    error
                );

            message.classList.add(
                "danger"
            );

        }

    }


    initializeBookmarkEvents();

}


// ========================================
// BOOKMARK EVENTS
// ========================================

function initializeBookmarkEvents() {

    document.addEventListener(
        "click",
        async (event) => {

            const button =
                event.target.closest(
                    ".bookmark-btn"
                );


            if (!button) {

                return;

            }


            const post =
                button.closest(
                    ".post"
                );


            if (!post) {

                return;

            }


            const postId =
                post.dataset.postId;


            if (!postId) {

                console.error(
                    "Bookmark button has no post ID."
                );

                return;

            }


            await handleBookmark(
                postId,
                button
            );

        }
    );

}


// ========================================
// HANDLE BOOKMARK
// ========================================

async function handleBookmark(
    postId,
    button
) {

    // ====================================
    // PREVENT DOUBLE CLICK
    // ====================================

    if (button.disabled) {

        return;

    }


    // ====================================
    // GET THE POST
    // ====================================

    const post =
        button.closest(
            ".post"
        );


    // ====================================
    // CHECK CURRENT STATE
    // ====================================

    const isBookmarked =
        bookmarkedPostIds.has(
            postId
        );


    button.disabled =
        true;


    try {

        // ==================================
        // UNBOOKMARK
        // ==================================

        if (isBookmarked) {

            await unbookmarkPost(
                postId
            );


            // Remove from local state.
            bookmarkedPostIds.delete(
                postId
            );


            // Update button.
            setBookmarkButton(
                button,
                false
            );


            // =================================
            // IF ON BOOKMARK PAGE
            // =================================

            const bookmarkList =
                document.getElementById(
                    "bookmark-list"
                );


            if (
                bookmarkList &&
                post &&
                bookmarkList.contains(
                    post
                )
            ) {

                post.remove();


                showEmptyBookmarkMessage();

            }

        }

        // ==================================
        // BOOKMARK
        // ==================================

        else {

            await bookmarkPost(
                postId
            );


            // Add to local state.
            bookmarkedPostIds.add(
                postId
            );


            // Update button.
            setBookmarkButton(
                button,
                true
            );

        }

    } catch (error) {

        console.error(
            "Bookmark action failed:",
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
// SET BOOKMARK BUTTON
// ========================================

function setBookmarkButton(
    button,
    bookmarked
) {

    if (!button) {

        return;

    }


    // ====================================
    // BUTTON CLASS
    // ====================================

    button.classList.toggle(
        "bookmarked",
        bookmarked
    );


    // ====================================
    // ICON
    // ====================================

    const icon =
        button.querySelector(
            ".bookmark-icon"
        );


    if (icon) {

        icon.className =
            bookmarked
                ? "fa-solid fa-bookmark bookmark-icon"
                : "fa-regular fa-bookmark bookmark-icon";

    }


    // ====================================
    // TEXT
    // ====================================

    const text =
        button.querySelector(
            ".bookmark-text"
        );


    if (text) {

        text.textContent =
            bookmarked
                ? "Saved"
                : "Save";

    }


    // ====================================
    // ACCESSIBILITY
    // ====================================

    button.setAttribute(
        "aria-label",
        bookmarked
            ? "Remove bookmark"
            : "Bookmark post"
    );


    button.setAttribute(
        "title",
        bookmarked
            ? "Remove bookmark"
            : "Bookmark post"
    );

}


// ========================================
// UPDATE ALL BOOKMARK BUTTONS
// ========================================

function updateBookmarkButtons() {

    const buttons =
        document.querySelectorAll(
            ".bookmark-btn"
        );


    buttons.forEach(
        button => {

            const post =
                button.closest(
                    ".post"
                );


            if (!post) {

                return;

            }


            const postId =
                post.dataset.postId;


            if (!postId) {

                return;

            }


            setBookmarkButton(
                button,
                bookmarkedPostIds.has(
                    postId
                )
            );

        }
    );

}


// ========================================
// RENDER BOOKMARKED POSTS
// ========================================

async function renderBookmarkedPosts() {

    const bookmarkList =
        document.getElementById(
            "bookmark-list"
        );


    if (!bookmarkList) {

        return;

    }


    const message =
        document.getElementById(
            "bookmark-message"
        );


    // ====================================
    // CLEAR OLD POSTS
    // ====================================

    bookmarkList
        .querySelectorAll(
            ".post"
        )
        .forEach(
            post => post.remove()
        );


    // ====================================
    // SHOW LOADING
    // ====================================

    if (message) {

        message.textContent =
            "Loading bookmarks...";

        message.className =
            "bookmark-message";

    }


    // ====================================
    // GET BOOKMARKED POSTS
    // ====================================

    const posts =
        await getBookmarkedPosts();


    // ====================================
    // NO BOOKMARKS
    // ====================================

    if (
        !posts ||
        posts.length === 0
    ) {

        showEmptyBookmarkMessage();

        return;

    }


    // ====================================
    // REMOVE LOADING MESSAGE
    // ====================================

    if (message) {

        message.remove();

    }


    // ====================================
    // CREATE POSTS
    // ====================================

    posts.forEach(
        post => {

            const postElement =
                createBookmarkPostElement(
                    post
                );


            bookmarkList.appendChild(
                postElement
            );

        }
    );


    // ====================================
    // UPDATE BUTTONS
    // ====================================

    updateBookmarkButtons();

}


// ========================================
// CREATE BOOKMARK POST ELEMENT
// ========================================

function createBookmarkPostElement(
    post
) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "post";


    article.dataset.postId =
        post.id;


    // ====================================
    // AUTHOR
    // ====================================

    const authorName =
        post.authorName ||
        "User";


    const authorEmail =
        post.authorEmail ||
        "";


    const authorPhoto =
        post.authorPhotoURL ||
        "";


    // ====================================
    // USER ROW
    // ====================================

    const userRow =
        document.createElement(
            "div"
        );


    userRow.className =
        "post-user-row";


    // ====================================
    // AVATAR
    // ====================================

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

            image.remove();


            avatar.textContent =
                getInitialLetter(
                    authorName
                );

        };


        avatar.appendChild(
            image
        );

    } else {

        avatar.textContent =
            getInitialLetter(
                authorName
            );

    }


    // ====================================
    // USER DETAILS
    // ====================================

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


    meta.textContent =
        authorEmail;


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


    // ====================================
    // TITLE
    // ====================================

    const title =
        document.createElement(
            "h3"
        );


    title.className =
        "post-title";


    title.textContent =
        post.title ||
        "Untitled post";


    // ====================================
    // CONTENT
    // ====================================

    const content =
        document.createElement(
            "p"
        );


    content.className =
        "post-text";


    content.textContent =
        post.content ||
        "";


    // ====================================
    // ACTIONS
    // ====================================

    const actions =
        document.createElement(
            "div"
        );


    actions.className =
        "post-actions-buttons";


    // ====================================
    // BOOKMARK BUTTON
    // ====================================

    const bookmarkButton =
        document.createElement(
            "button"
        );


    bookmarkButton.type =
        "button";


    bookmarkButton.className =
        "bookmark-btn bookmarked";


    bookmarkButton.setAttribute(
        "aria-label",
        "Remove bookmark"
    );


    bookmarkButton.setAttribute(
        "title",
        "Remove bookmark"
    );


    // ====================================
    // BOOKMARK ICON
    // ====================================

    const bookmarkIcon =
        document.createElement(
            "i"
        );


    bookmarkIcon.className =
        "fa-solid fa-bookmark bookmark-icon";


    // ====================================
    // BOOKMARK TEXT
    // ====================================

    const bookmarkText =
        document.createElement(
            "span"
        );


    bookmarkText.className =
        "bookmark-text";


    bookmarkText.textContent =
        "Saved";


    bookmarkButton.appendChild(
        bookmarkIcon
    );


    bookmarkButton.appendChild(
        bookmarkText
    );


    actions.appendChild(
        bookmarkButton
    );


    // ====================================
    // BUILD POST
    // ====================================

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
// GET INITIAL LETTER
// ========================================

function getInitialLetter(
    name
) {

    const value =
        String(
            name || "U"
        ).trim();


    return value
        ? value.charAt(0).toUpperCase()
        : "U";

}


// ========================================
// EMPTY BOOKMARK MESSAGE
// ========================================

function showEmptyBookmarkMessage() {

    const bookmarkList =
        document.getElementById(
            "bookmark-list"
        );


    if (!bookmarkList) {

        return;

    }


    // ====================================
    // CHECK FOR REMAINING POSTS
    // ====================================

    const remainingPosts =
        bookmarkList.querySelectorAll(
            ".post"
        );


    if (
        remainingPosts.length > 0
    ) {

        return;

    }


    // ====================================
    // FIND OR CREATE MESSAGE
    // ====================================

    let message =
        document.getElementById(
            "bookmark-message"
        );


    if (!message) {

        message =
            document.createElement(
                "p"
            );


        message.id =
            "bookmark-message";


        message.className =
            "bookmark-message";


        bookmarkList.appendChild(
            message
        );

    }


    message.textContent =
        "You haven't bookmarked any posts yet.";


    message.className =
        "bookmark-message";

}


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeBookmarks();

    }
);


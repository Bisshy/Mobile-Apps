import { auth, db } from "./firebaseConfig.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    addDoc,
    query,
    orderBy,
    getDocs,
    getDoc,
    serverTimestamp,
    where,
    updateDoc,
    deleteDoc,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ========================================
// CURRENT USER
// ========================================

let currentUser = null;

let authReadyResolve;

const authReady =
    new Promise((resolve) => {

        authReadyResolve = resolve;

    });


onAuthStateChanged(
    auth,
    (user) => {

        currentUser = user;

        authReadyResolve(user);

    }
);


// ========================================
// GET CURRENT USER
// ========================================

export async function getCurrentUser() {

    await authReady;

    return currentUser;

}


// ========================================
// AUTH STATE SUBSCRIBER
// ========================================

export function subscribeToAuthState(callback) {

    return onAuthStateChanged(
        auth,
        callback
    );

}


// ========================================
// AUTHENTICATION
// ========================================

export async function signIn(
    name,
    email,
    password
) {

    const cred =
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );


    const user =
        cred.user;


    // ====================================
    // UPDATE AUTH PROFILE
    // ====================================

    await updateProfile(
        user,
        {
            displayName:
                name || "User"
        }
    );


    // ====================================
    // CREATE FIRESTORE PROFILE
    // ====================================

    const userReference =
        doc(
            db,
            "users",
            user.uid
        );


    await setDoc(
        userReference,
        {
            username:
                name || "User",

            email:
                user.email || "",

            phone:
                "",

            about:
                "",

            photoURL:
                user.photoURL || "",

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()
        }
    );


    return user;

}


// ========================================
// LOGIN
// ========================================

export async function logIn(
    email,
    password
) {

    const cred =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


    return cred.user;

}


// ========================================
// LOGOUT
// ========================================

export async function logOut() {

    await signOut(auth);

}


// ========================================
// USER PROFILE
// ========================================

export async function getUserProfile() {

    const user =
        await getCurrentUser();


    if (!user) {

        throw new Error(
            "Not authenticated"
        );

    }


    const userReference =
        doc(
            db,
            "users",
            user.uid
        );


    const snapshot =
        await getDoc(
            userReference
        );


    // ====================================
    // CREATE DEFAULT PROFILE
    // ====================================

    if (!snapshot.exists()) {

        const defaultProfile = {

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
                user.photoURL || "",

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        };


        await setDoc(
            userReference,
            defaultProfile
        );


        return {

            username:
                defaultProfile.username,

            email:
                defaultProfile.email,

            phone:
                "",

            about:
                "",

            photoURL:
                defaultProfile.photoURL

        };

    }


    return {

        id:
            snapshot.id,

        ...snapshot.data()

    };

}


// ========================================
// UPDATE USER PROFILE
// ========================================

export async function updateUserProfile({
    username,
    phone,
    about,
    photoURL
}) {

    const user =
        await getCurrentUser();


    if (!user) {

        throw new Error(
            "Not authenticated"
        );

    }


    const cleanUsername =
        String(username || "").trim();


    if (!cleanUsername) {

        throw new Error(
            "Username cannot be empty."
        );

    }


    const cleanPhone =
        String(phone || "").trim();


    const cleanAbout =
        String(about || "").trim();


    const cleanPhotoURL =
        String(photoURL || "").trim();


    // ====================================
    // UPDATE FIREBASE AUTH PROFILE
    // ====================================

    await updateProfile(
        user,
        {

            displayName:
                cleanUsername,

            photoURL:
                cleanPhotoURL || null

        }
    );


    // ====================================
    // UPDATE FIRESTORE PROFILE
    // ====================================

    const userReference =
        doc(
            db,
            "users",
            user.uid
        );


    await setDoc(
        userReference,
        {

            username:
                cleanUsername,

            email:
                user.email || "",

            phone:
                cleanPhone,

            about:
                cleanAbout,

            photoURL:
                cleanPhotoURL,

            updatedAt:
                serverTimestamp()

        },
        {
            merge: true
        }
    );


    return {

        username:
            cleanUsername,

        email:
            user.email || "",

        phone:
            cleanPhone,

        about:
            cleanAbout,

        photoURL:
            cleanPhotoURL

    };

}


// ========================================
// POSTS
// ========================================

const postsCollection =
    collection(
        db,
        "posts"
    );


// ========================================
// CREATE POST
// ========================================

export async function createPost({
    title,
    content
}) {

    const user =
        await getCurrentUser();


    if (!user) {

        throw new Error(
            "Not authenticated"
        );

    }


    await addDoc(
        postsCollection,
        {

            authorId:
                user.uid,

            authorName:
                user.displayName ||
                user.email?.split("@")[0] ||
                "User",

            authorEmail:
                user.email || "",

            authorPhotoURL:
                user.photoURL || "",

            title:
                String(title || "").trim(),

            content:
                String(content || "").trim(),

            published:
                true,

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        }
    );

}


// ========================================
// GET PUBLISHED POSTS
// ========================================

export async function getPublishedPosts() {

    const postQuery =
        query(
            postsCollection,

            where(
                "published",
                "==",
                true
            ),

            orderBy(
                "createdAt",
                "desc"
            )
        );


    const snapshot =
        await getDocs(
            postQuery
        );


    return snapshot.docs.map(
        postDocument => ({

            id:
                postDocument.id,

            ...postDocument.data()

        })
    );

}


// ========================================
// GET CURRENT USER POSTS
// ========================================

export async function getUserPosts() {

    const user =
        await getCurrentUser();


    if (!user) {

        throw new Error(
            "Not authenticated"
        );

    }


    const postQuery =
        query(
            postsCollection,

            where(
                "authorId",
                "==",
                user.uid
            ),

            orderBy(
                "createdAt",
                "desc"
            )
        );


    const snapshot =
        await getDocs(
            postQuery
        );


    return snapshot.docs.map(
        postDocument => ({

            id:
                postDocument.id,

            ...postDocument.data()

        })
    );

}


// ========================================
// UPDATE POST
// ========================================

export async function updatePost(
    postId,
    data
) {

    const user =
        await getCurrentUser();


    if (!user) {

        throw new Error(
            "Not authenticated"
        );

    }


    const postReference =
        doc(
            db,
            "posts",
            postId
        );


    await updateDoc(
        postReference,
        {

            ...data,

            updatedAt:
                serverTimestamp()

        }
    );

}


// ========================================
// DELETE POST
// ========================================

export async function deletePost(
    postId
) {

    const user =
        await getCurrentUser();


    if (!user) {

        throw new Error(
            "Not authenticated"
        );

    }


    const postReference =
        doc(
            db,
            "posts",
            postId
        );


    await deleteDoc(
        postReference
    );

}


// ========================================
// LIKE POST
// ========================================

export async function likePost(
    postId
) {

    const user =
        await getCurrentUser();


    if (!user) {

        throw new Error(
            "You must be logged in to like a post."
        );

    }


    const likeReference =
        doc(
            db,
            "users",
            user.uid,
            "likedPosts",
            postId
        );


    await setDoc(
        likeReference,
        {

            postId:
                postId,

            createdAt:
                serverTimestamp()

        }
    );

}


// ========================================
// UNLIKE POST
// ========================================

export async function unlikePost(
    postId
) {

    const user =
        await getCurrentUser();


    if (!user) {

        throw new Error(
            "You must be logged in to unlike a post."
        );

    }


    const likeReference =
        doc(
            db,
            "users",
            user.uid,
            "likedPosts",
            postId
        );


    await deleteDoc(
        likeReference
    );

}


// ========================================
// GET LIKED POST IDS
// ========================================

export async function getLikedPostIds() {

    const user =
        await getCurrentUser();


    if (!user) {

        return [];

    }


    const likedPostsReference =
        collection(
            db,
            "users",
            user.uid,
            "likedPosts"
        );


    const snapshot =
        await getDocs(
            likedPostsReference
        );


    return snapshot.docs.map(
        likedPostDocument =>
            likedPostDocument.id
    );

}


// ========================================
// GET LIKED POSTS
// ========================================

export async function getLikedPosts() {

    const user =
        await getCurrentUser();


    if (!user) {

        return [];

    }


    const likedPostIds =
        await getLikedPostIds();


    if (
        likedPostIds.length === 0
    ) {

        return [];

    }


    const posts = [];


    for (
        const postId of likedPostIds
    ) {

        const postReference =
            doc(
                db,
                "posts",
                postId
            );


        const postSnapshot =
            await getDoc(
                postReference
            );


        if (
            postSnapshot.exists()
        ) {

            posts.push({

                id:
                    postSnapshot.id,

                ...postSnapshot.data()

            });

        }

    }


    return posts;

}


// ========================================
// BOOKMARKS
// ========================================

/*
 * Bookmarks are stored here:
 *
 * users/{uid}/bookmarkedPosts/{postId}
 *
 */


// ========================================
// BOOKMARK POST
// ========================================

export async function bookmarkPost(
    postId
) {

    const user =
        await getCurrentUser();


    if (!user) {

        throw new Error(
            "Not authenticated"
        );

    }


    if (!postId) {

        throw new Error(
            "Post ID is required."
        );

    }


    const bookmarkReference =
        doc(
            db,
            "users",
            user.uid,
            "bookmarkedPosts",
            postId
        );


    await setDoc(
        bookmarkReference,
        {

            postId:
                postId,

            createdAt:
                serverTimestamp()

        }
    );

}


// ========================================
// UNBOOKMARK POST
// ========================================

export async function unbookmarkPost(
    postId
) {

    const user =
        await getCurrentUser();


    if (!user) {

        throw new Error(
            "Not authenticated"
        );

    }


    if (!postId) {

        throw new Error(
            "Post ID is required."
        );

    }


    const bookmarkReference =
        doc(
            db,
            "users",
            user.uid,
            "bookmarkedPosts",
            postId
        );


    await deleteDoc(
        bookmarkReference
    );

}


// ========================================
// GET BOOKMARKED POST IDS
// ========================================

export async function getBookmarkedPostIds() {

    const user =
        await getCurrentUser();


    if (!user) {

        return [];

    }


    const bookmarksReference =
        collection(
            db,
            "users",
            user.uid,
            "bookmarkedPosts"
        );


    const snapshot =
        await getDocs(
            bookmarksReference
        );


    return snapshot.docs.map(
        bookmarkDocument =>
            bookmarkDocument.id
    );

}


// ========================================
// GET BOOKMARKED POSTS
// ========================================

export async function getBookmarkedPosts() {

    const user =
        await getCurrentUser();


    if (!user) {

        return [];

    }


    const bookmarkedPostIds =
        await getBookmarkedPostIds();


    if (
        bookmarkedPostIds.length === 0
    ) {

        return [];

    }


    const posts = [];


    for (
        const postId of bookmarkedPostIds
    ) {

        const postReference =
            doc(
                db,
                "posts",
                postId
            );


        const postSnapshot =
            await getDoc(
                postReference
            );


        if (
            postSnapshot.exists()
        ) {

            posts.push({

                id:
                    postSnapshot.id,

                ...postSnapshot.data()

            });

        }

    }


    /*
     * Newest posts first.
     *
     * Some old posts may not have
     * createdAt, so handle that safely.
     */

    posts.sort(
        (a, b) => {

            const aTime =
                a.createdAt?.toMillis?.() || 0;

            const bTime =
                b.createdAt?.toMillis?.() || 0;

            return bTime - aTime;

        }
    );


    return posts;

}

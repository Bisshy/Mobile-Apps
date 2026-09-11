const apiUrl = "this url";

async function loadPosts() {    
    const container = document.getElementById("post-container");

   try {
     const getPost = await fetch(`${apiUrl}?per_page=10&page=1`);

    if(!getPost.ok) throw new Error(`HTTP error: ${getPost.status}`);

    const posts = await getPost.json();

    container.innerHTML = "";

    posts.forEach(post => {
        `
        <article class="post">
        <h2>${post.title.rendered}</h2>
        <div>${post.excerpt.rendered}</div>
        <button class="read-more" data-id="${post.id}">Read more</button>
        <div class="post-details"></div>
        </article>
        `;
    });

    document.querySelectorAll(".read-more").forEach(button =>{
        button.addEventListener("click", ()=>{
            const post = button.closest(".post");
            showPost(button.dataset.id, post);
        })
    })
   } catch (error) {
    container.innerHTML = "<p>Couldn't load posts</p>"
    console.error = ("wordless api error ", error)
   }
};

async function showPosts(id, postElement) {
    const details = document.querySelector(".post-details");

    try {
        const getDetails = await fetch(`${apiUrl}/${id}`);

        if(!details.ok) throw new Error(`HTTP error: details.status`);

        const postDetails = await getDetails.json();

        details.innerHTML = "";

        details.innerHTML =
         `
         <article class="post-details">
            <h2>${postDetails.title.rendered}</h2>
            <div>${postDetails.content.rendered}</div>
            <button class="close-post">Close</button>
         </article>
         `
         details.classList.add("open");

         document.querySelector(".close-post").addEventListener("click", ()=>{
            details.classList.remove("open")
         })
    } catch (error) {
        details.innerHTML = "<p>Could not loas post</p>"
        console.error("post details error:", error)
    }
}

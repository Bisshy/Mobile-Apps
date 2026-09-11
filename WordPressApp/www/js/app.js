document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady(){
    console.log("Cordova is working");
    console.log("Device is ready");
}

const apiUrl =
  "https://public-api.wordpress.com/wp/v2/sites/" +
"okaforo253-umcvb.wordpress.com/posts";

async function loadPosts() {
  const container = document.getElementById("posts-container");
  try {
    const response = await fetch(`${apiUrl}?per_page=10&page=1`);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
  }
    const posts = await response.json();
    container.innerHTML = "";
    posts.forEach(post => {
      container.innerHTML += `
        <article class="post">
          <h2>${post.title.rendered}</h2>
          <div>${post.excerpt.rendered}</div>
          <button class="read-more" data-id="${post.id}">Read More</button>

          <div class="post-details"></div>
        </article>
      `;
  });
     document.querySelectorAll(".read-more").forEach(button =>{
        button.addEventListener("click", ()=> {
          const postElement = button.closest(".post");
          const postId = button.dataset.id;
          showPost(postId, postElement);
        });
      });
      
  }catch(error){
    container.innerHTML = "<p>Could not load posts.</p>"
    console.error("WordPress API Error:", error);
} }

async function showPost(id, postElement) {
    const details = postElement.querySelector(".post-details");
    const readMore = postElement.querySelector(".read-more")

    try{
        const response = await fetch(`${apiUrl}/${id}`);
        if(!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const post = await response.json();

        details.innerHTML = `
            <article class ="post-full">
                <h2>${post.title.rendered}</h2>
                <div>${post.content.rendered}</div>
                <button class ="close-post">Close</button>
            </article>
        `;

        details.classList.add("open");

        readMore.style.display = "none";

        details.querySelector(".close-post").addEventListener("click", ()=>{
          details.classList.remove("open");
          readMore.style.display = "inline-block"
        });
    }catch(error){
        details.innerHTML = "<p> Could not load posts.</p>"
        console.error("Post details error:", error)
    }
}
loadPosts();


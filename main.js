const postContainer = document.querySelector(".posts")
const search = document.querySelector(".search")
const currentHashtag = document.querySelector(".current-hashtag")
const currentHashtagCount = document.querySelector(".current-hashtag-count")

// Displaying 
const displayPost = post => {
    postContainer.innerHTML += 
        `<div class="post">
            <header class="post-header">
                <img src="${post.iconUrl}" alt="" class="user-icon">
                <p class="user-name">${post.username}</p>
            </header>
            <div class="post-image">
                <img src="${post.imageUrl}">
            </div>
            <div class="post-meta">
                <div class="post-meta-actions">
                    <img src="images/heart-regular.svg" class="icon icon-like" id="post-meta-like-${post.id}">
                    <img src="images/comment-regular.svg" class="icon icon-comment" id="post-meta-comment-
            ${post.id}">
            </div>
            <div class="post-meta-likes">
                Liked by
                <span class="user-name">${post.likes[0].username}</span>
                and
                <span class="likes-count" id="post-meta-likes-${post.id}">${(post.likes.length - 1)} others</span>
                </div>
            </div>
            <div class="post-body">
                <div class="post-body-user">
                    <p>
                        <span class="user-name">${post.username}</span>
                        <span class="post-body-text" id="post-body-${post.id}"></span>
                    </p>
                </div>
                <div class="post-body-hashtags">${displayHastags(post)}</div>
            </div>
            <div class="post-comments" id="comments-${post.id}"></div>
            <div class="post-date">${displayDatePosted(post)} days ago</div>
            <div class="post-add-comment">
                <input type="text" placeholder="Add a comment..." class="comment-value" id="add-comment-${post.id}">
                <input type="submit" value="Post" class="comment-submit" data-target="comments-${post.id}">
            </div>
        </div>`
}

// Displaying
const displayPosts = data => {
    for (let post of data) {
        displayPost(post)
        displayCaptions(post)
        displayPostedComments(post)
    }
}

const displayCaptions = data => {
    const captionContainer = document.getElementById(`post-body-${data.id}`)
    if(data.body.text.length >= 70) {
        captionContainer.innerHTML += `${data.body.excerpt} <span class='more'>more</span>`
    }
    else {
        captionContainer.innerHTML += data.body.text
    }
}   

const displayHastags = data => {
    let htmlString = ""
    for(let hashtag of data.body.hashtags) {
        htmlString += `<span class="hashtag">#${hashtag}</span> `;
    }
    return htmlString
}

const displayPostedComments = data => {
    const postedCommentContainer = document.getElementById(`comments-${data.id}`)
    for(let comment of data.comments) {
        postedCommentContainer.innerHTML += `<p class="comment"><span class="user-name">${comment.username}</span>
            <span class="comment-text">${comment.commentText}</span></p>`
    }
}

const displayDatePosted = data => {
    const now = new Date()
    const nowTime = now.getTime()
    let postedDate = new Date(data.datePosted)
    postedDate = postedDate.getTime()
    const days = 60000 * 60 * 24

    return Math.floor((nowTime - postedDate)/days)
}


// Event Listeners
const eventListening = dataArray => {
    // Searching
    search.addEventListener("keyup", event => {
        postContainer.innerHTML = ""
        currentHashtag.innerHTML = ""
        currentHashtagCount.innerHTML = ""
        const filteredArray = dataArray.filter(p => p.username.includes(event.target.value))
        displayPosts(filteredArray)
    })
    

    // DOC Event Listeners
    document.addEventListener("click", event => {
        // Displaying Hashtags
        if(event.target.classList.contains("hashtag")) {
            const tag = event.target.innerHTML.slice(1)
            postContainer.innerHTML = ""
            const filteredArray = dataArray.filter(p => p.body.hashtags.includes(tag))
            displayPosts(filteredArray)
            currentHashtag.innerHTML += `#${tag}<img src="images/times-circle-regular.svg" class="remove icon">`
            const display = (filteredArray.length > 1) ? `${filteredArray.length} posts` : `${filteredArray.length} post`
            currentHashtagCount.innerHTML += display
        }

        // Removing Hastags
        if(event.target.classList.contains("remove")) {
            currentHashtag.innerHTML = ""
            currentHashtagCount.innerHTML = ""
            postContainer.innerHTML = ""
            displayPosts(dataArray)
        }

        // Posting comments
        if(event.target.classList.contains("comment-submit")) {
            const previousElement = event.target.previousElementSibling.value
            if (previousElement !== "") {
                const eventId = event.target.getAttribute('data-target')
                document.getElementById(eventId).innerHTML += `<p class="comment">
                <span class="user-name">you</span>
                <span class="comment-text"> ${previousElement}</span>
                </p>`
                previousElement.innerHTML = ""
            }
        }

        // More...
        if(event.target.classList.contains("more")) {
            const postId = event.target.parentNode.id.slice(-1)
            for (let post of dataArray) {
                if(post.id == postId) {
                    const bodyText = post.body.text
                    event.target.parentNode.innerHTML = bodyText
                }
            }
        }

        // Liking
        if(event.target.classList.contains("icon-like")) {
            const postId = event.target.id.slice(-1)
            const element = document.getElementById(`post-meta-likes-${postId}`).innerHTML
            let numOfLikes = parseInt(element.slice(0))
            numOfLikes++
            document.getElementById(`post-meta-likes-${postId}`).innerHTML = `${numOfLikes} others`
        }

        // Comment Focusing
        if(event.target.classList.contains("icon-comment")) {
            const postId = event.target.id.slice(-1)
            const eventId = document.getElementById(`add-comment-${postId}`)
            eventId.focus()
        }
    })
}


// Local Storage
const localPosts = localStorage.getItem('posts') || null
if(localPosts !== null) {
    console.log("in local storage")
    const posts = JSON.parse(localPosts)
    displayPosts(posts)
    eventListening(posts)
}
else {
    console.log("fetching from api")
    fetch("http://comp2132.herokuapp.com/posts")
        .then(res => res.json())
        .then(res => {
            localStorage.setItem('posts', JSON.stringify(res))
            displayPosts(res)
            eventListening(res)
        })
}
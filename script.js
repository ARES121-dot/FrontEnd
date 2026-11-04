
// =====================================
// CONNECTHUB - SOCIAL MEDIA APPLICATION
// =====================================

const $ = id => document.getElementById(id);

function get(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
        return [];
    }
}

function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

let currentUser = null;
let users = get("ch_users");
let posts = get("ch_posts");

// =====================================
// DEMO ACCOUNTS
// =====================================

function createDemoAccounts() {
    users = get("ch_users");

    const demoUsers = [
        {
            name: "Rahul Kumar",
            username: "rahul",
            email: "rahul@demo.com",
            password: "demo123",
            following: []
        },
        {
            name: "Ananya Singh",
            username: "ananya",
            email: "ananya@demo.com",
            password: "demo123",
            following: []
        },
        {
            name: "Aman Sharma",
            username: "aman",
            email: "aman@demo.com",
            password: "demo123",
            following: []
        },
        {
            name: "Priya Verma",
            username: "priya",
            email: "priya@demo.com",
            password: "demo123",
            following: []
        }
    ];

    demoUsers.forEach(demo => {
        const exists = users.some(
            u => u.username.toLowerCase() === demo.username
        );

        if (!exists) {
            users.push(demo);
        }
    });

    save("ch_users", users);
}

// =====================================
// AUTHENTICATION
// =====================================

function showSignup() {
    $("loginBox").classList.add("hidden");
    $("signupBox").classList.remove("hidden");
    $("signupError").textContent = "";
}

function showLogin() {
    $("signupBox").classList.add("hidden");
    $("loginBox").classList.remove("hidden");
    $("loginError").textContent = "";
}

function signup() {
    const name = $("regName").value.trim();
    const username = $("regUser").value.trim();
    const email = $("regEmail").value.trim();
    const password = $("regPass").value;

    const error = $("signupError");

    if (!name || !username || !email || !password) {
        error.textContent = "Please fill all fields.";
        return;
    }

    if (password.length < 6) {
        error.textContent = "Password must contain at least 6 characters.";
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        error.textContent = "Enter a valid email address.";
        return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        error.textContent = "Username must be 3-20 characters (letters, numbers or _).";
        return;
    }

    users = get("ch_users");

    if (users.some(u =>
        u.username.toLowerCase() === username.toLowerCase()
    )) {
        error.textContent = "Username already exists.";
        return;
    }

    if (users.some(u =>
        u.email.toLowerCase() === email.toLowerCase()
    )) {
        error.textContent = "Email already registered.";
        return;
    }

    users.push({
        name,
        username,
        email,
        password,
        following: []
    });

    save("ch_users", users);

    $("regName").value = "";
    $("regUser").value = "";
    $("regEmail").value = "";
    $("regPass").value = "";

    showLogin();
    notify("Account created successfully! Please login.");
}

function login() {
    users = get("ch_users");

    const username = $("loginUser").value.trim();
    const password = $("loginPass").value;

    const user = users.find(u =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password
    );

    if (!user) {
        $("loginError").textContent =
            "Incorrect username or password.";
        return;
    }

    currentUser = user.username;

    localStorage.setItem("ch_session", currentUser);

    $("loginError").textContent = "";

    openApp();
}

function logout() {
    localStorage.removeItem("ch_session");

    currentUser = null;

    $("app").classList.add("hidden");
    $("auth").classList.remove("hidden");

    $("loginPass").value = "";
    $("loginUser").value = "";

    showLogin();
}

// =====================================
// OPEN APPLICATION
// =====================================

function openApp() {
    users = get("ch_users");
    posts = get("ch_posts");

    currentUser = localStorage.getItem("ch_session");

    const user = users.find(
        u => u.username === currentUser
    );

    if (!user) {
        logout();
        return;
    }

    user.following = user.following || [];

    $("auth").classList.add("hidden");
    $("app").classList.remove("hidden");

    $("sideName").textContent = user.name;
    $("sideUsername").textContent = "@" + user.username;
    $("sideAvatar").textContent = user.name.charAt(0).toUpperCase();

    renderPosts();
    renderPeople();
    renderProfile();
    renderSuggestions();
}

// =====================================
// NAVIGATION
// =====================================

function showPage(page, element) {
    const pages = [
        "home",
        "explore",
        "people",
        "profile"
    ];

    pages.forEach(p => {
        $(p + "Page").classList.add("hidden");
    });

    $(page + "Page").classList.remove("hidden");

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    if (element) {
        element.classList.add("active");
    } else {
        document.querySelectorAll(".nav-item").forEach(item => {
            if (item.textContent.includes(
                page === "profile" ? "My Profile" :
                page.charAt(0).toUpperCase() + page.slice(1)
            )) {
                item.classList.add("active");
            }
        });
    }

    if (page === "people") renderPeople();
    if (page === "profile") renderProfile();
    if (page === "explore") renderPosts();
}

// =====================================
// NOTIFICATIONS
// =====================================

let toastTimer;

function notify(message) {
    const toast = $("toast");

    toast.textContent = message;
    toast.style.display = "block";

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.style.display = "none";
    }, 2500);
}

// =====================================
// SECURITY - ESCAPE USER TEXT
// =====================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

// =====================================
// CREATE POST
// =====================================

function createPost() {
    const text = $("postText").value.trim();
    const file = $("postFile").files[0];

    if (!text && !file) {
        notify("Write something or select an image.");
        return;
    }

    if (file && !file.type.startsWith("image/")) {
        notify("Please select an image file.");
        return;
    }

    const publish = image => {
        posts = get("ch_posts");

        posts.unshift({
            id: Date.now(),
            username: currentUser,
            text: text,
            image: image,
            likes: [],
            comments: [],
            time: new Date().toLocaleString()
        });

        save("ch_posts", posts);

        $("postText").value = "";
        $("postFile").value = "";

        renderPosts();

        notify("Your post was published!");
    };

    if (file) {
        if (file.size > 1.5 * 1024 * 1024) {
            notify("Image size must be below 1.5 MB.");
            return;
        }

        const reader = new FileReader();

        reader.onload = () => publish(reader.result);

        reader.onerror = () => notify("Unable to read image.");

        reader.readAsDataURL(file);
    } else {
        publish("");
    }
}

// =====================================
// DISPLAY POSTS
// =====================================

function makePost(post) {
    const user = get("ch_users").find(
        u => u.username === post.username
    );

    const name = user ? user.name : post.username;

    const liked = post.likes.includes(currentUser);

    const imageHTML = post.image
        ? `<img class="post-image"
                src="${escapeHTML(post.image)}"
                alt="Post image">`
        : "";

    return `
        <article class="post">

            <div class="post-head">

                <div class="avatar">
                    ${escapeHTML(name.charAt(0).toUpperCase())}
                </div>

                <div>
                    <strong>${escapeHTML(name)}</strong>

                    <p class="muted">
                        @${escapeHTML(post.username)}
                        · ${escapeHTML(post.time)}
                    </p>
                </div>

            </div>

            <div class="post-content">
                ${escapeHTML(post.text).replace(/\n/g, "<br>")}
            </div>

            ${imageHTML}

            <div class="post-buttons">

                <button
                    class="${liked ? "liked" : ""}"
                    onclick="toggleLike(${post.id})">

                    ♥ ${post.likes.length} Likes

                </button>

                <button onclick="focusComment(${post.id})">

                    💬 ${post.comments.length} Comments

                </button>

            </div>

            <div class="comment-box">

                <input
                    id="comment-${post.id}"
                    placeholder="Write a comment..."
                    onkeydown="if(event.key==='Enter') addComment(${post.id})"
                >

                <button onclick="addComment(${post.id})">
                    Send
                </button>

            </div>

            <div class="comments">

                ${post.comments.map(comment => `
                    <div class="comment">
                        <strong>${escapeHTML(comment.username)}</strong>:
                        ${escapeHTML(comment.text)}
                    </div>
                `).join("")}

            </div>

        </article>
    `;
}

function renderPosts() {
    posts = get("ch_posts");

    const html = posts.length
        ? posts.map(makePost).join("")
        : `<div class="empty">
            No posts yet. Be the first to post!
           </div>`;

    $("feed").innerHTML = html;
    $("exploreFeed").innerHTML = html;
}

function focusComment(id) {
    const input = $("comment-" + id);

    if (input) input.focus();
}

// =====================================
// LIKE SYSTEM
// =====================================

function toggleLike(id) {
    posts = get("ch_posts");

    const post = posts.find(p => p.id === id);

    if (!post) return;

    post.likes = post.likes || [];

    if (post.likes.includes(currentUser)) {
        post.likes = post.likes.filter(
            username => username !== currentUser
        );
    } else {
        post.likes.push(currentUser);
    }

    save("ch_posts", posts);

    renderPosts();
}

// =====================================
// COMMENT SYSTEM
// =====================================

function addComment(id) {
    const input = $("comment-" + id);

    const text = input.value.trim();

    if (!text) {
        notify("Write a comment first.");
        return;
    }

    posts = get("ch_posts");

    const post = posts.find(p => p.id === id);

    if (!post) return;

    post.comments.push({
        username: currentUser,
        text: text
    });

    save("ch_posts", posts);

    renderPosts();

    notify("Comment added!");
}

// =====================================
// PEOPLE AND SEARCH
// =====================================

function renderPeople() {
    users = get("ch_users");

    const me = users.find(
        u => u.username === currentUser
    );

    if (!me) return;

    me.following = me.following || [];

    const query = $("search").value.trim().toLowerCase();

    const people = users.filter(user =>
        user.username !== currentUser &&
        (
            user.name.toLowerCase().includes(query) ||
            user.username.toLowerCase().includes(query)
        )
    );

    if (people.length === 0) {
        $("peopleList").innerHTML = `
            <div class="empty">No people found.</div>
        `;
        return;
    }

    $("peopleList").innerHTML = people.map(user => {
        const following = me.following.includes(user.username);

        return `
            <div class="person">

                <div class="person-info">

                    <div class="avatar">
                        ${escapeHTML(user.name.charAt(0).toUpperCase())}
                    </div>

                    <div>
                        <strong>${escapeHTML(user.name)}</strong>

                        <p class="muted">
                            @${escapeHTML(user.username)}
                        </p>
                    </div>

                </div>

                <button
                    class="follow-btn ${following ? "following" : ""}"
                    onclick="toggleFollow('${encodeURIComponent(user.username)}')">

                    ${following ? "Following" : "Follow"}

                </button>

            </div>
        `;
    }).join("");
}

// =====================================
// FOLLOW AND UNFOLLOW
// =====================================

function toggleFollow(encodedUsername) {
    const username = decodeURIComponent(encodedUsername);

    users = get("ch_users");

    const me = users.find(
        u => u.username === currentUser
    );

    if (!me) return;

    me.following = me.following || [];

    if (me.following.includes(username)) {

        me.following = me.following.filter(
            u => u !== username
        );

        notify("Unfollowed " + username);

    } else {

        me.following.push(username);

        notify("You are now following " + username);
    }

    save("ch_users", users);

    renderPeople();
    renderProfile();
    renderSuggestions();
}

// =====================================
// INSTAGRAM STYLE SUGGESTIONS
// =====================================

function renderSuggestions() {
    users = get("ch_users");

    const me = users.find(
        u => u.username === currentUser
    );

    if (!me) return;

    me.following = me.following || [];

    // Get users who are not already followed
    const suggestions = users.filter(user =>
        user.username !== currentUser &&
        !me.following.includes(user.username)
    );

    // Display maximum five suggestions
    const selected = suggestions.slice(0, 5);

    const container = $("suggestedList");

    if (!container) return;

    if (selected.length === 0) {
        container.innerHTML = `
            <p class="suggestion-empty">
                No new suggestions available.
            </p>
        `;
        return;
    }

    container.innerHTML = selected.map(user => `
        <div class="suggest-person">

            <div class="suggest-info">

                <div class="avatar">
                    ${escapeHTML(user.name.charAt(0).toUpperCase())}
                </div>

                <div class="suggest-details">

                    <strong>${escapeHTML(user.name)}</strong>

                    <p>@${escapeHTML(user.username)}</p>

                </div>

            </div>

            <button onclick="toggleFollow('${encodeURIComponent(user.username)}')">
                Follow
            </button>

        </div>
    `).join("");
}

// =====================================
// USER PROFILE
// =====================================

function renderProfile() {
    users = get("ch_users");
    posts = get("ch_posts");

    const user = users.find(
        u => u.username === currentUser
    );

    if (!user) return;

    user.following = user.following || [];

    const myPosts = posts.filter(
        post => post.username === currentUser
    );

    $("myProfile").innerHTML = `

        <div class="avatar">
            ${escapeHTML(user.name.charAt(0).toUpperCase())}
        </div>

        <h2>${escapeHTML(user.name)}</h2>

        <p class="muted">@${escapeHTML(user.username)}</p>

        <p style="margin-top:15px">
            ${user.following.length} Following
            ·
            ${myPosts.length} Posts
        </p>

    `;

    $("myPosts").innerHTML = myPosts.length
        ? myPosts.map(makePost).join("")
        : `<div class="empty">
            You haven't published any posts yet.
           </div>`;
}

// =====================================
// INITIALIZE APPLICATION
// =====================================

createDemoAccounts();

if (localStorage.getItem("ch_session")) {
    openApp();
}

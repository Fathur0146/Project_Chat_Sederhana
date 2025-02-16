let socket;
let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

document.getElementById("showRegister").addEventListener("click", () => {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("registerContainer").style.display = "block";
});

document.getElementById("showLogin").addEventListener("click", () => {
    document.getElementById("registerContainer").style.display = "none";
    document.getElementById("loginContainer").style.display = "block";
});

// Register
document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    if (!username || !password) return alert("Username dan password harus diisi!");

    try {
        const response = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Registration failed");

        alert("Registrasi berhasil! Silakan login.");
        document.getElementById("registerContainer").style.display = "none";
        document.getElementById("loginContainer").style.display = "block";
    } catch (error) {
        alert(error.message);
    }
});

// Login
document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!username || !password) return alert("Username dan password harus diisi!");

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Login failed");

        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        alert("Login successful");

        document.getElementById("loginContainer").style.display = "none";
        document.getElementById("chatContainer").style.display = "block";

        connectSocket(data.token);
        loadChatHistory(username);
    } catch (error) {
        alert(error.message);
    }
});

function connectSocket(token) {
    socket = io("http://localhost:3000", {
        path: "/socket",
        extraHeaders: { Authorization: `Bearer ${token}` }
    });

    socket.on("chat-receive", (message) => {
        displayMessage(`${message.sender || message.username}: ${message.message}`, "received");
        saveChatHistory(`${message.sender || message.username}: ${message.message}`, "received");
    });
}

function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();
    const username = localStorage.getItem("username");

    if (!message) return;

    socket.emit("chat-send", { message, sender: username });

    displayMessage(`You: ${message}`, "sent");
    saveChatHistory(`You: ${message}`, "sent");

    messageInput.value = "";
}

// Fungsi untuk menyimpan chat ke localStorage
function saveChatHistory(message, type) {
    const username = localStorage.getItem("username");
    let userChatHistory = JSON.parse(localStorage.getItem(`chatHistory_${username}`)) || [];

    userChatHistory.push({ message, type });
    localStorage.setItem(`chatHistory_${username}`, JSON.stringify(userChatHistory));
}

// Fungsi untuk memuat chat yang tersimpan
function loadChatHistory(username) {
    const messagesContainer = document.getElementById("messages");
    messagesContainer.innerHTML = ""; // Kosongkan sebelum memuat riwayat baru
    let userChatHistory = JSON.parse(localStorage.getItem(`chatHistory_${username}`)) || [];

    userChatHistory.forEach(chat => {
        displayMessage(chat.message, chat.type);
    });
}

// Fungsi untuk menampilkan pesan di tampilan chat
function displayMessage(text, type) {
    const messagesContainer = document.getElementById("messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
}

// Fungsi logout
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    document.getElementById("chatContainer").style.display = "none";
    document.getElementById("loginContainer").style.display = "block";
    alert("Logged out!");
}

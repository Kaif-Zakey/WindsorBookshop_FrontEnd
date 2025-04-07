const API_BASE_URL = "http://localhost:8080/api/v1/auth";


// Register
document.getElementById("register-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstname = document.getElementById("register-firstname").value;
    const lastname = document.getElementById("register-lastname").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const role = document.getElementById("register-role").value;

    const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            firstname, lastname, email, password, role }),
    });

    const result = await response.json();

    if (response.ok) {
        alert("Registration Successful!");
        window.location.href = "index.html";
    } else {
        document.getElementById("register-error").textContent = "Registration failed!";
    }
});

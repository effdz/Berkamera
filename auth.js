// Authentication and session management
class AuthManager {
  constructor() {
    this.currentUser = null
    this.init()
  }

  init() {
    // Check for existing session
    const session = localStorage.getItem("currentUser")
    if (session) {
      this.currentUser = JSON.parse(session)
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null
  }

  // Check if user has specific role
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser
  }

  // Login user
  login(email, password) {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u) => u.email === email && u.password === password)

    if (user) {
      const session = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        loginTime: new Date().toISOString(),
      }

      this.currentUser = session
      localStorage.setItem("currentUser", JSON.stringify(session))
      return { success: true, user: session }
    }

    return { success: false, message: "Email atau password salah" }
  }

  // Logout user
  logout() {
    this.currentUser = null
    localStorage.removeItem("currentUser")
    localStorage.removeItem("rememberedUser")
  }

  // Register new user
  register(userData) {
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // Check if email already exists
    if (users.find((u) => u.email === userData.email)) {
      return { success: false, message: "Email sudah terdaftar" }
    }

    const newUser = {
      id: "user-" + Date.now(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: "user",
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    return { success: true, message: "Registrasi berhasil" }
  }

  // Protect routes
  requireAuth(redirectUrl = "login.html") {
    if (!this.isAuthenticated()) {
      window.location.href = redirectUrl
      return false
    }
    return true
  }

  // Protect admin routes
  requireAdmin(redirectUrl = "login.html") {
    if (!this.isAuthenticated() || !this.hasRole("admin")) {
      alert("Akses ditolak. Anda harus login sebagai admin.")
      window.location.href = redirectUrl
      return false
    }
    return true
  }
}

// Create global auth instance
const auth = new AuthManager()

// Auto-redirect based on role after login
function redirectAfterLogin() {
  const user = auth.getCurrentUser()
  if (user) {
    if (user.role === "admin") {
      window.location.href = "admin-dashboard.html"
    } else {
      window.location.href = "index.html"
    }
  }
}

// Update navigation based on auth status
function updateNavigation() {
  const user = auth.getCurrentUser()
  const loginButton = document.querySelector(".quiz-button")

  if (user && loginButton) {
    loginButton.textContent = user.name
    loginButton.href = user.role === "admin" ? "admin-dashboard.html" : "profile.html"

    // Add logout option
    const logoutBtn = document.createElement("a")
    logoutBtn.href = "#"
    logoutBtn.textContent = "Logout"
    logoutBtn.className = "quiz-button"
    logoutBtn.style.marginLeft = "0.5rem"
    logoutBtn.onclick = (e) => {
      e.preventDefault()
      if (confirm("Apakah Anda yakin ingin logout?")) {
        auth.logout()
        window.location.reload()
      }
    }

    loginButton.parentNode.appendChild(logoutBtn)
  }
}

// Initialize auth on page load
document.addEventListener("DOMContentLoaded", () => {
  // Update navigation if on main pages
  if (!window.location.pathname.includes("login.html") && !window.location.pathname.includes("admin-dashboard.html")) {
    updateNavigation()
  }
})

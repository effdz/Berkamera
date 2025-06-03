// Mobile Navigation Enhancement
document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const mobileMenu = document.getElementById("mobile-menu")
  const navMenu = document.querySelector(".nav-menu")

  if (mobileMenu && navMenu) {
    mobileMenu.addEventListener("click", () => {
      navMenu.classList.toggle("active")
      mobileMenu.classList.toggle("active")

      // Prevent body scroll when menu is open
      if (navMenu.classList.contains("active")) {
        document.body.style.overflow = "hidden"
      } else {
        document.body.style.overflow = ""
      }
    })

    // Close menu when clicking on nav links
    const navLinks = navMenu.querySelectorAll("a")
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active")
        mobileMenu.classList.remove("active")
        document.body.style.overflow = ""
      })
    })

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!mobileMenu.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove("active")
        mobileMenu.classList.remove("active")
        document.body.style.overflow = ""
      }
    })
  }

  // Touch-friendly interactions
  const buttons = document.querySelectorAll(".btn, .product-card, .article-card")
  buttons.forEach((button) => {
    button.addEventListener("touchstart", function () {
      this.style.transform = "scale(0.98)"
    })

    button.addEventListener("touchend", function () {
      this.style.transform = ""
    })
  })

  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]')
  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Lazy loading for images
  const images = document.querySelectorAll("img[data-src]")
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.removeAttribute("data-src")
        observer.unobserve(img)
      }
    })
  })

  images.forEach((img) => imageObserver.observe(img))

  // Responsive table handling
  const tables = document.querySelectorAll("table")
  tables.forEach((table) => {
    if (!table.closest(".table-responsive")) {
      const wrapper = document.createElement("div")
      wrapper.className = "table-responsive"
      table.parentNode.insertBefore(wrapper, table)
      wrapper.appendChild(table)
    }
  })

  // Form validation enhancement for mobile
  const forms = document.querySelectorAll("form")
  forms.forEach((form) => {
    const inputs = form.querySelectorAll("input, select, textarea")
    inputs.forEach((input) => {
      // Add touch-friendly focus styles
      input.addEventListener("focus", function () {
        this.parentElement.classList.add("focused")
      })

      input.addEventListener("blur", function () {
        this.parentElement.classList.remove("focused")

        // Validate on blur for better UX
        if (this.hasAttribute("required") && !this.value.trim()) {
          this.classList.add("error")
        } else {
          this.classList.remove("error")
        }
      })
    })
  })

  // Optimize modal for mobile
  const modals = document.querySelectorAll(".modal")
  modals.forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active")
      }
    })

    // Prevent modal scroll on mobile
    const modalContent = modal.querySelector(".modal-content")
    if (modalContent) {
      modal.addEventListener("touchmove", (e) => {
        if (e.target === modal) {
          e.preventDefault()
        }
      })
    }
  })

  // Swipe gestures for mobile
  let startX, startY, distX, distY

  document.addEventListener("touchstart", (e) => {
    const touch = e.touches[0]
    startX = touch.clientX
    startY = touch.clientY
  })

  document.addEventListener("touchmove", (e) => {
    if (!startX || !startY) return

    const touch = e.touches[0]
    distX = touch.clientX - startX
    distY = touch.clientY - startY
  })

  document.addEventListener("touchend", (e) => {
    if (!startX || !startY) return

    // Swipe detection (minimum 100px)
    if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > 100) {
      if (distX > 0) {
        // Swipe right - could be used for navigation
        console.log("Swipe right detected")
      } else {
        // Swipe left
        console.log("Swipe left detected")
      }
    }

    startX = startY = distX = distY = null
  })

  // Viewport height fix for mobile browsers
  function setVH() {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty("--vh", `${vh}px`)
  }

  setVH()
  window.addEventListener("resize", setVH)
  window.addEventListener("orientationchange", setVH)

  // Performance optimization for mobile
  let ticking = false

  function updateOnScroll() {
    // Add scroll-based animations or effects here
    ticking = false
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateOnScroll)
      ticking = true
    }
  })

  // Preload critical resources
  const criticalImages = ["/placeholder.svg?height=400&width=600", "/placeholder.svg?height=300&width=400"]

  criticalImages.forEach((src) => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "image"
    link.href = src
    document.head.appendChild(link)
  })
})

// Utility functions for mobile optimization
function isMobile() {
  return window.innerWidth <= 768
}

function isTouch() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Export for use in other files
window.mobileUtils = {
  isMobile,
  isTouch,
  debounce,
}

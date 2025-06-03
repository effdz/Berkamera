// Cart Management System
class CartManager {
  constructor() {
    this.cart = this.loadCart()
    this.init()
  }

  init() {
    this.updateCartDisplay()
    this.bindEvents()
  }

  // Load cart from localStorage
  loadCart() {
    const savedCart = localStorage.getItem("cart")
    return savedCart ? JSON.parse(savedCart) : []
  }

  // Save cart to localStorage
  saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.cart))
    this.updateCartDisplay()
  }

  // Add item to cart
  addItem(product) {
    const existingItem = this.cart.find((item) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: 1,
      })
    }

    this.saveCart()
    this.showNotification(`${product.name} ditambahkan ke keranjang`)
  }

  // Remove item from cart
  removeItem(productId) {
    this.cart = this.cart.filter((item) => item.id !== productId)
    this.saveCart()
    this.showNotification("Item dihapus dari keranjang")
  }

  // Update item quantity
  updateQuantity(productId, quantity) {
    const item = this.cart.find((item) => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId)
      } else {
        item.quantity = quantity
        this.saveCart()
      }
    }
  }

  // Get cart total
  getTotal() {
    return this.cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  // Get cart item count
  getItemCount() {
    return this.cart.reduce((count, item) => count + item.quantity, 0)
  }

  // Clear cart
  clearCart() {
    this.cart = []
    this.saveCart()
  }

  // Update cart display
  updateCartDisplay() {
    const cartCount = document.querySelector(".cart-count")
    if (cartCount) {
      cartCount.textContent = this.getItemCount()
    }

    // Update cart page if we're on it
    if (window.location.pathname.includes("cart.html")) {
      this.renderCartPage()
    }
  }

  // Render cart page
  renderCartPage() {
    const cartContainer = document.querySelector(".cart-container")
    const emptyCart = document.querySelector(".empty-cart")

    if (this.cart.length === 0) {
      if (cartContainer) cartContainer.style.display = "none"
      if (emptyCart) emptyCart.style.display = "block"
      return
    }

    if (cartContainer) cartContainer.style.display = "grid"
    if (emptyCart) emptyCart.style.display = "none"

    const cartItems = document.querySelector(".cart-items")
    if (cartItems) {
      cartItems.innerHTML = this.cart.map((item) => this.renderCartItem(item)).join("")
      this.bindCartEvents()
    }

    this.updateCartSummary()
  }

  // Render individual cart item
  renderCartItem(item) {
    return `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <h3 class="cart-item-title">${item.name}</h3>
          <div class="cart-item-meta">${item.category}</div>
          <div class="cart-item-price">Rp ${item.price.toLocaleString("id-ID")}</div>
        </div>
        <div class="cart-item-actions">
          <div class="cart-quantity">
            <button class="cart-quantity-btn decrease" data-id="${item.id}">-</button>
            <input type="number" class="cart-quantity-input" value="${item.quantity}" min="1" max="10" data-id="${item.id}">
            <button class="cart-quantity-btn increase" data-id="${item.id}">+</button>
          </div>
          <a href="#" class="remove-item" data-id="${item.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Hapus
          </a>
        </div>
      </div>
    `
  }

  // Bind cart events
  bindCartEvents() {
    // Quantity buttons
    document.querySelectorAll(".cart-quantity-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const productId = e.target.dataset.id
        const item = this.cart.find((item) => item.id === productId)

        if (e.target.classList.contains("increase")) {
          this.updateQuantity(productId, item.quantity + 1)
        } else if (e.target.classList.contains("decrease")) {
          this.updateQuantity(productId, item.quantity - 1)
        }
      })
    })

    // Quantity inputs
    document.querySelectorAll(".cart-quantity-input").forEach((input) => {
      input.addEventListener("change", (e) => {
        const productId = e.target.dataset.id
        const quantity = Number.parseInt(e.target.value)
        this.updateQuantity(productId, quantity)
      })
    })

    // Remove buttons
    document.querySelectorAll(".remove-item").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault()
        const productId = e.target.closest(".remove-item").dataset.id
        this.removeItem(productId)
      })
    })
  }

  // Update cart summary
  updateCartSummary() {
    const subtotal = this.getTotal()
    const tax = Math.round(subtotal * 0.1)
    const total = subtotal + tax

    const subtotalElement = document.querySelector(".summary-row:first-child .summary-value")
    const taxElement = document.querySelector(".summary-row:nth-child(4) .summary-value")
    const totalElement = document.querySelector(".summary-total .summary-value")
    const itemCountElement = document.querySelector(".summary-row:first-child .summary-label")

    if (subtotalElement) subtotalElement.textContent = `Rp ${subtotal.toLocaleString("id-ID")}`
    if (taxElement) taxElement.textContent = `Rp ${tax.toLocaleString("id-ID")}`
    if (totalElement) totalElement.textContent = `Rp ${total.toLocaleString("id-ID")}`
    if (itemCountElement) itemCountElement.textContent = `Subtotal (${this.getItemCount()} item)`
  }

  // Bind global events
  bindEvents() {
    // Add to cart buttons
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("add-to-cart") || e.target.closest(".add-to-cart")) {
        e.preventDefault()
        const button = e.target.classList.contains("add-to-cart") ? e.target : e.target.closest(".add-to-cart")
        const productData = this.extractProductData(button)
        if (productData) {
          this.addItem(productData)
        }
      }
    })
  }

  // Extract product data from button
  extractProductData(button) {
    const productCard = button.closest(".product-card") || button.closest("[data-product]")

    if (productCard) {
      return {
        id: productCard.dataset.productId || `product-${Date.now()}`,
        name:
          productCard.dataset.productName || productCard.querySelector(".product-title, .product-name")?.textContent,
        price: Number.parseInt(productCard.dataset.productPrice) || this.extractPrice(productCard),
        image: productCard.dataset.productImage || productCard.querySelector("img")?.src,
        category: productCard.dataset.productCategory || "Camera",
      }
    }

    return null
  }

  // Extract price from text
  extractPrice(element) {
    const priceText = element.querySelector(".product-price, .price")?.textContent
    if (priceText) {
      return Number.parseInt(priceText.replace(/\D/g, ""))
    }
    return 0
  }

  // Show notification
  showNotification(message) {
    // Create notification element
    const notification = document.createElement("div")
    notification.className = "cart-notification"
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4caf50;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `

    // Add animation styles
    if (!document.querySelector("#cart-notification-styles")) {
      const styles = document.createElement("style")
      styles.id = "cart-notification-styles"
      styles.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `
      document.head.appendChild(styles)
    }

    document.body.appendChild(notification)

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-out"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  // Get cart data for checkout
  getCartData() {
    return {
      items: this.cart,
      subtotal: this.getTotal(),
      tax: Math.round(this.getTotal() * 0.1),
      total: this.getTotal() + Math.round(this.getTotal() * 0.1),
      itemCount: this.getItemCount(),
    }
  }

  // Prepare cart data for checkout
  prepareCheckoutData() {
    const cartData = this.getCartData()

    // Save current cart state to localStorage for checkout
    localStorage.setItem(
      "checkoutData",
      JSON.stringify({
        items: cartData.items,
        subtotal: cartData.subtotal,
        tax: cartData.tax,
        total: cartData.total,
        itemCount: cartData.itemCount,
        timestamp: Date.now(),
      }),
    )

    return cartData
  }

  // Validate cart before checkout
  validateCartForCheckout() {
    if (this.cart.length === 0) {
      return {
        valid: false,
        message: "Keranjang belanja Anda kosong. Silakan tambahkan produk terlebih dahulu.",
      }
    }

    // Check for invalid quantities
    const invalidItems = this.cart.filter((item) => item.quantity <= 0 || !item.price)
    if (invalidItems.length > 0) {
      return {
        valid: false,
        message: "Ada item dengan quantity atau harga yang tidak valid di keranjang Anda.",
      }
    }

    return {
      valid: true,
      message: "Cart is valid for checkout",
    }
  }
}

// Initialize cart manager
const cartManager = new CartManager()

// Export for use in other files
window.cartManager = cartManager

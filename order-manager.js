// Order Management System
class OrderManager {
  constructor() {
    this.orders = this.loadOrders()
    this.orderStatuses = {
      pending: "Menunggu Pembayaran",
      paid: "Dibayar",
      processing: "Diproses",
      shipped: "Dikirim",
      delivered: "Diterima",
      cancelled: "Dibatalkan",
    }
  }

  // Load orders from localStorage
  loadOrders() {
    const savedOrders = localStorage.getItem("orders")
    return savedOrders ? JSON.parse(savedOrders) : []
  }

  // Save orders to localStorage
  saveOrders() {
    localStorage.setItem("orders", JSON.stringify(this.orders))
  }

  // Create new order
  createOrder(orderData) {
    const order = {
      id: "ORD-" + Date.now(),
      ...orderData,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trackingNumber: this.generateTrackingNumber(),
    }

    this.orders.push(order)
    this.saveOrders()

    return order
  }

  // Generate tracking number
  generateTrackingNumber() {
    return "TRK" + Date.now().toString().slice(-8)
  }

  // Get order by ID
  getOrder(orderId) {
    return this.orders.find((order) => order.id === orderId)
  }

  // Update order status
  updateOrderStatus(orderId, status) {
    const order = this.getOrder(orderId)
    if (order) {
      order.status = status
      order.updatedAt = new Date().toISOString()
      this.saveOrders()
      return order
    }
    return null
  }

  // Get orders by customer email
  getOrdersByCustomer(email) {
    return this.orders.filter((order) => order.customerInfo.email === email)
  }

  // Get all orders
  getAllOrders() {
    return this.orders
  }

  // Delete order
  deleteOrder(orderId) {
    this.orders = this.orders.filter((order) => order.id !== orderId)
    this.saveOrders()
  }

  // Get order statistics
  getOrderStats() {
    const stats = {
      total: this.orders.length,
      pending: 0,
      paid: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0,
    }

    this.orders.forEach((order) => {
      stats[order.status]++
      if (order.status !== "cancelled") {
        stats.totalRevenue += order.total
      }
    })

    return stats
  }
}

// Initialize order manager
if (typeof window !== "undefined") {
  window.OrderManager = OrderManager
  if (!window.orderManager) {
    window.orderManager = new OrderManager()
  }
}

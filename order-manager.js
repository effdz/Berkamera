// Order Management System
class OrderManager {
  constructor() {
    this.orders = this.loadOrders()
    this.orderStatuses = {
      pending: { label: "Menunggu Pembayaran", color: "#ff9800" },
      paid: { label: "Dibayar", color: "#4caf50" },
      processing: { label: "Diproses", color: "#2196f3" },
      shipped: { label: "Dikirim", color: "#9c27b0" },
      delivered: { label: "Diterima", color: "#4caf50" },
      cancelled: { label: "Dibatalkan", color: "#f44336" },
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
      customerId: orderData.customerId || "guest",
      customerInfo: orderData.customerInfo,
      items: orderData.items,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      shipping: orderData.shipping || 0,
      discount: orderData.discount || 0,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      shippingMethod: orderData.shippingMethod,
      shippingAddress: orderData.shippingAddress,
      status: "pending",
      paymentStatus: "pending",
      notes: orderData.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDelivery: this.calculateEstimatedDelivery(orderData.shippingMethod),
      trackingNumber: null,
    }

    this.orders.push(order)
    this.saveOrders()

    return order
  }

  // Get order by ID
  getOrder(orderId) {
    return this.orders.find((order) => order.id === orderId)
  }

  // Get orders by customer
  getOrdersByCustomer(customerId) {
    return this.orders.filter((order) => order.customerId === customerId)
  }

  // Update order status
  updateOrderStatus(orderId, status) {
    const order = this.getOrder(orderId)
    if (order) {
      order.status = status
      order.updatedAt = new Date().toISOString()

      // Auto-generate tracking number when shipped
      if (status === "shipped" && !order.trackingNumber) {
        order.trackingNumber = this.generateTrackingNumber()
      }

      this.saveOrders()
      return true
    }
    return false
  }

  // Update payment status
  updatePaymentStatus(orderId, paymentStatus) {
    const order = this.getOrder(orderId)
    if (order) {
      order.paymentStatus = paymentStatus
      order.updatedAt = new Date().toISOString()

      // Auto-update order status based on payment
      if (paymentStatus === "completed" && order.status === "pending") {
        order.status = "paid"
      }

      this.saveOrders()
      return true
    }
    return false
  }

  // Calculate estimated delivery
  calculateEstimatedDelivery(shippingMethod) {
    const now = new Date()
    let days = 7 // default

    switch (shippingMethod) {
      case "same-day":
        days = 1
        break
      case "express":
        days = 3
        break
      case "regular":
        days = 7
        break
    }

    const deliveryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    return deliveryDate.toISOString()
  }

  // Generate tracking number
  generateTrackingNumber() {
    const prefix = "CH"
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `${prefix}${timestamp}${random}`
  }

  // Get order statistics
  getOrderStatistics() {
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
      if (order.paymentStatus === "completed") {
        stats.totalRevenue += order.total
      }
    })

    return stats
  }

  // Search orders
  searchOrders(query) {
    const searchTerm = query.toLowerCase()
    return this.orders.filter(
      (order) =>
        order.id.toLowerCase().includes(searchTerm) ||
        order.customerInfo.email.toLowerCase().includes(searchTerm) ||
        order.customerInfo.name.toLowerCase().includes(searchTerm) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchTerm)),
    )
  }

  // Get order timeline
  getOrderTimeline(orderId) {
    const order = this.getOrder(orderId)
    if (!order) return []

    const timeline = [
      {
        status: "pending",
        label: "Pesanan Dibuat",
        timestamp: order.createdAt,
        completed: true,
      },
    ]

    if (order.paymentStatus === "completed") {
      timeline.push({
        status: "paid",
        label: "Pembayaran Dikonfirmasi",
        timestamp: order.updatedAt,
        completed: true,
      })
    }

    if (["processing", "shipped", "delivered"].includes(order.status)) {
      timeline.push({
        status: "processing",
        label: "Pesanan Diproses",
        timestamp: order.updatedAt,
        completed: true,
      })
    }

    if (["shipped", "delivered"].includes(order.status)) {
      timeline.push({
        status: "shipped",
        label: "Pesanan Dikirim",
        timestamp: order.updatedAt,
        completed: true,
      })
    }

    if (order.status === "delivered") {
      timeline.push({
        status: "delivered",
        label: "Pesanan Diterima",
        timestamp: order.updatedAt,
        completed: true,
      })
    }

    return timeline
  }

  // Cancel order
  cancelOrder(orderId, reason) {
    const order = this.getOrder(orderId)
    if (order && ["pending", "paid"].includes(order.status)) {
      order.status = "cancelled"
      order.cancellationReason = reason
      order.updatedAt = new Date().toISOString()
      this.saveOrders()
      return true
    }
    return false
  }

  // Generate invoice
  generateInvoice(orderId) {
    const order = this.getOrder(orderId)
    if (!order) return null

    return {
      invoiceNumber: `INV-${order.id}`,
      order: order,
      generatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
  }
}

// Initialize order manager
const orderManager = new OrderManager()

// Export for use in other files
window.orderManager = orderManager

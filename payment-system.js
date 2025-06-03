// Payment System
class PaymentSystem {
  constructor() {
    this.paymentMethods = {
      "credit-card": {
        name: "Kartu Kredit/Debit",
        icon: "credit-card",
        processingTime: "2-3 menit",
        fee: 0.029, // 2.9%
      },
      "bank-transfer": {
        name: "Transfer Bank",
        icon: "bank",
        processingTime: "1-24 jam",
        fee: 0,
      },
      "e-wallet": {
        name: "E-Wallet",
        icon: "wallet",
        processingTime: "1-5 menit",
        fee: 0.015, // 1.5%
      },
      cod: {
        name: "Bayar di Tempat",
        icon: "cash",
        processingTime: "Saat pengiriman",
        fee: 0.01, // 1%
      },
    }

    this.banks = [
      { code: "bca", name: "Bank Central Asia (BCA)", account: "1234567890" },
      { code: "mandiri", name: "Bank Mandiri", account: "0987654321" },
      { code: "bni", name: "Bank Negara Indonesia (BNI)", account: "1122334455" },
      { code: "bri", name: "Bank Rakyat Indonesia (BRI)", account: "5544332211" },
    ]

    this.eWallets = [
      { code: "gopay", name: "GoPay", number: "081234567890" },
      { code: "ovo", name: "OVO", number: "081234567890" },
      { code: "dana", name: "DANA", number: "081234567890" },
      { code: "linkaja", name: "LinkAja", number: "081234567890" },
    ]
  }

  // Process payment
  async processPayment(paymentData) {
    try {
      // Validate payment data
      const validation = this.validatePaymentData(paymentData)
      if (!validation.isValid) {
        throw new Error(validation.message)
      }

      // Show loading
      this.showPaymentLoading()

      // Simulate payment processing
      const result = await this.simulatePaymentProcessing(paymentData)

      // Hide loading
      this.hidePaymentLoading()

      if (result.success) {
        // Save payment record
        this.savePaymentRecord(result.paymentId, paymentData)

        // Clear cart
        if (window.cartManager) {
          window.cartManager.clearCart()
        }

        // Redirect to confirmation
        window.location.href = `order-confirmation.html?order=${result.orderId}&payment=${result.paymentId}`
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      this.hidePaymentLoading()
      this.showPaymentError(error.message)
    }
  }

  // Validate payment data
  validatePaymentData(data) {
    if (!data.paymentMethod) {
      return { isValid: false, message: "Pilih metode pembayaran" }
    }

    if (!data.customerInfo || !data.customerInfo.email) {
      return { isValid: false, message: "Email wajib diisi" }
    }

    if (data.paymentMethod === "credit-card") {
      if (!data.cardDetails || !data.cardDetails.number || !data.cardDetails.expiry || !data.cardDetails.cvv) {
        return { isValid: false, message: "Lengkapi data kartu kredit" }
      }
    }

    if (!data.orderData || !data.orderData.items || data.orderData.items.length === 0) {
      return { isValid: false, message: "Keranjang kosong" }
    }

    return { isValid: true }
  }

  // Simulate payment processing
  async simulatePaymentProcessing(paymentData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 95% success rate
        const isSuccess = Math.random() > 0.05

        if (isSuccess) {
          const orderId = "ORD-" + Date.now()
          const paymentId = "PAY-" + Date.now()

          resolve({
            success: true,
            orderId: orderId,
            paymentId: paymentId,
            status: paymentData.paymentMethod === "bank-transfer" ? "pending" : "completed",
            message: "Pembayaran berhasil diproses",
          })
        } else {
          resolve({
            success: false,
            message: "Pembayaran gagal. Silakan coba lagi.",
          })
        }
      }, 2000) // 2 second delay
    })
  }

  // Save payment record
  savePaymentRecord(paymentId, paymentData) {
    const payments = JSON.parse(localStorage.getItem("payments") || "[]")

    const paymentRecord = {
      id: paymentId,
      orderId: paymentData.orderId,
      method: paymentData.paymentMethod,
      amount: paymentData.orderData.total,
      status: paymentData.paymentMethod === "bank-transfer" ? "pending" : "completed",
      customerInfo: paymentData.customerInfo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    payments.push(paymentRecord)
    localStorage.setItem("payments", JSON.stringify(payments))
  }

  // Get payment methods with fees
  getPaymentMethodsWithFees(amount) {
    return Object.entries(this.paymentMethods).map(([key, method]) => ({
      key,
      ...method,
      feeAmount: Math.round(amount * method.fee),
      totalAmount: amount + Math.round(amount * method.fee),
    }))
  }

  // Generate payment instructions
  generatePaymentInstructions(method, amount, orderId) {
    switch (method) {
      case "bank-transfer":
        return this.generateBankTransferInstructions(amount, orderId)
      case "e-wallet":
        return this.generateEWalletInstructions(amount, orderId)
      case "credit-card":
        return this.generateCreditCardInstructions()
      case "cod":
        return this.generateCODInstructions()
      default:
        return null
    }
  }

  // Generate bank transfer instructions
  generateBankTransferInstructions(amount, orderId) {
    return {
      title: "Instruksi Transfer Bank",
      steps: [
        "Pilih salah satu bank di bawah ini:",
        ...this.banks.map((bank) => `${bank.name}\nNo. Rekening: ${bank.account}\nAtas Nama: Berkamera Indonesia`),
        `Transfer sejumlah: Rp ${amount.toLocaleString("id-ID")}`,
        `Kode Unik: ${orderId}`,
        "Upload bukti transfer melalui WhatsApp: +62 123 456 7890",
        "Pembayaran akan dikonfirmasi dalam 1-24 jam",
      ],
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    }
  }

  // Generate e-wallet instructions
  generateEWalletInstructions(amount, orderId) {
    return {
      title: "Instruksi Pembayaran E-Wallet",
      steps: [
        "Pilih salah satu e-wallet di bawah ini:",
        ...this.eWallets.map((wallet) => `${wallet.name}: ${wallet.number}`),
        `Transfer sejumlah: Rp ${amount.toLocaleString("id-ID")}`,
        `Catatan: ${orderId}`,
        "Screenshot bukti pembayaran dan kirim ke WhatsApp: +62 123 456 7890",
        "Pembayaran akan dikonfirmasi dalam 1-5 menit",
      ],
      expiry: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    }
  }

  // Generate credit card instructions
  generateCreditCardInstructions() {
    return {
      title: "Pembayaran Kartu Kredit",
      steps: [
        "Pembayaran akan diproses secara otomatis",
        "Pastikan data kartu yang dimasukkan benar",
        'Transaksi akan muncul di rekening koran dengan nama "BERKAMERA"',
        "Simpan email konfirmasi sebagai bukti pembayaran",
      ],
    }
  }

  // Generate COD instructions
  generateCODInstructions() {
    return {
      title: "Bayar di Tempat (COD)",
      steps: [
        "Siapkan uang pas sesuai total pembayaran",
        "Pembayaran dilakukan saat barang diterima",
        "Periksa kondisi barang sebelum melakukan pembayaran",
        "Minta struk pembayaran dari kurir",
      ],
    }
  }

  // Show payment loading
  showPaymentLoading() {
    const loading = document.createElement("div")
    loading.id = "payment-loading"
    loading.innerHTML = `
      <div class="payment-loading-overlay">
        <div class="payment-loading-content">
          <div class="payment-loading-spinner"></div>
          <h3>Memproses Pembayaran...</h3>
          <p>Mohon tunggu, jangan tutup halaman ini</p>
        </div>
      </div>
    `

    loading.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10000;
    `

    // Add styles
    if (!document.querySelector("#payment-loading-styles")) {
      const styles = document.createElement("style")
      styles.id = "payment-loading-styles"
      styles.textContent = `
        .payment-loading-overlay {
          background: rgba(0, 0, 0, 0.8);
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .payment-loading-content {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          text-align: center;
          max-width: 400px;
        }
        .payment-loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #e74c3c;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `
      document.head.appendChild(styles)
    }

    document.body.appendChild(loading)
  }

  // Hide payment loading
  hidePaymentLoading() {
    const loading = document.getElementById("payment-loading")
    if (loading) {
      loading.remove()
    }
  }

  // Show payment error
  showPaymentError(message) {
    alert(`Error: ${message}`)
  }

  // Get payment status
  getPaymentStatus(paymentId) {
    const payments = JSON.parse(localStorage.getItem("payments") || "[]")
    return payments.find((payment) => payment.id === paymentId)
  }

  // Update payment status
  updatePaymentStatus(paymentId, status) {
    const payments = JSON.parse(localStorage.getItem("payments") || "[]")
    const payment = payments.find((p) => p.id === paymentId)

    if (payment) {
      payment.status = status
      payment.updatedAt = new Date().toISOString()
      localStorage.setItem("payments", JSON.stringify(payments))
    }
  }
}

// Initialize payment system
const paymentSystem = new PaymentSystem()

// Export for use in other files
window.paymentSystem = paymentSystem

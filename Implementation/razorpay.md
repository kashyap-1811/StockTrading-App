# Razorpay Wallet Payment Integration Flow

This document details the step-by-step integration of the Razorpay Payment Gateway inside the StockTrading application. It explains exactly how request transfers happen between the Client, Server, and Razorpay APIs.

---

## 1. Step-by-Step Payment Flow

Here is the sequential flow of how requests transfer, where they go, and how the wallet points are updated:

### Step 1: Initializing configuration keys
**Client** makes an HTTP GET request to the Server at `/razorpay-key`  
**Server** reads `process.env.KEY_ID` and responds back with `{ success: true, key: "rzp_test_..." }`  
**Client** saves this public key in the component's state (`razorpayKey`)  

---

### Step 2: Triggering Payment & Script Loading
**User** clicks "Add Funds" in the dashboard, enters an amount (e.g. ₹1000), and submits the form  
**Client** dynamically loads the Razorpay checkout script from `https://checkout.razorpay.com/v1/checkout.js` into the browser DOM  
**Client** sends a POST request to the Server at `/wallet/add/create-order` containing:
```json
{
  "amount": 1000
}
```
*(Also sends the user's JWT Authorization token in the headers)*

---

### Step 3: Backend Order Creation
**Server** receives the POST request and verifies the JWT token (extracting the user's ID)  
**Server** validates the amount (checks that it's between ₹1 and ₹1,00,000)  
**Server** converts the amount to paise (e.g., `1000 * 100 = 100000 paise` because Razorpay operates in the smallest currency unit)  
**Server** makes a secure API request to **Razorpay API** via the `razorpay` library:
```javascript
razorpay.orders.create({
  amount: 100000,
  currency: "INR",
  receipt: "wf_171801234567",
  notes: { userId: "user_mongodb_id", type: "wallet_funding", amount: 1000 }
})
```
**Razorpay API** receives the order details, registers the order on its server, and responds to the **Server** with:
```json
{
  "id": "order_DUmN7B4x...",
  "amount": 100000,
  "currency": "INR",
  "receipt": "wf_171801234567"
}
```
**Server** forwards this response back to the **Client**  

---

### Step 4: Loading Checkout UI
**Client** receives the order details from the server  
**Client** instantiates and opens the Razorpay Checkout widget (`new window.Razorpay(options)`) overlaying the screen  
**User** interacts with the Razorpay modal, inputs payment details (UPI, Card, Netbanking), and authorizes the transaction  
**Razorpay** processes the payment on its secure payment processor network  

---

### Step 5: Authorization Callback
**Razorpay** completes the payment transaction and generates authorization credentials:
* `razorpay_payment_id` (unique payment ID)
* `razorpay_order_id` (the order ID from Step 3)
* `razorpay_signature` (SHA256 HMAC signature proving the payment was completed securely via Razorpay)
**Razorpay** triggers the success callback (`handler` function) in the **Client** web browser, supplying these three credentials  

---

### Step 6: Verifying Payment Authenticity
**Client** makes an HTTP POST request to the Server at `/wallet/add/verify-payment` containing:
```json
{
  "razorpay_order_id": "order_DUmN7B4x...",
  "razorpay_payment_id": "pay_DUmN8C7y...",
  "razorpay_signature": "signature_hash...",
  "amount": 100000
}
```
*(Also sends the user's JWT Authorization token in the headers)*

**Server** receives the credentials and performs secure checks:
1. **Signature Verification**: Server computes an HMAC-SHA256 hash using its private `process.env.KEY_SECRET` combined with the string `razorpay_order_id + "|" + razorpay_payment_id` and compares it against the received `razorpay_signature`.
2. **Amount Verification**: Server calls the **Razorpay API** `razorpay.orders.fetch(razorpay_order_id)` to retrieve the true registered amount of the order, verifying that it matches the amount received in the request.

---

### Step 7: Wallet Balancing & DB Update
**Server** converts the paise back to Rupees (`amount / 100 = 1000`)  
**Server** queries MongoDB for the user's profile and updates their points:
```javascript
user.points += 1000;
user.totalPointsAdded += 1000;
```
**Server** writes a transaction record to `HistoryModel` in MongoDB:
```javascript
{
  userId: "user_mongodb_id",
  type: "ADD_FUNDS",
  amount: 1000,
  transactionId: "pay_DUmN8C7y...",
  orderId: "order_DUmN7B4x...",
  paymentMethod: "Razorpay",
  status: "completed"
}
```
**Server** responds to the **Client** with:
```json
{
  "success": true,
  "message": "Funds added successfully",
  "data": { "newBalance": 5000, "amountAdded": 100000, "transactionId": "pay_DUmN8C7y..." }
}
```

---

### Step 8: Dashboard Refresh
**Client** receives `{ success: true }` from the server and shows a success alert  
**Client** makes a final GET request to the Server at `/funds` to fetch the updated balance and transactions  
**Server** fetches user details from MongoDB and responds with updated balance and transaction history arrays  
**Client** updates the state (`points`, `totalAdded`, `history`), prompting React to render the new wallet balance and display the transaction in the recent transactions table  

---

## 2. Server-Side Route Implementations

### Order Creation
In [RazorPayPayment.js](file:///c:/CE/CE%20SEM-V/AT/StockTrading/backend/routes/RazorPayPayment.js), the router handles order creation:
```javascript
router.post("/wallet/add/create-order", verifyToken, async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.id;

  const options = {
    amount: amount * 100, // Paise conversion
    currency: "INR",
    receipt: `wf_${Date.now()}`,
    notes: {
      userId: userId,
      type: "wallet_funding",
      amount: amount
    }
  };

  const order = await razorpay.orders.create(options);
  res.status(200).json({ success: true, order });
});
```

### Signature Verification
The verification endpoint performs cryptography validation:
```javascript
router.post("/wallet/add/verify-payment", verifyToken, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
  const userId = req.user.id;

  // Verify signature
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature !== expectedSign) {
    return res.status(400).json({ success: false, message: "Invalid payment signature" });
  }

  // Double check amount from official Razorpay record
  const order = await razorpay.orders.fetch(razorpay_order_id);
  if (order.amount !== amount) {
    return res.status(400).json({ success: false, message: "Amount mismatch" });
  }

  // Update MongoDB
  const correctedAmount = amount / 100;
  const user = await UsersModel.findById(userId);
  await UsersModel.findByIdAndUpdate(userId, {
    points: (user.points || 0) + correctedAmount,
    totalPointsAdded: (user.totalPointsAdded || 0) + correctedAmount
  });

  // Save transaction history
  const historyRecord = new HistoryModel({
    userId,
    type: "ADD_FUNDS",
    amount: correctedAmount,
    transactionId: razorpay_payment_id,
    orderId: razorpay_order_id,
    paymentMethod: "Razorpay",
    status: "completed"
  });
  await historyRecord.save();

  res.status(200).json({ success: true, message: "Funds added successfully" });
});
```

---

## 3. Client-Side Options Configuration

In [Funds.js](file:///c:/CE/CE%20SEM-V/AT/StockTrading/dashboard/src/components/funds/Funds.js), the configuration passed to the SDK is built as follows:

```javascript
const options = {
  key: razorpayKey,
  amount: order.amount,
  currency: order.currency,
  name: "Stock Trading Platform",
  description: `Add funds to wallet - ₹${val}`,
  order_id: order.id,
  handler: async function (response) {
    // Triggers Step 6 verification via post request:
    const verifyRes = await axios.post(`${API_BASE_URL}/wallet/add/verify-payment`, {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      amount: order.amount,
    }, { headers: { Authorization: `Bearer ${token}` } });
    
    if (verifyRes.data.success) {
      // Refresh context UI
    }
  },
  prefill: {
    name: "User",
    email: "user@example.com",
    contact: "9999999999",
  },
  theme: { color: "#4F46E5" }
};
const rzp = new window.Razorpay(options);
rzp.open();
```

---

## 4. How the Razorpay Modal Opens in the Browser Under the Hood

The modal popup overlay that users interact with is generated and managed through a client-side execution cycle:

1. **Script Dynamic Loading**: 
   When the user submits the fund amount, the client inserts a script element pointing to Razorpay's CDN checkout script (`https://checkout.razorpay.com/v1/checkout.js`) into the document body. This exposes the global `window.Razorpay` constructor.

2. **Initialization of SDK Class**: 
   The client instantiates the script class:
   `const rzp = new window.Razorpay(options);`
   The `options` object configures details like payment order IDs, styling themes, fallback/success handlers, and merchant details.

3. **Calling `.open()`**: 
   When the client calls `rzp.open()`, the Razorpay script triggers the payment form layout builder.

4. **DOM Iframe Injection (Under the Hood)**:
   * Razorpay's client library dynamically constructs a modal container element (using styling such as `position: fixed`, `z-index: 999999`, `top: 0`, `left: 0`) overlaying the viewport.
   * It creates a secure `<iframe>` pointing to Razorpay's payment routing URLs (e.g., `api.razorpay.com`).
   * This sandbox iframe isolates payment input fields (card details, UPI credentials, netbanking portals) from the merchant's parent site, ensuring PCI-DSS compliance and preventing the host application's scripts from accessing sensitive billing details.

5. **Closing/Dismiss Handling**:
   * If the user completes the payment, the transaction values are sent back to the client's `handler` callback, and the iframe/modal is removed from the DOM automatically.
   - If the user manually closes the overlay (clicks the close "X" button), Razorpay fires the custom `modal.ondismiss` callback, where the local state is cleaned up (e.g., `setModalLoading(false)`).

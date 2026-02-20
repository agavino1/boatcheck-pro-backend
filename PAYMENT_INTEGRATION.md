# Stripe Payment Integration Guide

## Overview

BoatCheckPro uses Stripe for secure payment processing. This guide explains how to set up and test the payment system.

## Setting Up Stripe

### 1. Create a Stripe Account

1. Visit [stripe.com](https://stripe.com)
2. Sign up for a new account
3. Verify your email and complete onboarding
4. Access the [Dashboard](https://dashboard.stripe.com)

### 2. Get API Keys

1. Go to **Developers** → **API Keys**
2. You'll see both test and live keys
3. For development, use **Test Keys**:
   - **Publishable Key** (pk_test_...)
   - **Secret Key** (sk_test_...)

### 3. Configure .env

Add your test keys to `.env`:

```env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLIC_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_test_your_key_here
```

## Payment Flow

### Client-side (Frontend)
1. Client initiates payment for inspection
2. Frontend requests payment intent from backend
3. Backend creates Stripe PaymentIntent
4. Frontend uses client secret to create payment method
5. Payment is processed via Stripe Elements or Payment Methods

### Server-side (Backend)
1. `/api/payments/create-intent` - Creates payment intent
2. `/api/payments/confirm` - Confirms payment completion
3. `/api/payments/webhook` - Handles Stripe events

## API Implementation

### Create Payment Intent

```javascript
POST /api/payments/create-intent
Authorization: Bearer <token>

{
  "inspectionId": "uuid",
  "amount": 450.00
}

Response:
{
  "clientSecret": "pi_test_..._secret_...",
  "payment": {
    "id": "uuid",
    "amount": 450.00,
    "status": "procesando",
    "stripePaymentIntentId": "pi_test_..."
  }
}
```

### Confirm Payment

```javascript
POST /api/payments/confirm
Authorization: Bearer <token>

{
  "paymentIntentId": "pi_test_..."
}

Response:
{
  "message": "Payment confirmed successfully",
  "payment": {
    "id": "uuid",
    "status": "completado",
    "invoiceNumber": "INV-2024-001"
  },
  "invoiceUrl": "https://api.boatcheck.pro/invoices/..."
}
```

## Testing Payments

### Test Card Numbers

Use these card numbers in test mode:

| Card Type | Card Number | Exp Date | CVC |
|-----------|-------------|----------|-----|
| Visa | 4242 4242 4242 4242 | Any future | Any |
| Visa (debit) | 4000 0566 5566 5556 | Any future | Any |
| Mastercard | 5555 5555 5555 4444 | Any future | Any |
| Amex | 3782 822463 10005 | Any future | Any |
| Declined | 4000 0000 0000 0002 | Any future | Any |

### Testing in Development

1. **Create payment intent**:
```bash
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inspectionId": "inspection-uuid",
    "amount": 450.00
  }'
```

2. **Simulate payment on frontend** using Stripe.js:
```javascript
// Use the clientSecret from step 1
const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: 'John Doe' }
  }
});
```

3. **Confirm payment on backend**:
```bash
curl -X POST http://localhost:3000/api/payments/confirm \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "pi_test_..."
  }'
```

## Webhook Setup

### Setting Up Webhooks in Stripe Dashboard

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter endpoint URL:
   ```
   https://yourdomain.com/api/payments/webhook
   ```
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy the webhook secret (Signing secret)
7. Add to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Testing Webhooks Locally

Use Stripe CLI to test webhooks locally:

1. **Install Stripe CLI**:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Linux
   curl https://files.stripe.com/stripe-cli/install.sh -O && bash install.sh

   # Windows
   choco install stripe-cli
   ```

2. **Login to your Stripe account**:
   ```bash
   stripe login
   ```

3. **Forward events to localhost**:
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/webhook
   ```

4. **Trigger test events**:
   ```bash
   stripe trigger payment_intent.succeeded
   ```

## Frontend Integration Example

### React Component Example

```javascript
import { loadStripe } from '@stripe/js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

function PaymentForm({ inspectionId, amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Step 1: Create payment intent on backend
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inspectionId, amount })
    });

    const { clientSecret } = await response.json();

    // Step 2: Confirm payment with Stripe
    const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: 'John Doe' }
        }
      }
    );

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
      return;
    }

    // Step 3: Confirm on backend
    const confirmResponse = await fetch('/api/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paymentIntentId: paymentIntent.id })
    });

    const result = await confirmResponse.json();
    setLoading(false);

    if (result.message) {
      alert('Payment successful!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay'}
      </button>
      {error && <p>{error}</p>}
    </form>
  );
}

export default function CheckoutPage({ inspectionId, amount }) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm inspectionId={inspectionId} amount={amount} />
    </Elements>
  );
}
```

## Payment Status Flow

```
pendiente (initial)
    ↓
procesando (PaymentIntent created)
    ↓
completado (Payment successful)
   OR
fallido (Payment declined)
    ↓
reembolsado (Refund processed)
```

## Handling Webhooks

The webhook endpoint handles these events:

### `payment_intent.succeeded`
- Updates payment status to "completado"
- Records payment date
- Generates invoice
- Updates inspection status

### `payment_intent.payment_failed`
- Updates payment status to "fallido"
- Logs error details
- Notifies user

## Production Considerations

### Switching to Live Keys

1. In Stripe Dashboard, switch from Test to Live keys
2. Update `.env` with live keys:
   ```env
   STRIPE_SECRET_KEY=sk_live_your_key
   STRIPE_PUBLIC_KEY=pk_live_your_key
   STRIPE_WEBHOOK_SECRET=whsec_live_your_key
   ```

3. Set `NODE_ENV=production`
4. Ensure HTTPS is enabled
5. Update webhook endpoint URL to live domain

### Security Best Practices

1. **Never expose secret key** in frontend or client code
2. **Always verify webhook signatures** (already implemented)
3. **Use HTTPS** for all payment endpoints
4. **Store API keys** in environment variables only
5. **Validate amounts** on backend before processing
6. **Implement rate limiting** on payment endpoints
7. **Log all transactions** for auditing

## Refunds

### Processing a Refund

```bash
curl -X POST http://localhost:3000/api/payments/:paymentId/refund \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

Response:
```json
{
  "message": "Refund processed successfully",
  "refundId": "re_1234567890",
  "payment": {
    "status": "reembolsado",
    "amount": 450.00
  }
}
```

## Invoices

### Generating Invoices

Invoices are automatically generated when payment is confirmed. They include:
- Invoice number
- Invoice date
- Payment date
- Client information
- Inspection details
- Amount paid
- Payment method

Invoices are stored and can be retrieved via:
```bash
GET /api/payments/:paymentId
```

## Troubleshooting

### Payment Intent Creation Fails
- Check Stripe API keys in `.env`
- Verify inspection exists
- Check database connection

### Webhook Events Not Received
- Ensure endpoint is publicly accessible
- Verify webhook secret is correct
- Check Stripe webhook logs in dashboard
- Use Stripe CLI to forward events locally

### Payment Confirmation Fails
- Verify PaymentIntent ID is correct
- Check payment status is "requires_payment_method"
- Ensure authorization is valid

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Support](https://support.stripe.com)

---

Last Updated: 2024-02-19

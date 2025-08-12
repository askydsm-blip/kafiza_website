import Stripe from 'stripe';

// Initialize Stripe with secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use latest stable API version
});

/**
 * Payment Service
 * Handles all payment-related operations using Stripe
 * 
 * This service layer abstracts payment operations and can be easily
 * extended or replaced with other payment providers in the future.
 * 
 * IMPORTANT: In production, ensure proper error handling, logging,
 * and security measures are implemented.
 */

export interface PaymentIntentData {
  amount: number; // Amount in cents
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
  description?: string;
}

export interface PaymentMethodData {
  type: 'card' | 'bank_account';
  card?: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
  };
  billingDetails?: {
    name: string;
    email: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
}

export interface PaymentResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

/**
 * Create a payment intent for processing payments
 * 
 * This function creates a PaymentIntent object in Stripe, which represents
 * your intent to collect payment from a customer. The PaymentIntent tracks
 * the lifecycle of the payment and ensures that the payment is only
 * processed once.
 * 
 * @param paymentData - Payment intent configuration
 * @returns Promise<PaymentResponse> - Success/failure response with payment intent data
 * 
 * Usage example:
 * const paymentIntent = await createPaymentIntent({
 *   amount: 5000, // $50.00
 *   currency: 'usd',
 *   description: 'Coffee beans order #12345'
 * });
 */
export async function createPaymentIntent(paymentData: PaymentIntentData): Promise<PaymentResponse> {
  try {
    // Validate required fields
    if (!paymentData.amount || paymentData.amount <= 0) {
      return {
        success: false,
        error: 'Invalid amount: must be greater than 0'
      };
    }

    if (!paymentData.currency) {
      return {
        success: false,
        error: 'Currency is required'
      };
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentData.amount,
      currency: paymentData.currency,
      customer: paymentData.customerId,
      metadata: paymentData.metadata,
      description: paymentData.description,
      // Add automatic payment methods
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      },
      message: 'Payment intent created successfully'
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Handle specific Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return {
        success: false,
        error: `Stripe error: ${error.message}`
      };
    }

    return {
      success: false,
      error: 'Failed to create payment intent'
    };
  }
}

/**
 * Confirm a payment intent
 * 
 * This function confirms a PaymentIntent and processes the payment.
 * It should be called from your frontend after collecting payment method details.
 * 
 * @param paymentIntentId - The ID of the payment intent to confirm
 * @param paymentMethodId - The ID of the payment method to use
 * @returns Promise<PaymentResponse> - Success/failure response
 */
export async function confirmPaymentIntent(
  paymentIntentId: string, 
  paymentMethodId: string
): Promise<PaymentResponse> {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    return {
      success: true,
      data: {
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      },
      message: 'Payment confirmed successfully'
    };
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return {
        success: false,
        error: `Stripe error: ${error.message}`
      };
    }

    return {
      success: false,
      error: 'Failed to confirm payment intent'
    };
  }
}

/**
 * Create a customer in Stripe
 * 
 * This function creates a customer object in Stripe, which can be used
 * to store payment methods and track payment history.
 * 
 * @param customerData - Customer information
 * @returns Promise<PaymentResponse> - Success/failure response with customer data
 */
export async function createCustomer(customerData: {
  email: string;
  name?: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}): Promise<PaymentResponse> {
  try {
    const customer = await stripe.customers.create({
      email: customerData.email,
      name: customerData.name,
      phone: customerData.phone,
      address: customerData.address,
    });

    return {
      success: true,
      data: {
        customerId: customer.id,
        email: customer.email,
        name: customer.name
      },
      message: 'Customer created successfully'
    };
  } catch (error) {
    console.error('Error creating customer:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return {
        success: false,
        error: `Stripe error: ${error.message}`
      };
    }

    return {
      success: false,
      error: 'Failed to create customer'
    };
  }
}

/**
 * Retrieve payment intent details
 * 
 * @param paymentIntentId - The ID of the payment intent to retrieve
 * @returns Promise<PaymentResponse> - Success/failure response with payment intent data
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<PaymentResponse> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: true,
      data: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        created: paymentIntent.created,
        metadata: paymentIntent.metadata
      }
    };
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return {
        success: false,
        error: `Stripe error: ${error.message}`
      };
    }

    return {
      success: false,
      error: 'Failed to retrieve payment intent'
    };
  }
}

/**
 * Cancel a payment intent
 * 
 * @param paymentIntentId - The ID of the payment intent to cancel
 * @returns Promise<PaymentResponse> - Success/failure response
 */
export async function cancelPaymentIntent(paymentIntentId: string): Promise<PaymentResponse> {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    return {
      success: true,
      data: {
        status: paymentIntent.status,
        cancelledAt: paymentIntent.cancellation_reason
      },
      message: 'Payment intent cancelled successfully'
    };
  } catch (error) {
    console.error('Error cancelling payment intent:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return {
        success: false,
        error: `Stripe error: ${error.message}`
      };
    }

    return {
      success: false,
      error: 'Failed to cancel payment intent'
    };
  }
}

/**
 * FUTURE EXPANSION IDEAS:
 * 
 * 1. Subscription Management:
 *    - createSubscription()
 *    - cancelSubscription()
 *    - updateSubscription()
 * 
 * 2. Refund Processing:
 *    - createRefund()
 *    - getRefundHistory()
 * 
 * 3. Webhook Handling:
 *    - handleWebhook()
 *    - processPaymentSuccess()
 *    - processPaymentFailure()
 * 
 * 4. Payment Method Management:
 *    - attachPaymentMethod()
 *    - detachPaymentMethod()
 *    - listPaymentMethods()
 * 
 * 5. Invoice Generation:
 *    - createInvoice()
 *    - sendInvoice()
 *    - getInvoiceHistory()
 * 
 * 6. Multi-Currency Support:
 *    - convertCurrency()
 *    - getExchangeRates()
 * 
 * 7. Analytics & Reporting:
 *    - getPaymentAnalytics()
 *    - generateRevenueReport()
 *    - getCustomerPaymentHistory()
 * 
 * 8. Security & Compliance:
 *    - validatePaymentMethod()
 *    - fraudDetection()
 *    - complianceReporting()
 */

export default {
  createPaymentIntent,
  confirmPaymentIntent,
  createCustomer,
  getPaymentIntent,
  cancelPaymentIntent
};


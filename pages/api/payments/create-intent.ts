import type { NextApiRequest, NextApiResponse } from 'next';
import { createPaymentIntent, PaymentIntentData } from '../../../lib/payments';
import { ApiResponse } from '../../../lib/types';

/**
 * Payment Intent API Route
 * 
 * POST /api/payments/create-intent - Create a new payment intent
 * 
 * This route demonstrates usage of the Stripe payment service.
 * The payment service abstracts payment operations and can be easily
 * extended or replaced with other payment providers in the future.
 * 
 * IMPORTANT: In production, ensure proper authentication and authorization
 * are implemented before allowing payment operations.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }

  try {
    // Validate request body
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required'
      });
    }

    const {
      amount,
      currency,
      customerId,
      metadata,
      description
    } = req.body;

    // Validate required fields
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Amount is required and must be a number'
      });
    }

    if (!currency || typeof currency !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Currency is required and must be a string'
      });
    }

    // Validate amount (must be positive and reasonable)
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }

    // Validate currency format (basic check)
    if (!/^[a-z]{3}$/.test(currency.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid currency format. Use 3-letter currency code (e.g., USD, EUR)'
      });
    }

    // Validate metadata if provided
    if (metadata && typeof metadata !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Metadata must be an object'
      });
    }

    // Validate description if provided
    if (description && typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Description must be a string'
      });
    }

    // Build payment intent data
    const paymentData: PaymentIntentData = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customerId: customerId || undefined,
      metadata: metadata || undefined,
      description: description || undefined
    };

    // Create payment intent using service
    const result = await createPaymentIntent(paymentData);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in POST /api/payments/create-intent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    });
  }
}


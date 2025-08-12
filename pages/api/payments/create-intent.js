/**
 * API Route: Create Payment Intent
 * 
 * This endpoint creates a new payment intent for processing payments.
 * It demonstrates how to integrate with the payments service module.
 * 
 * POST /api/payments/create-intent
 * Body: {
 *   amount: number,        // Amount in cents (e.g., 1000 = $10.00)
 *   currency: string,      // Currency code (e.g., 'usd')
 *   description: string,   // Payment description
 *   metadata: object       // Additional payment metadata (optional)
 * }
 */

const { createPaymentIntent } = require('../../../lib/payments');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'Only POST requests are allowed for this endpoint'
    });
  }

  try {
    // Validate request body
    const { amount, currency, description, metadata } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
        message: 'Amount must be a positive number representing cents'
      });
    }

    if (!currency || typeof currency !== 'string' || currency.length !== 3) {
      return res.status(400).json({
        success: false,
        error: 'Invalid currency',
        message: 'Currency must be a 3-letter currency code (e.g., "usd")'
      });
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid description',
        message: 'Description is required and must be a non-empty string'
      });
    }

    // Prepare payment data
    const paymentData = {
      amount: Math.round(amount), // Ensure amount is an integer
      currency: currency.toLowerCase(),
      description: description.trim(),
      metadata: metadata || {}
    };

    // Create payment intent using the payments service
    const result = await createPaymentIntent(paymentData);

    if (result.success) {
      // Return success response
      return res.status(201).json({
        success: true,
        data: result.data,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } else {
      // Return error response from service
      return res.status(400).json({
        success: false,
        error: result.error,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Return generic error response
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while creating the payment intent',
      timestamp: new Date().toISOString()
    });
  }
}


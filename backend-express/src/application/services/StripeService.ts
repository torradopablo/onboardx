import Stripe from 'stripe';
import { env } from '@/config/env';
import { IUserRepository } from '@/domain/repositories/IUserRepository';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export class StripeService {
  constructor(private userRepository: IUserRepository) {}

  async createCheckoutSession(userId: string, priceId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    // Get or create Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;
      await this.userRepository.update(userId, {
        stripe_customer_id: customerId,
      } as any);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_URL}/billing`,
    });

    return session;
  }

  async getSubscriptionStatus(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.stripe_customer_id) {
      return null;
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      limit: 1,
    });

    return subscriptions.data[0] || null;
  }

  async createPortalSession(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.stripe_customer_id) {
      throw new Error('No billing information found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${env.FRONTEND_URL}/dashboard`,
    });

    return session;
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          // Update user subscription status
          console.log('Subscription created:', subscription);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription cancelled:', subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment succeeded:', invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment failed:', invoice);
        break;
      }
    }
  }

  verifyWebhookSignature(body: string, signature: string): Stripe.Event {
    return stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  }
}

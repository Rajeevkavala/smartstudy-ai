# Phase 10 — Stripe Payment Migration

## Overview

Migrate Stripe payment processing from Supabase Edge Functions (Deno) to Python (FastAPI). This covers checkout session creation, webhook handling, subscription management, and usage-based limits.

**Duration**: Week 5  
**Dependencies**: Phase 7 (API endpoints), Phase 9 (Frontend refactor)  
**Deliverables**: SubscriptionService, webhook handler, usage tracking

---

## Architecture

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│ React    │     │ FastAPI      │     │ Stripe       │
│ Frontend │     │              │     │              │
│          │     │ POST /api/   │     │ Checkout     │
│ Click    │────▶│ subscriptions│────▶│ Session      │
│ "Upgrade"│     │ /checkout    │     │              │
│          │     └──────────────┘     └──────┬───────┘
│          │                                 │
│          │◀── Redirect to Stripe ──────────┘
│          │                                 │
│          │     ┌──────────────┐     ┌──────┴───────┐
│          │     │ FastAPI      │◀────│ Stripe       │
│ Settings │◀────│ POST /api/   │     │ Webhook      │
│ page     │     │ webhooks/    │     │ (payment     │
│ updated  │     │ stripe       │     │  confirmed)  │
│          │     └──────────────┘     └──────────────┘
└──────────┘
```

---

## Step-by-Step Guide

### Step 10.1 — Install Dependencies

Add to `requirements.txt`:
```
stripe>=7.0.0
```

### Step 10.2 — Configuration

Add to `app/config.py`:
```python
class Settings(BaseSettings):
    # ... existing settings ...

    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    STRIPE_PRO_PRICE_ID: str
    STRIPE_UNIVERSITY_PRICE_ID: str

    # App
    VITE_APP_URL: str = "http://localhost:5173"
```

### Step 10.3 — Subscription Service

```python
# app/services/subscription_service.py
import stripe
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

class SubscriptionService:
    """Manages Stripe subscriptions and customer records."""

    async def create_checkout_session(
        self, user_id: str, plan_id: str, email: str
    ) -> str:
        """Create a Stripe Checkout Session. Returns the checkout URL."""
        price_id = {
            "pro": settings.STRIPE_PRO_PRICE_ID,
            "university": settings.STRIPE_UNIVERSITY_PRICE_ID,
        }.get(plan_id)

        if not price_id:
            raise ValueError(f"Invalid plan: {plan_id}")

        # Get or create Stripe customer
        customer = await self._get_or_create_customer(user_id, email)

        session = stripe.checkout.Session.create(
            customer=customer.id,
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            subscription_data={"trial_period_days": 14},
            success_url=f"{settings.VITE_APP_URL}/settings?checkout=success",
            cancel_url=f"{settings.VITE_APP_URL}/pricing?checkout=canceled",
            metadata={"user_id": user_id, "plan_id": plan_id},
        )

        return session.url

    async def _get_or_create_customer(self, user_id: str, email: str):
        """Get existing Stripe customer or create a new one."""
        from app.core.database import async_session

        async with async_session() as db:
            result = await db.execute(
                text("SELECT stripe_customer_id FROM subscriptions WHERE user_id = :uid"),
                {"uid": user_id},
            )
            row = result.fetchone()

            if row and row.stripe_customer_id:
                return stripe.Customer.retrieve(row.stripe_customer_id)

            # Create new customer
            customer = stripe.Customer.create(
                email=email,
                metadata={"user_id": user_id},
            )

            # Store customer ID
            await db.execute(
                text("""
                    INSERT INTO subscriptions (user_id, stripe_customer_id)
                    VALUES (:uid, :cid)
                    ON CONFLICT (user_id) DO UPDATE SET stripe_customer_id = :cid
                """),
                {"uid": user_id, "cid": customer.id},
            )
            await db.commit()

            return customer

    async def get_subscription(self, db: AsyncSession, user_id: str) -> dict:
        """Get user's current subscription details."""
        result = await db.execute(
            text("SELECT * FROM subscriptions WHERE user_id = :uid"),
            {"uid": user_id},
        )
        row = result.fetchone()
        if not row:
            return {"plan": "free", "status": "active"}
        return dict(row._mapping)

    async def cancel_subscription(self, db: AsyncSession, user_id: str) -> dict:
        """Cancel subscription at period end."""
        result = await db.execute(
            text("SELECT stripe_subscription_id FROM subscriptions WHERE user_id = :uid"),
            {"uid": user_id},
        )
        row = result.fetchone()
        if not row or not row.stripe_subscription_id:
            raise ValueError("No active subscription found")

        stripe.Subscription.modify(
            row.stripe_subscription_id,
            cancel_at_period_end=True,
        )

        await db.execute(
            text("UPDATE subscriptions SET cancel_at_period_end = TRUE WHERE user_id = :uid"),
            {"uid": user_id},
        )
        await db.commit()

        return {"status": "canceling"}
```

### Step 10.4 — Stripe Webhook Handler

```python
# app/api/webhooks.py
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import stripe
from app.config import settings
from app.core.database import get_db

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])

@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Handle Stripe webhook events.
    Validates webhook signature to prevent tampering.

    Events handled:
    - checkout.session.completed → activate subscription
    - customer.subscription.updated → update status/dates
    - customer.subscription.deleted → cancel subscription
    - invoice.payment_failed → mark past_due
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")

    if event.type == "checkout.session.completed":
        session = event.data.object
        user_id = session.metadata.get("user_id")
        plan_id = session.metadata.get("plan_id")

        if user_id and plan_id:
            await db.execute(
                text("""
                    INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan, status)
                    VALUES (:uid, :cid, :sid, :plan, 'active')
                    ON CONFLICT (user_id) DO UPDATE SET
                        stripe_customer_id = :cid,
                        stripe_subscription_id = :sid,
                        plan = :plan,
                        status = 'active',
                        updated_at = NOW()
                """),
                {
                    "uid": user_id,
                    "cid": session.customer,
                    "sid": session.subscription,
                    "plan": plan_id,
                },
            )
            await db.commit()

    elif event.type == "customer.subscription.updated":
        sub = event.data.object
        await db.execute(
            text("""
                UPDATE subscriptions SET
                    status = :status,
                    current_period_start = to_timestamp(:period_start),
                    current_period_end = to_timestamp(:period_end),
                    cancel_at_period_end = :cancel,
                    updated_at = NOW()
                WHERE stripe_subscription_id = :sid
            """),
            {
                "status": sub.status,
                "period_start": sub.current_period_start,
                "period_end": sub.current_period_end,
                "cancel": sub.cancel_at_period_end,
                "sid": sub.id,
            },
        )
        await db.commit()

    elif event.type == "customer.subscription.deleted":
        sub = event.data.object
        await db.execute(
            text("""
                UPDATE subscriptions SET
                    status = 'canceled', plan = 'free', updated_at = NOW()
                WHERE stripe_subscription_id = :sid
            """),
            {"sid": sub.id},
        )
        await db.commit()

    elif event.type == "invoice.payment_failed":
        invoice = event.data.object
        await db.execute(
            text("""
                UPDATE subscriptions SET status = 'past_due', updated_at = NOW()
                WHERE stripe_customer_id = :cid
            """),
            {"cid": invoice.customer},
        )
        await db.commit()

    return {"status": "ok"}
```

### Step 10.5 — Subscription API Endpoints

```python
# app/api/subscriptions.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.subscription_service import SubscriptionService

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])

sub_service = SubscriptionService()

@router.get("")
async def get_subscription(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's subscription details."""
    return await sub_service.get_subscription(db, user["id"])

@router.post("/checkout")
async def create_checkout(
    request: dict,
    user: dict = Depends(get_current_user),
):
    """Create a Stripe Checkout Session for upgrading."""
    url = await sub_service.create_checkout_session(
        user_id=user["id"],
        plan_id=request["planId"],
        email=user["email"],
    )
    return {"url": url}

@router.post("/cancel")
async def cancel_subscription(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel subscription at end of billing period."""
    return await sub_service.cancel_subscription(db, user["id"])
```

### Step 10.6 — Usage Tracking Service

```python
# app/services/usage_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import date, timedelta

# Usage limits per plan
PLAN_LIMITS = {
    "free": {
        "chat": 20,
        "questions": 10,
        "flashcards": 5,
        "summaries": 5,
        "uploads": 3,
        "battles": 2,
        "weakness": 3,
        "concepts": 3,
        "pyq": 2,
        "feynman": 3,
        "study_plans": 2,
    },
    "pro": {
        "chat": 200,
        "questions": 100,
        "flashcards": 50,
        "summaries": 50,
        "uploads": 30,
        "battles": 20,
        "weakness": 30,
        "concepts": 30,
        "pyq": 20,
        "feynman": 30,
        "study_plans": 20,
    },
    "university": {
        # Unlimited — represented by very high numbers
        "chat": 999999,
        "questions": 999999,
        "flashcards": 999999,
        "summaries": 999999,
        "uploads": 999999,
        "battles": 999999,
        "weakness": 999999,
        "concepts": 999999,
        "pyq": 999999,
        "feynman": 999999,
        "study_plans": 999999,
    },
}

class UsageService:
    async def check_usage(self, db: AsyncSession, user_id: str, feature: str) -> dict:
        """Check if user can use a feature based on their plan limits."""
        # Get user's plan
        sub_result = await db.execute(
            text("SELECT plan FROM subscriptions WHERE user_id = :uid"),
            {"uid": user_id},
        )
        row = sub_result.fetchone()
        plan = row.plan if row else "free"

        # Get current period usage
        today = date.today()
        period_start = today.replace(day=1)
        period_end = (period_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)

        usage_result = await db.execute(
            text("""
                SELECT count FROM usage_tracking
                WHERE user_id = :uid AND feature = :feature AND period_start = :start
            """),
            {"uid": user_id, "feature": feature, "start": period_start},
        )
        usage_row = usage_result.fetchone()
        current_count = usage_row.count if usage_row else 0

        limit = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"]).get(feature, 0)
        allowed = current_count < limit

        return {
            "allowed": allowed,
            "current": current_count,
            "limit": limit,
            "plan": plan,
            "feature": feature,
        }

    async def increment_usage(self, db: AsyncSession, user_id: str, feature: str):
        """Increment usage counter for a feature."""
        today = date.today()
        period_start = today.replace(day=1)
        period_end = (period_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)

        await db.execute(
            text("""
                INSERT INTO usage_tracking (user_id, feature, count, period_start, period_end)
                VALUES (:uid, :feature, 1, :start, :end)
                ON CONFLICT (user_id, feature, period_start)
                DO UPDATE SET count = usage_tracking.count + 1
            """),
            {"uid": user_id, "feature": feature, "start": period_start, "end": period_end},
        )
        await db.commit()
```

### Step 10.7 — Usage API Endpoints

```python
# app/api/usage.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.usage_service import UsageService

router = APIRouter(prefix="/api/usage", tags=["usage"])

usage_service = UsageService()

@router.get("")
async def get_usage(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all usage stats for current period."""
    features = ["chat", "questions", "flashcards", "summaries", "uploads",
                 "battles", "weakness", "concepts", "pyq", "feynman", "study_plans"]
    usage = {}
    for feature in features:
        usage[feature] = await usage_service.check_usage(db, user["id"], feature)
    return usage

@router.post("/check")
async def check_usage(
    request: dict,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Check if user can use a specific feature."""
    return await usage_service.check_usage(db, user["id"], request["feature"])
```

---

## Subscription Plans

| Feature | Free | Pro ($9/mo) | University ($19/mo) |
|---------|------|------------|-------------------|
| Chat messages | 20/month | 200/month | Unlimited |
| Question generation | 10/month | 100/month | Unlimited |
| Flashcard sets | 5/month | 50/month | Unlimited |
| Summaries | 5/month | 50/month | Unlimited |
| Document uploads | 3/month | 30/month | Unlimited |
| Battles | 2/month | 20/month | Unlimited |
| Weakness analysis | 3/month | 30/month | Unlimited |
| Concept extraction | 3/month | 30/month | Unlimited |
| PYQ analysis | 2/month | 20/month | Unlimited |
| Feynman sessions | 3/month | 30/month | Unlimited |
| Study plans | 2/month | 20/month | Unlimited |

---

## Frontend Integration

```typescript
// src/pages/Pricing.tsx
import { api } from '@/lib/api-client';

const handleUpgrade = async (planId: string) => {
  const { url } = await api.post<{ url: string }>('/api/subscriptions/checkout', {
    planId,
  });
  window.location.href = url; // Redirect to Stripe Checkout
};
```

```typescript
// Usage check before feature use
const checkAndUseFeature = async (feature: string) => {
  const { allowed, current, limit } = await api.post('/api/usage/check', { feature });
  if (!allowed) {
    toast.error(`You've reached your ${feature} limit (${current}/${limit}). Upgrade your plan!`);
    return false;
  }
  return true;
};
```

---

## Verification Checklist

- [ ] Stripe Checkout Session creates successfully
- [ ] Checkout redirects to Stripe payment page
- [ ] Webhook receives `checkout.session.completed` event
- [ ] Subscription status updates in database
- [ ] `subscription.updated` event updates period dates
- [ ] `subscription.deleted` event cancels subscription
- [ ] `invoice.payment_failed` event marks past_due
- [ ] Webhook signature validation rejects tampered payloads
- [ ] Usage tracking increments correctly
- [ ] Usage limits enforce plan restrictions
- [ ] Free users are blocked after limit
- [ ] Pro/University users have higher/unlimited limits
- [ ] Frontend redirects to Stripe correctly
- [ ] Settings page shows current subscription details

---

## Stripe Webhook Testing

```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_failed
```

---

## Next Phase

Once payments are working end-to-end, proceed to [Phase 11 — DevOps & Deployment](phase-11-devops-deployment.md).

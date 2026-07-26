import razorpay
import os
import logging

logger = logging.getLogger("DF-PAYMENTS")
ALLOW_TEST_PAYMENTS = os.environ.get("ALLOW_TEST_PAYMENTS", "").strip().lower() == "true"
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "").strip()
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "").strip()

if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    if not ALLOW_TEST_PAYMENTS:
        raise RuntimeError("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set before starting the application")
    logger.warning("ALLOW_TEST_PAYMENTS=true: using Razorpay test placeholders; payments are not production-safe")
    RAZORPAY_KEY_ID = RAZORPAY_KEY_ID or "rzp_test_your_id"
    RAZORPAY_KEY_SECRET = RAZORPAY_KEY_SECRET or "your_secret"

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

def create_order(amount: float, currency: str = "INR"):
    data = {
        "amount": int(amount * 100), # Amount in paise
        "currency": currency,
        "payment_capture": 1
    }
    order = client.order.create(data=data)
    return order

def verify_payment(order_id: str, payment_id: str, signature: str):
    params_dict = {
        'razorpay_order_id': order_id,
        'razorpay_payment_id': payment_id,
        'razorpay_signature': signature
    }
    try:
        client.utility.verify_payment_signature(params_dict)
        return True
    except:
        return False

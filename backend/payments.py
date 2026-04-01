import razorpay
import os

RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "rzp_test_your_id")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "your_secret")

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

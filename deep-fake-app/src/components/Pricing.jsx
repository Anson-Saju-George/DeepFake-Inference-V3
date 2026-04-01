import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Zap, Sparkles } from 'lucide-react';

const RAZORPAY_KEY_ID = "rzp_live_SUhpE0sGoGzURD"; 

export const Pricing = ({ user, onAuthRequired, onUpdateUser }) => {
  // Use an object to track loading per unique category-quantity combination
  const [loadingStates, setLoadingStates] = useState({});

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePurchase = async (category, quantity, amount) => {
    if (!user) {
      onAuthRequired();
      return;
    }

    const loadKey = `${category}-${quantity}`;
    setLoadingStates(prev => ({ ...prev, [loadKey]: true }));
    const token = localStorage.getItem("token");

    try {
      // 1. Create order on backend with category, quantity AND specific bundle amount
      const res = await fetch(`/deepfake/api/payments/create-order?category=${category}&quantity=${quantity}&amount=${amount}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const order = await res.json();

      if (!res.ok) throw new Error(order.detail || "Order creation failed");

      // 2. Open Razorpay Checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "DF-ENGINE CLUSTER",
        description: `Acquire ${quantity} ${category.toUpperCase()} Credits`,
        order_id: order.id,
        handler: async function (response) {
          // 3. Verify payment on backend
          const verifyRes = await fetch("/deepfake/api/payments/verify", {
            method: "POST",
            headers: { 
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization": `Bearer ${token}` 
            },
            body: new URLSearchParams({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature
            })
          });

          if (verifyRes.ok) {
            onUpdateUser();
            alert("Credits successfully provisioned to node.");
          } else {
            alert("Verification failed");
          }
        },
        theme: { color: "#06b6d4" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert(err.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadKey]: false }));
    }
  };

  const categories = [
    {
      id: "image",
      title: "Image Verification",
      price: 10,
      icon: <Zap size={20} className="text-cyan-400" />,
      options: [
        { credits: 5, amount: 50 },
        { credits: 25, amount: 200, popular: true },
        { credits: 100, amount: 700 },
      ]
    },
    {
      id: "video",
      title: "Video Intelligence",
      price: 20,
      icon: <Sparkles size={20} className="text-blue-400" />,
      options: [
        { credits: 3, amount: 60 },
        { credits: 15, amount: 250, popular: true },
        { credits: 50, amount: 800 },
      ]
    }
  ];

  return (
    <section id="pricing" className="bg-white py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-1 text-[10px] font-black text-cyan-600 uppercase tracking-widest">
            Compute Allocation
          </div>
          <h2 className="font-Sora text-3xl font-bold tracking-tight text-[#0A0A0A] md:text-5xl uppercase text-center">
            Acquire Credits
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto font-Inter font-medium italic leading-relaxed text-center">
            Provision additional neural processing time. Free tiers are limited to 5 image and 3 video research samples.
          </p>
        </div>
        
        <div className="space-y-24 text-center md:text-left">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-10">
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <div className="p-3 rounded-2xl bg-[#0B0F14] text-white shadow-xl shadow-cyan-500/10">
                  {cat.icon}
                </div>
                <h3 className="font-Sora text-2xl font-bold uppercase tracking-tight text-[#0A0A0A]">{cat.title}</h3>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {cat.options.map((opt, i) => {
                  const loadKey = `${cat.id}-${opt.credits}`;
                  const isLoading = loadingStates[loadKey];
                  return (
                    <div key={i} className={`relative flex flex-col rounded-[2rem] border p-8 transition-all hover:scale-[1.02] ${
                      opt.popular 
                      ? "bg-[#0B0F14] text-white border-cyan-500/30 shadow-2xl shadow-cyan-500/10" 
                      : "border-gray-100 bg-gray-50/50 text-[#0A0A0A]"
                    }`}>
                      {opt.popular && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500 px-4 py-1 text-[8px] font-black text-black uppercase tracking-widest">
                          High Yield
                        </div>
                      )}
                      <div className="mb-8">
                        <div className="flex items-baseline gap-2 justify-center md:justify-start">
                          <span className="text-4xl font-Sora font-bold tracking-tighter">₹{opt.amount}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${opt.popular ? "text-gray-500" : "text-gray-400"}`}>
                            / {opt.credits} Credits
                          </span>
                        </div>
                      </div>
                      <button 
                        disabled={isLoading}
                        onClick={() => handlePurchase(cat.id, opt.credits, opt.amount)}
                        className={`mt-auto w-full rounded-2xl py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                          opt.popular
                          ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
                          : "bg-white text-black border border-gray-200 hover:border-black shadow-sm"
                        } ${isLoading ? 'opacity-50' : ''}`}
                      >
                        {isLoading ? "INITIALIZING..." : "PROVISION"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

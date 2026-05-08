import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';

const RAZORPAY_KEY_ID = "rzp_live_SUhpE0sGoGzURD";

export const Pricing = ({ user, onAuthRequired, onUpdateUser }) => {
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
    setLoadingStates((prev) => ({ ...prev, [loadKey]: true }));
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/deepfake/api/payments/create-order?category=${category}&quantity=${quantity}&amount=${amount}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const order = await res.json();

      if (!res.ok) throw new Error(order.detail || "Order creation failed");

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "DF-ENGINE CLUSTER",
        description: `Acquire ${quantity} ${category.toUpperCase()} Credits`,
        order_id: order.id,
        handler: async function (response) {
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
      setLoadingStates((prev) => ({ ...prev, [loadKey]: false }));
    }
  };

  const categories = [
    {
      id: "image",
      title: "Image Inference",
      subtitle: "Static-image jobs routed to image-trained ConvNeXt, Swin, and ViT checkpoints.",
      icon: <Zap size={20} className="text-cyan-400" />,
      unit: "One credit processes one image sample.",
      options: [
        { credits: 5, amount: 50, label: "Starter" },
        { credits: 25, amount: 200, label: "Research Batch", popular: true },
        { credits: 100, amount: 700, label: "Dataset Sweep" },
      ]
    },
    {
      id: "video",
      title: "Video Inference",
      subtitle: "Raw-video jobs routed to sequence, spatial, or hybrid video models in isolated GPU workers.",
      icon: <Sparkles size={20} className="text-blue-400" />,
      unit: "One credit processes one uploaded video clip.",
      options: [
        { credits: 3, amount: 60, label: "Clip Trial" },
        { credits: 15, amount: 250, label: "Validation Batch", popular: true },
        { credits: 50, amount: 800, label: "Video Sweep" },
      ]
    }
  ];

  return (
    <section id="pricing" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-1.5 text-xs font-black text-cyan-600 uppercase tracking-widest">
            Compute Allocation
          </div>
          <h2 className="font-Sora text-3xl font-bold tracking-tight text-[#0A0A0A] md:text-5xl uppercase text-center">
            Acquire Credits
          </h2>
          <p className="mx-auto max-w-2xl text-center font-Inter text-sm font-medium leading-6 text-gray-500">
            Credits are split by media domain because image and video jobs use different model families,
            upload limits, and isolated GPU worker lifecycles.
          </p>
        </div>

        <div className="space-y-12 text-center md:text-left">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-5">
              <div className="flex flex-col gap-3 text-center md:flex-row md:items-center md:text-left">
                <div className="mx-auto rounded-xl bg-[#0B0F14] p-2.5 text-white shadow-lg shadow-cyan-500/10 md:mx-0">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="font-Sora text-xl font-bold uppercase tracking-tight text-[#0A0A0A]">{cat.title}</h3>
                  <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-500">{cat.subtitle}</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {cat.options.map((opt) => {
                  const loadKey = `${cat.id}-${opt.credits}`;
                  const isLoading = loadingStates[loadKey];
                  return (
                    <motion.div
                      key={loadKey}
                      whileHover={{ y: -4 }}
                      className={`relative flex flex-col rounded-2xl border p-5 transition-all ${
                        opt.popular
                          ? "border-cyan-500/30 bg-[#0B0F14] text-white shadow-2xl shadow-cyan-500/10"
                          : "border-gray-200 bg-gray-100/70 text-[#0A0A0A]"
                      }`}
                    >
                      {opt.popular && (
                        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500 px-3 py-0.5 text-[9px] font-black uppercase tracking-widest text-black">
                          Best Value
                        </div>
                      )}
                      <div className="mb-5">
                        <div className={`mb-2 text-[10px] font-black uppercase tracking-widest ${opt.popular ? "text-cyan-300" : "text-gray-500"}`}>
                          {opt.label}
                        </div>
                        <div className="flex items-baseline justify-center gap-2 md:justify-start">
                          <span className="font-Sora text-3xl font-bold tracking-tighter">Rs. {opt.amount}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${opt.popular ? "text-gray-500" : "text-gray-500"}`}>
                            / {opt.credits} Credits
                          </span>
                        </div>
                        <p className={`mt-2 text-xs leading-5 ${opt.popular ? "text-gray-400" : "text-gray-600"}`}>
                          {cat.unit}
                        </p>
                      </div>
                      <button
                        disabled={isLoading}
                        onClick={() => handlePurchase(cat.id, opt.credits, opt.amount)}
                        className={`mt-auto w-full rounded-xl py-3 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
                          opt.popular
                            ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 hover:bg-cyan-400"
                            : "border border-gray-200 bg-white text-black shadow-sm hover:border-black"
                        } ${isLoading ? 'opacity-50' : ''}`}
                      >
                        {isLoading ? "INITIALIZING..." : "PROVISION"}
                      </button>
                    </motion.div>
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

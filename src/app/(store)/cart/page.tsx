"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import CartAddressForm, { AddressData } from "@/components/CartAddressForm";
import CartPaymentMethod, { PaymentOption } from "@/components/CartPaymentMethod";
import { createClient } from "@/lib/supabase/client";
import { loadRazorpayScript } from "@/lib/razorpay";

export default function CartPage() {
  const { items, count, total, removeItem, updateQty, clearCart } = useCart();

  const [address, setAddress] = useState<AddressData>({
    fullName: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  interface ConfirmedOrderInfo {
    id: string;
    paymentId?: string;
    total: number;
    advanceAmount: number;
    balanceDue: number;
    isCodAdvance: boolean;
    paymentMethod: PaymentOption;
    address: AddressData;
  }

  const [paymentMethod, setPaymentMethod] = useState<PaymentOption>("online");
  const [errors, setErrors] = useState<Partial<Record<keyof AddressData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState<ConfirmedOrderInfo | null>(null);
  const [codSettings, setCodSettings] = useState<{ enabled: boolean; amount: string }>({
    enabled: false,
    amount: "199",
  });

  React.useEffect(() => {
    if (orderPlaced && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [orderPlaced]);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("settings")
          .select("key, value")
          .in("key", ["cod_advance_enabled", "cod_advance_amount"]);

        if (data && data.length > 0) {
          const cfg: { enabled: boolean; amount: string } = { enabled: false, amount: "199" };
          data.forEach((item) => {
            if (item.key === "cod_advance_enabled") cfg.enabled = item.value === "true";
            if (item.key === "cod_advance_amount" && item.value) cfg.amount = item.value;
          });
          setCodSettings(cfg);
        }
      } catch {
        // Fallback gracefully
      }
    };
    fetchSettings();
  }, []);

  const isCodAdvance = paymentMethod === "cod" && codSettings.enabled;
  const advanceAmount = isCodAdvance ? Math.min(Number(codSettings.amount) || 199, total) : 0;
  const balanceDue = Math.max(0, total - advanceAmount);

  const handleAddressChange = (field: keyof AddressData, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof AddressData, string>> = {};
    if (!address.fullName.trim()) errs.fullName = "Full name is required";
    if (!address.phone.trim() || address.phone.trim().length < 10) {
      errs.phone = "Valid 10-digit phone number is required";
    }
    if (!address.email.trim() || !/\S+@\S+\.\S+/.test(address.email)) {
      errs.email = "Valid email is required";
    }
    if (!address.street.trim()) errs.street = "Street address is required";
    if (!address.city.trim()) errs.city = "City is required";
    if (!address.state.trim()) errs.state = "State is required";
    if (!address.pincode.trim() || address.pincode.trim().length < 6) {
      errs.pincode = "Valid 6-digit PIN code is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckout = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setCheckoutError(null);

    try {
      // 1. Ensure Razorpay client script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Unable to load Razorpay payment gateway. Please check your internet connection.");
      }

      // Snapshot values for order confirmation before cart is cleared
      const currentTotal = total;
      const currentAddress = { ...address };
      const currentPaymentMethod = paymentMethod;

      // 2. Create Razorpay order via backend
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          totalAmount: currentTotal,
          paymentMethod: currentPaymentMethod,
          advanceAmount,
          customer: {
            name: currentAddress.fullName,
            email: currentAddress.email,
            phone: currentAddress.phone,
          },
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to initialize payment gateway");
      }

      // 3. Open Razorpay Checkout Modal
      interface RazorpayPaymentResponse {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }

      interface RazorpayModalInstance {
        open: () => void;
        on: (event: string, callback: (err: { error?: { description?: string } }) => void) => void;
      }

      interface RazorpayConstructor {
        new (options: unknown): RazorpayModalInstance;
      }

      const RazorpayClass = (window as unknown as { Razorpay: RazorpayConstructor }).Razorpay;

      const rzp = new RazorpayClass({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SPECTRA Eyewear",
        description: isCodAdvance
          ? `COD Advance Deposit (₹${orderData.chargeAmount})`
          : `Order Payment (₹${orderData.totalAmount})`,
        image: "/logo/logo.png",
        order_id: orderData.orderId,
        prefill: {
          name: currentAddress.fullName,
          email: currentAddress.email,
          contact: currentAddress.phone,
        },
        theme: {
          color: "#c8874a",
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            // 4. Server-side HMAC Signature Verification
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                address: currentAddress,
                items,
                totalAmount: currentTotal,
                chargeAmount: orderData.chargeAmount,
                balanceDue: orderData.balanceDue,
                paymentMethod: currentPaymentMethod,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setOrderPlaced({
                id: verifyData.orderId,
                paymentId: response.razorpay_payment_id,
                total: currentTotal,
                advanceAmount: orderData.chargeAmount,
                balanceDue: orderData.balanceDue,
                isCodAdvance,
                paymentMethod: currentPaymentMethod,
                address: currentAddress,
              });
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
              clearCart();
            } else {
              setCheckoutError(verifyData.error || "Payment verification failed. Please contact support.");
            }
          } catch {
            setCheckoutError("Error verifying payment with server. Please contact support.");
          } finally {
            setSubmitting(false);
          }
        },
      });

      rzp.on("payment.failed", (err) => {
        setCheckoutError(err.error?.description || "Payment failed. Please try again.");
        setSubmitting(false);
      });

      rzp.open();
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : "Payment checkout failed");
      setSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 text-white py-5">
        <div className="text-center max-w-md">
          <h1 className="text-[26px] font-bold text-white uppercase tracking-wider">
            Order Confirmed!
          </h1>
          <p className="text-[13px] text-white/50 mt-2">
            Thank you for choosing SPECTRA. Your order #{orderPlaced.id.slice(0, 8)} has been placed successfully.
          </p>
          <div className="mt-4 p-4 bg-white/[0.03] rounded-sm text-left text-[12px] text-white/70 space-y-1.5">
            <p><span className="text-white/40">Recipient:</span> {orderPlaced.address.fullName}</p>
            <p><span className="text-white/40">Delivery to:</span> {orderPlaced.address.street}, {orderPlaced.address.city}, {orderPlaced.address.pincode}</p>
            <p><span className="text-white/40">Total Order:</span> ₹{orderPlaced.total.toLocaleString("en-IN")}</p>
            {orderPlaced.isCodAdvance ? (
              <>
                <p className="text-emerald-400 font-semibold">
                  <span className="text-white/40">Advance Paid:</span> ₹{orderPlaced.advanceAmount.toLocaleString("en-IN")}
                </p>
                <p className="text-[#c8874a] font-semibold">
                  <span className="text-white/40">Balance on Delivery:</span> ₹{orderPlaced.balanceDue.toLocaleString("en-IN")}
                </p>
              </>
            ) : (
              <p className="text-emerald-400 font-semibold">
                <span className="text-white/40">Payment:</span> Online (Full Paid — ₹{orderPlaced.total.toLocaleString("en-IN")})
              </p>
            )}
            {orderPlaced.paymentId && (
              <p className="text-[11px] text-white/40 pt-1 border-t border-white/[0.05]">
                Transaction ID: {orderPlaced.paymentId}
              </p>
            )}
          </div>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#c8874a] hover:bg-[#b87840] text-white text-[13px] font-bold px-6 py-3.5 rounded-sm transition-colors uppercase tracking-wider"
        >
          <ArrowLeft size={15} />
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 text-white">
        <div className="w-24 h-24 rounded-sm bg-white/[0.05] flex items-center justify-center">
          <ShoppingBag size={40} className="text-white/20" />
        </div>
        <div className="text-center">
          <h1 className="text-[24px] font-bold text-white">Your cart is empty</h1>
          <p className="text-[14px] text-white/40 mt-2">Add some SPECTRA sunglasses to get started.</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#c8874a] hover:bg-[#b87840] text-white text-[13px] font-bold px-6 py-3.5 rounded-sm transition-colors uppercase tracking-wider"
        >
          <ArrowLeft size={15} />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight uppercase">Checkout & Cart</h1>
          <p className="text-[12.5px] text-white/40 mt-0.5">
            {count} item{count !== 1 ? "s" : ""} selected
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-[12px] text-white/30 hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 size={13} />
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Address Entry & Payment Method */}
        <div className="lg:col-span-7 space-y-4">
          <CartAddressForm
            address={address}
            onChange={handleAddressChange}
            errors={errors}
          />

          <CartPaymentMethod
            selected={paymentMethod}
            onChange={setPaymentMethod}
            codAdvanceEnabled={codSettings.enabled}
            codAdvanceAmount={codSettings.amount}
          />
        </div>

        {/* Right Side: Items List & Order Summary */}
        <div className="lg:col-span-5 space-y-4">
          {/* Items Preview */}
          <div className="bg-white/[0.03] p-4 rounded-sm space-y-3">
            <h2 className="text-[14px] font-bold text-white uppercase tracking-wider px-1 pb-1">
              Order Items ({count})
            </h2>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3.5 p-3 bg-white/[0.03] rounded-sm"
                >
                  <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-sm bg-[#f5f0eb] overflow-hidden relative">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} fill className="object-contain p-1.5" />
                      ) : (
                        <ShoppingBag size={18} className="absolute inset-0 m-auto text-gray-400" />
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.slug}`}>
                      <p className="text-[13px] font-bold text-white hover:text-[#c8874a] transition-colors truncate">
                        {item.name}
                      </p>
                    </Link>
                    <p className="text-[11px] text-white/40 truncate">{item.subtitle}</p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-white/[0.06] rounded-sm px-1 py-0.5">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-5 h-5 rounded-sm flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.1] transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="w-6 text-center text-[11.5px] font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-5 h-5 rounded-sm flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.1] transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className="text-[13.5px] font-bold text-[#c8874a]">
                          &#8377;{(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-white/20 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white/[0.03] rounded-sm p-6 space-y-4">
            <h2 className="text-[14px] font-bold text-white uppercase tracking-wider">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-[13px]">
              <div className="flex justify-between text-white/60">
                <span>Subtotal ({count} items)</span>
                <span>&#8377;{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Shipping</span>
                <span className="text-emerald-400 font-semibold">Free</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Payment Mode</span>
                <span className="text-white/80 font-medium">{paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</span>
              </div>

              {isCodAdvance && (
                <>
                  <div className="flex justify-between text-emerald-400 font-semibold pt-1 border-t border-white/[0.05]">
                    <span>Advance Deposit (Pay Now)</span>
                    <span>&#8377;{advanceAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-[#c8874a] font-semibold">
                    <span>Balance on Delivery (COD)</span>
                    <span>&#8377;{balanceDue.toLocaleString("en-IN")}</span>
                  </div>
                </>
              )}

              <div className="h-px bg-white/[0.07] my-1" />
              <div className="flex justify-between font-bold text-white text-[15px]">
                <span>Total Order Value</span>
                <span>&#8377;{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Error Message */}
            {checkoutError && (
              <div className="flex items-start gap-2.5 p-3 rounded-sm bg-red-500/10 text-red-400 text-[12px]">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Proceed to Checkout CTA */}
            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#c8874a] hover:bg-[#b87840] disabled:opacity-50 text-white text-[13px] font-bold py-3.5 rounded-sm transition-colors uppercase tracking-wider cursor-pointer shadow-lg shadow-[#c8874a]/20"
            >
              {submitting ? (
                <><Loader2 size={15} className="animate-spin" />Processing...</>
              ) : isCodAdvance ? (
                <>Pay &#8377;{advanceAmount.toLocaleString("en-IN")} Advance & Place Order<ArrowRight size={15} /></>
              ) : (
                <>Pay &#8377;{total.toLocaleString("en-IN")} & Place Order<ArrowRight size={15} /></>
              )}
            </button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 pt-1">
              {["Free Returns", "Secure Payment", "30-Day Warranty"].map((t) => (
                <span key={t} className="text-[10px] text-white/25 text-center">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Center: Continue Shopping Button */}
      <div className="flex justify-center pt-8 pb-5 sm:pb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-[12px] font-semibold px-6 py-3 rounded-sm transition-colors uppercase tracking-wider"
        >
          <ArrowLeft size={14} />
          Continue Shopping
        </Link>
      </div>
      {/* Mobile Sticky Checkout Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d0d] border-t border-white/[0.07] px-4 py-3">
        <button onClick={handleCheckout} disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-[#c8874a] disabled:opacity-50 text-white text-[13px] font-bold py-3.5 rounded-sm uppercase tracking-wider">
          {submitting ? <><Loader2 size={14} className="animate-spin" />Processing...</> : isCodAdvance ? <>Pay &#8377;{advanceAmount.toLocaleString("en-IN")} Advance<ArrowRight size={14} /></> : <>Pay &#8377;{total.toLocaleString("en-IN")} & Place Order<ArrowRight size={14} /></>}
        </button>
      </div>

    </div>
  );
}

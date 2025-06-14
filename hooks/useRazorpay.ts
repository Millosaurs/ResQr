// hooks/useRazorpay.ts
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  amount: number;
  planType: "monthly" | "yearly";
  userEmail?: string;
  userName?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useRazorpay = () => {
  const initializePayment = async ({
    amount,
    planType,
    userEmail = "",
    userName = "",
    onSuccess,
    onError,
  }: RazorpayOptions) => {
    try {
      // Create order
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, planType }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const { orderId } = await orderResponse.json();

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100, // Convert to paise
        currency: "INR",
        name: "ResQr",
        description: `${
          planType === "yearly" ? "Annual" : "Monthly"
        } Subscription`,
        order_id: orderId,
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: "#000000",
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planType,
              }),
            });

            if (verifyResponse.ok) {
              toast.success(
                "Payment successful! Your subscription is now active."
              );
              onSuccess?.();
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
            onError?.(error);
          }
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
            onError?.(new Error("Payment cancelled"));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error("Failed to initialize payment");
      onError?.(error);
    }
  };

  return { initializePayment };
};

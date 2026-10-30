
import axios from "axios";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export const initializePayment = async (
  email: string,
  amount: number,
  reference: string,
) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Paystack secret key is not configured");
  }

  const response = await axios.post(
    `${PAYSTACK_BASE_URL}/transaction/initialize`,
    {
      email,
      amount: Math.round(amount * 100),
      currency: "ZAR",
      reference,
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
    },
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

export const verifyPayment = async (reference: string) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Paystack secret key is not configured");
  }

  const response = await axios.get(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    },
  );

  return response.data;
};

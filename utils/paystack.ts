export const initializePaystackPayment = async (
  email: string,
  amount: number, // in cents (multiply by 100)
  tripId: string,
  transporterId: string
) => {
  const response = await fetch("/api/paystack/initialize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      amount,
      currency: "ZAR",
      callback_url: `${window.location.origin}/payment/callback?tripId=${tripId}`,
      metadata: {
        tripId,
        // Add any other data you need in the callback
      },
    }),
  });

  return await response.json();
};

export const chargeAuthorization = async (
  authCode: string,
  amount: number,
  email: string
) => {
  const response = await fetch("/api/paystack/charge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      authorization_code: authCode,
      amount,
      email,
      currency: "ZAR",
    }),
  });

  return await response.json();
};

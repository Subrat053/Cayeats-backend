import subscription from "../../models/subscription";

export const getSubscription = async (restaurantId) => {
  const subscription = await subscription.findOne({
    restaurant: restaurantId,
  });

  if (!subscription) return null;

  const daysLeft = Math.ceil(
    (subscription.expiresAt - new Date()) / (1000 * 60 * 60 * 24),
  );

  return { subscription, daysLeft };
};

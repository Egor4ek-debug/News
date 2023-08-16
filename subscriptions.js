export const userSubscriptions = {};

export function subscribeUser(chatId, categoryLink, intervalId) {
  userSubscriptions[chatId] = { categoryLink, intervalId };
}

export function unsubscribeUser(chatId) {
  if (userSubscriptions[chatId]) {
    clearInterval(userSubscriptions[chatId].intervalId);
    delete userSubscriptions[chatId];
    return true;
  }
  return false;
}

export function isSubscribed(chatId) {
  return userSubscriptions.hasOwnProperty(chatId);
}

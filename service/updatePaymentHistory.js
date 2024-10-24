const PaidHistory = require("../models/paidHistoryModel");

async function updatePaymentHistory(userId, title, money, point = 0) {
  try {
    const newHistory = new PaidHistory({
      user_id: userId,
      title: title,
      money: money,
      point: point,
    });

    // Save to database
    await newHistory.save();
    console.log("Payment history updated successfully!");
    return newHistory;
  } catch (error) {
    console.error("Error updating payment history:", error.message);
    throw new Error("Unable to update payment history");
  }
}

module.exports = updatePaymentHistory;

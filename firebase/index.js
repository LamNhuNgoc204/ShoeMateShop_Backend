const admin = require("firebase-admin");

const serviceAccount = require("./mateshoe-a2fb8-firebase-adminsdk-x6fpk-b501345819.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.sendNotification = async (fcmToken, message) => {

  const messageSend = {
    notification: {
      title : "Mateshoe 😁",
      body: message,
    },
    token: fcmToken,
    android: {
      priority: 'high',
    },
    data: {test: 'true'},
    apns: {
      payload: {
        aps: {
          contentAvailable: true,
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(messageSend);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

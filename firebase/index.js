const admin = require("firebase-admin");

const serviceAccount = require("./mateshoe-a2fb8-firebase-adminsdk-x6fpk-b501345819.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.sendNotification = async (message) => {

  const messageSend = {
    notification: {
      title : "Mateshoe Notification",
      body: message,
    },
    token: 'fFoQRExrQDqrSaWARVFv8q:APA91bHR0byAD5AEEKIue-IGRHcDgi9XJS9JzmiMYmLfUpTuWngMT-XDs3fpaAVbLXanTfLRPSbTUOpk__K0OpBIKBS92fyGjCOx37Z-ajbWGwMk2qFYqmo',
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

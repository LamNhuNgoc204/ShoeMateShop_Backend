var admin = require ( "firebase-admin" ); 

var serviceAccount = require ( "./messagemate-b212b-firebase-adminsdk-i72cn-80d8514954.json" ); 

admin . initializeApp ({
  credential : admin . credential . cert ( serviceAccount )
});

function sendPushNotification(token, payload) {
    admin.messaging().send({
      token: token,
      notification: payload,
    })
    .then(response => {
      console.log('Successfully sent notification:', response);
    })
    .catch(error => {
      console.error('Error sending notification:', error);
    });
  }
  
  // Ví dụ sử dụng
  const registrationToken = 'token của thiết bị';
  const payload = {
    title: 'Hello!',
    body: 'This is a push notification from Node.js',
  };
  
  sendPushNotification(registrationToken, payload);
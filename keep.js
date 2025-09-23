// // "blockPermissions": [
// //   "android.permission.RECORD_AUDIO",
// //   "android.permission.CAMERA"
// // ]

// app.get('/user-info/phone/:phoneNumber', async (req, res) => {
//   const { phoneNumber } = req.params;

//   try {
//     const profile = await models.getUserProfileByPhoneNumber(phoneNumber);
//     if (!profile) {
//       return res
//         .status(404)
//         .json({ success: false, error: 'User profile not found' });
//     }
//     res.json({ success: true, data: profile });
//   } catch (error) {
//     console.error('Error fetching user profile by phone number:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// async sendMail(data) {
//     const { email, userId } = data;
//     // const params = {
//     //   UserPoolId: userPoolId,
//     //   Username: email,
//     // };

//     const emailParams = {
//       Destination: {
//         ToAddresses: [email],
//       },
//       Message: {
//         Body: {
//           Text: {
//             Data: `Hello, your account (${email}) has been successfully deleted from our platform.`,
//           },
//         },
//         Subject: { Data: 'Account Deletion Confirmation' },
//       },
//       Source: 'support@mimonie.net',
//     };

//     try {
//       // await userProfileModel.deleteUserProfile(userId);
//       // await cognitoIdentityProviderClient.send(
//       //   new AdminDeleteUserCommand(params)
//       // );

//       await ses.send(new SendEmailCommand(emailParams));

//       return { statusCode: 200, message: 'Email sent successfully.' };
//     } catch (err) {
//       console.log(err);
//       throw err;
//     }
//   }

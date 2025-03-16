const apiKey = process.env.EXPO_PUBLIC_TERMII_LIVE_API_KEY;

export const sendOtp = async (phoneNumber) => {
  const data = {
    api_key: apiKey,
    message_type: 'NUMERIC',
    to: phoneNumber,
    from: 'N-Alert',
    channel: 'dnd',
    pin_attempts: 10,
    pin_time_to_live: 5,
    pin_length: 6,
    pin_placeholder: '< 123456 >',
    message_text:
      'Your mimonie confirmation code is < 123456 >. Valid for 10 minutes, one-time use only',
    pin_type: 'NUMERIC',
  };

  try {
    const response = await fetch('https://v3.api.termii.com/api/sms/otp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Failed to send OTP:', error);
  }
};

export async function verifyOTP(pinId, pin) {
  const data = {
    api_key: apiKey,
    pin_id: pinId,
    pin: pin,
  };
  console.log('data', data);
  try {
    const response = await fetch(
      'https://v3.api.termii.com/api/sms/otp/verify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: error.message };
  }
}

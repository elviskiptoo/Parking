import axios from 'axios';

const MPESA_AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate';
const MPESA_PAYMENT_URL = 'https://sandbox.safaricom.co.ke/mpesa/b2b/v1/paymentrequest';

// Get credentials from environment variables
const BASIC_AUTH = import.meta.env.VITE_MPESA_BASIC_AUTH;

interface MpesaAuthResponse {
  access_token: string;
  expires_in: string;
}

interface MpesaPaymentResponse {
  OriginatorConversationID: string;
  ConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

export const getMpesaToken = async (): Promise<string> => {
  try {
    const response = await axios.get<MpesaAuthResponse>(
      `${MPESA_AUTH_URL}?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${BASIC_AUTH}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting M-Pesa token:', error);
    throw new Error('Failed to get M-Pesa authorization token');
  }
};

export const initiatePayment = async (
  amount: number,
  phoneNumber: string,
  spaceNumber: string,
  duration: number = 1 // Default to 1 hour if not specified
): Promise<MpesaPaymentResponse> => {
  try {
    const token = await getMpesaToken();
    
    const payload = {
      Initiator: "API_Username", // Replace with your actual API username
      SecurityCredential: "YOUR_SECURITY_CREDENTIAL", // Replace with your actual security credential
      CommandID: "BusinessBuyGoods",
      SenderIdentifierType: "4",
      RecieverIdentifierType: "4",
      Amount: amount.toString(),
      PartyA: "174379", // Replace with your actual shortcode
      PartyB: "174379", // Replace with merchant's till number
      AccountReference: spaceNumber,
      Requester: phoneNumber,
      Remarks: `Payment for parking space ${spaceNumber} for ${duration} ${duration === 1 ? 'hour' : 'hours'}`,
      QueueTimeOutURL: "https://your-domain.com/mpesa/queue", // Replace with your actual callback URLs
      ResultURL: "https://your-domain.com/mpesa/result"
    };

    const response = await axios.post<MpesaPaymentResponse>(
      MPESA_PAYMENT_URL,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error);
    throw new Error('Failed to initiate M-Pesa payment');
  }
}; 
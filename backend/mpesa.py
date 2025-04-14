from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from dotenv import load_dotenv
from mpesa_integration.mpesa import MpesaClient, MpesaConfig

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Verify environment variables
required_env_vars = [
    "MPESA_CONSUMER_KEY",
    "MPESA_CONSUMER_SECRET",
    "MPESA_PASSKEY",
    "MPESA_SHORTCODE",
    "MPESA_CALLBACK_URL"
]
for var in required_env_vars:
    if not os.getenv(var):
        logger.error(f"Missing environment variable: {var}")
        raise EnvironmentError(f"Missing environment variable: {var}")

# M-Pesa configuration using environment variables
config = MpesaConfig(
    consumer_key=os.getenv("MPESA_CONSUMER_KEY"),
    consumer_secret=os.getenv("MPESA_CONSUMER_SECRET"),
    shortcode=os.getenv("MPESA_SHORTCODE"),
    passkey=os.getenv("MPESA_PASSKEY"),
    callback_url=os.getenv("MPESA_CALLBACK_URL"),
    business_shortcode=os.getenv("MPESA_SHORTCODE"),  # Same as shortcode for Paybill
    environment="sandbox"  # Change to "production" for live environment
)

# Initialize M-Pesa client
client = MpesaClient(config)

@app.route('/initiate_payment', methods=['POST'])
def initiate_payment():
    logger.info(f"Received request: {request.method} {request.path}")
    try:
        data = request.get_json()
        if not data:
            logger.error("No JSON data received in request")
            return jsonify({"error": "No JSON data provided"}), 400
        
        phone_number = data.get('phoneNumber')
        amount = data.get('amount')

        logger.debug(f"Request data: phoneNumber={phone_number}, amount={amount}")
        
        if not phone_number or not amount:
            logger.error(f"Missing required fields: phoneNumber={phone_number}, amount={amount}")
            return jsonify({"error": "Missing phoneNumber or amount"}), 400

        # Normalize phone number (remove + and ensure correct format)
        if phone_number.startswith("+"):
            phone_number = phone_number[1:]
        if not phone_number.startswith("254"):
            phone_number = "254" + phone_number.lstrip("0")

        logger.info(f"Initiating payment for phone: {phone_number}, amount: {amount}")
        response = client.initiate_payment(
            phone_number=phone_number,
            amount=int(amount),
            account_reference="ParkingLot",
            transaction_desc="Parking Payment"
        )

        logger.info(f"Payment response: {response}")
        return jsonify(response)

    except Exception as e:
        logger.error(f"Error during payment initiation: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    logger.info("Received M-Pesa callback")
    try:
        callback_data = request.get_json()
        logger.debug(f"Callback data: {callback_data}")
        # Process callback data as needed (e.g., update database)
        return jsonify({"status": "success", "message": "Callback received"})
    except Exception as e:
        logger.error(f"Error processing callback: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    app.run(host='0.0.0.0', port=5000, debug=True)
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import requests
from pytrends.request import TrendReq
from datetime import datetime, timedelta
import logging
import random
import os
from city_region_mapping import get_region_from_city, get_region_code

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load trained model (robustly - may not exist in dev)
model = None
try:
    model_path = os.path.join(os.path.dirname(__file__), 'crop_model.pkl')
    if os.path.exists(model_path):
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
    else:
        logger.warning('crop_model.pkl not found at %s, prediction endpoints will be disabled until a model is trained', model_path)
except Exception as e:
    logger.warning('Failed to load model: %s', e)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# API Keys - read from environment when possible (safe defaults removed)
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')
WEATHER_API_URL = os.getenv('WEATHER_API_URL', 'http://api.openweathermap.org/data/2.5/weather')

# Market Price API Keys (example) - prefer setting via env
MARKET_API_KEY = os.getenv('MARKET_API_KEY')
MARKET_API_URL = os.getenv('MARKET_API_URL', 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070')

# Initialize pytrends for Google Trends
pytrends = TrendReq(hl='en-IN', tz=330)

def get_weather_data(city):
    """Fetch weather data for a given city."""
    try:
        params = {
            'q': city,
            'appid': WEATHER_API_KEY,
            'units': 'metric'  # Use Celsius
        }
        response = requests.get(WEATHER_API_URL, params=params)
        data = response.json()
        
        # OpenWeather may return 'cod' as str or int
        cod = data.get('cod')
        if str(cod) != '200':
            msg = data.get('message', 'unknown error')
            logger.error("Weather API error: %s", msg)
            return {'error': msg}
        
        # Extract weather data
        temperature = data['main']['temp']
        humidity = data['main']['humidity']
        
        # Extract rainfall if available
        rainfall = data.get('rain', {}).get('1h', 0)  # Rain in last 1 hour, default to 0

        return {
            'temperature': temperature,
            'humidity': humidity,
            'rainfall': rainfall
        }
    except Exception as e:
        logger.error(f"Weather data error: {str(e)}")
        return {'error': str(e)}

def get_market_price_trends(crop, region):
    """Fetch market price trends for a crop."""
    try:
        # Get current date and date 30 days ago
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        # For demonstration, we'll simulate market data
        # In a production app, you would use actual API calls
        crops_data = {
            'rice': {'trend': random.uniform(0.6, 0.9), 'price': random.uniform(1800, 2200)},
            'wheat': {'trend': random.uniform(0.5, 0.8), 'price': random.uniform(1900, 2300)},
            'maize': {'trend': random.uniform(0.4, 0.7), 'price': random.uniform(1700, 2100)},
            'chickpea': {'trend': random.uniform(0.5, 0.9), 'price': random.uniform(4500, 5500)},
            'potato': {'trend': random.uniform(0.3, 0.6), 'price': random.uniform(1200, 1800)},
            'tomato': {'trend': random.uniform(0.2, 0.5), 'price': random.uniform(1500, 2500)},
            'onion': {'trend': random.uniform(0.4, 0.8), 'price': random.uniform(1400, 2200)},
            'cotton': {'trend': random.uniform(0.5, 0.7), 'price': random.uniform(5500, 6500)},
            'sugarcane': {'trend': random.uniform(0.6, 0.8), 'price': random.uniform(2800, 3200)},
            'default': {'trend': 0.5, 'price': 2000}
        }
        
        crop_lower = crop.lower()
        data = crops_data.get(crop_lower, crops_data['default'])
        
        # Adjust trend based on region - certain regions may have better markets for certain crops
        region_multipliers = {
            'North India': {'rice': 0.9, 'wheat': 1.2, 'maize': 1.0},
            'South India': {'rice': 1.2, 'coconut': 1.3, 'banana': 1.2},
            'East India': {'rice': 1.1, 'jute': 1.3, 'tea': 1.2},
            'West India': {'cotton': 1.2, 'groundnut': 1.1, 'onion': 1.1},
            'Central India': {'soybean': 1.2, 'wheat': 1.1, 'cotton': 1.0},
            'Northeast India': {'tea': 1.3, 'rice': 1.0, 'banana': 1.1}
        }
        
        # Apply regional multiplier if available
        region_mult = region_multipliers.get(region, {}).get(crop_lower, 1.0)
        data['trend'] = min(0.95, data['trend'] * region_mult)
        
        return {
            'market_price': data['price'],
            'market_trend': data['trend']
        }
    except Exception as e:
        logger.error(f"Market price trends error: {str(e)}")
        return {'market_trend': 0.5, 'market_price': 2000}

def get_demand_trends(crop, region):
    """Fetch demand trends for a crop using Google Trends."""
    try:
        # Use IN for India as default, can be refined based on regions
        geo_code = 'IN'
        
        # For demonstration, we'll simulate demand data with regional variations
        # In a production app, you would use actual Google Trends API data
        crops_demand = {
            'rice': {'North India': 0.7, 'South India': 0.9, 'East India': 0.8, 'West India': 0.6, 'Central India': 0.7, 'Northeast India': 0.8},
            'wheat': {'North India': 0.9, 'South India': 0.6, 'East India': 0.7, 'West India': 0.7, 'Central India': 0.8, 'Northeast India': 0.6},
            'maize': {'North India': 0.7, 'South India': 0.7, 'East India': 0.8, 'West India': 0.6, 'Central India': 0.7, 'Northeast India': 0.7},
            'chickpea': {'North India': 0.8, 'South India': 0.7, 'East India': 0.6, 'West India': 0.8, 'Central India': 0.8, 'Northeast India': 0.5},
            'potato': {'North India': 0.8, 'South India': 0.7, 'East India': 0.8, 'West India': 0.7, 'Central India': 0.7, 'Northeast India': 0.7},
            'tomato': {'North India': 0.7, 'South India': 0.8, 'East India': 0.7, 'West India': 0.7, 'Central India': 0.7, 'Northeast India': 0.6},
            'onion': {'North India': 0.9, 'South India': 0.8, 'East India': 0.7, 'West India': 0.9, 'Central India': 0.8, 'Northeast India': 0.7},
            'cotton': {'North India': 0.6, 'South India': 0.5, 'East India': 0.4, 'West India': 0.8, 'Central India': 0.7, 'Northeast India': 0.3},
            'sugarcane': {'North India': 0.7, 'South India': 0.8, 'East India': 0.6, 'West India': 0.7, 'Central India': 0.8, 'Northeast India': 0.5},
            'default': {'North India': 0.5, 'South India': 0.5, 'East India': 0.5, 'West India': 0.5, 'Central India': 0.5, 'Northeast India': 0.5}
        }
        
        crop_lower = crop.lower()
        crop_data = crops_demand.get(crop_lower, crops_demand['default'])
        trend = crop_data.get(region, 0.5)
        
        # Add some randomness to make it more realistic
        trend = min(0.95, max(0.1, trend + random.uniform(-0.1, 0.1)))
        
        return {'demand_trend': trend}
    except Exception as e:
        logger.error(f"Demand trends error: {str(e)}")
        return {'demand_trend': 0.5}

@app.route('/weather', methods=['POST'])
def get_weather():
    """Fetch weather data based on city input."""
    try:
        data = request.get_json(force=True, silent=True) or {}
        city = data.get('city')
        if not city:
            return jsonify({'error': 'city is required'}), 400

        weather_info = get_weather_data(city)
        return jsonify(weather_info)
    except Exception as e:
        logger.error(f"Weather endpoint error: {str(e)}")
        return jsonify({'error': str(e)})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        city = data['city']
        month = int(data['month'])

        # Validate inputs
        if not city or not month:
            return jsonify({'error': 'Missing required fields'})

        if month < 1 or month > 12:
            return jsonify({'error': 'Invalid month'})

        # Get region from city
        region = get_region_from_city(city)
        if region == 'Unknown':
            logger.warning(f"Unknown city: {city}. Using default region.")
            region = 'North India'  # Default to North India

        # Log region detected
        logger.info(f"City: {city}, Region detected: {region}")

        # Get weather data
        weather_data = get_weather_data(city)
        if not isinstance(weather_data, dict) or 'error' in weather_data:
            return jsonify({'error': weather_data.get('error', 'failed to fetch weather data')}), 502

        # Ensure model is loaded
        if model is None:
            return jsonify({'error': 'Model not available. Train the model first (run train_model.py or create crop_model.pkl).'}), 503

        # Get demand trends
        demand_trend = get_demand_trends('agriculture', region)

        # Prepare feature vector for prediction
        # We don't use region in our model now, but keeping the code structure for flexibility
        features = np.array([
            weather_data['temperature'],
            weather_data['humidity'],
            weather_data['rainfall'],
            month,  # month_season
            1000,   # previous_sales (default value based on dataset)
            40,     # market_price (default value based on dataset)
            demand_trend['demand_trend']  # demand_trend
        ]).reshape(1, -1)

        # Make predictions
        predictions = model.predict(features)
        primary_recommendation = predictions[0]

        # Get regional crop recommendations
        regional_crops = get_typical_crops_for_region(region)
        
        # Filter out the primary recommendation from regional crops
        alternative_crops = [crop for crop in regional_crops if crop.lower() != primary_recommendation.lower()]
        
        # Get top 3 recommendations based on regional suitability and weather
        recommendations = [primary_recommendation]
        if alternative_crops:
            recommendations.extend(alternative_crops[:2])  # Add up to 2 alternative crops
        
        # Get market and demand data for each recommended crop
        crop_details = []
        for crop in recommendations:
            market_data = get_market_price_trends(crop, region)
            demand_data = get_demand_trends(crop, region)
            
            crop_details.append({
                'name': crop,
                'marketPrice': market_data['market_price'],
                'marketTrend': market_data['market_trend'],
                'demandTrend': demand_data['demand_trend'],
                'score': calculate_crop_score(
                    weather_data, 
                    month, 
                    market_data['market_trend'], 
                    demand_data['demand_trend'],
                    crop,
                    region
                )
            })
        
        # Sort crops by score
        crop_details.sort(key=lambda x: x['score'], reverse=True)
        
        # Get typical conditions for recommended crops
        crop_condition = "These crops are suitable for the current temperature, humidity, and rainfall conditions."
        
        # Provide more detailed information
        detailed_recommendation = {
            'primaryCrop': primary_recommendation,
            'allCrops': crop_details,
            'region': region,
            'regionDetails': {
                'name': region,
                'typicalCrops': regional_crops,
                'climate': get_climate_for_region(region)
            },
            'conditions': crop_condition,
            'weatherData': weather_data,
            'demand_trend': demand_trend['demand_trend']
        }

        return jsonify(detailed_recommendation)
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)})

def calculate_crop_score(weather, month, market_trend, demand_trend, crop, region):
    """Calculate a score for each crop based on all factors."""
    # Base score from weather suitability (temperature, humidity, rainfall)
    weather_score = 0.6  # Default moderate score
    
    # Adjust based on crop-specific optimal conditions
    crop_optimal = {
        'rice': {'temp': 25, 'humidity': 80, 'rainfall': 200},
        'wheat': {'temp': 20, 'humidity': 60, 'rainfall': 100},
        'maize': {'temp': 24, 'humidity': 65, 'rainfall': 150},
        'chickpea': {'temp': 22, 'humidity': 70, 'rainfall': 80},
        'potato': {'temp': 18, 'humidity': 75, 'rainfall': 120},
        'tomato': {'temp': 26, 'humidity': 70, 'rainfall': 100},
        'onion': {'temp': 22, 'humidity': 60, 'rainfall': 80},
        'cotton': {'temp': 28, 'humidity': 60, 'rainfall': 120},
        'sugarcane': {'temp': 27, 'humidity': 80, 'rainfall': 150}
    }
    
    crop_lower = crop.lower()
    if crop_lower in crop_optimal:
        optimal = crop_optimal[crop_lower]
        temp_diff = abs(weather['temperature'] - optimal['temp']) / optimal['temp']
        humidity_diff = abs(weather['humidity'] - optimal['humidity']) / optimal['humidity']
        rainfall_diff = abs(weather['rainfall'] - optimal['rainfall']) / (optimal['rainfall'] + 1)  # Add 1 to avoid division by zero
        
        weather_score = 1.0 - (temp_diff * 0.4 + humidity_diff * 0.3 + rainfall_diff * 0.3)
        weather_score = max(0.3, min(0.9, weather_score))  # Keep within reasonable bounds
    
    # Factor in season/month suitability
    month_score = 0.7  # Default
    crop_seasons = {
        'rice': [6, 7, 8, 9],  # Jun-Sep (Kharif)
        'wheat': [11, 12, 1, 2],  # Nov-Feb (Rabi)
        'maize': [6, 7, 8, 9, 3, 4],  # Jun-Sep & Mar-Apr (Kharif & Zaid)
        'chickpea': [10, 11, 12, 1],  # Oct-Jan (Rabi)
        'potato': [10, 11, 12, 1],  # Oct-Jan
        'tomato': [2, 3, 4, 9, 10, 11],  # Feb-Apr & Sep-Nov
        'onion': [10, 11, 12, 1, 2],  # Oct-Feb
        'cotton': [4, 5, 6, 7],  # Apr-Jul
        'sugarcane': [1, 2, 3, 10, 11, 12]  # Jan-Mar & Oct-Dec
    }
    
    if crop_lower in crop_seasons and month in crop_seasons[crop_lower]:
        month_score = 0.9
    
    # Calculate final score (weighted average)
    final_score = (
        weather_score * 0.35 +  # Weather conditions
        month_score * 0.25 +    # Seasonal suitability
        market_trend * 0.20 +   # Market trends
        demand_trend * 0.20     # Demand trends
    )
    
    return round(final_score * 100)  # Return as percentage

def get_typical_crops_for_region(region):
    """Return typical crops for a given region."""
    typical_crops = {
        'North India': ['Wheat', 'Rice', 'Barley', 'Maize', 'Potato', 'Onion'],
        'South India': ['Rice', 'Coconut', 'Banana', 'Sugarcane', 'Tomato', 'Cotton'],
        'East India': ['Rice', 'Jute', 'Tea', 'Maize', 'Potato', 'Chickpea'],
        'West India': ['Cotton', 'Groundnut', 'Jowar', 'Bajra', 'Onion', 'Sugarcane'],
        'Central India': ['Soybean', 'Wheat', 'Gram', 'Cotton', 'Potato', 'Onion'],
        'Northeast India': ['Rice', 'Jute', 'Tea', 'Banana', 'Potato', 'Maize']
    }
    return typical_crops.get(region, ['Rice', 'Wheat', 'Potato', 'Onion', 'Tomato'])

def get_climate_for_region(region):
    """Return climate description for a given region."""
    climate_info = {
        'North India': 'Continental climate with hot summers and cold winters',
        'South India': 'Tropical climate with high humidity and moderate temperatures year-round',
        'East India': 'Sub-tropical climate with hot summers and mild winters',
        'West India': 'Arid to semi-arid climate in Rajasthan and Gujarat, Coastal climate in Maharashtra',
        'Central India': 'Tropical climate with hot summers and moderate winters',
        'Northeast India': 'Subtropical climate with high rainfall and moderate temperatures'
    }
    return climate_info.get(region, 'Varied climate depending on location')

@app.route('/demand-trends', methods=['GET'])
def fetch_demand_trends():
    """Fetch demand trends for a specific crop."""
    try:
        crop = request.args.get('crop', 'agriculture')
        city = request.args.get('city', '')
        region = get_region_from_city(city) if city else 'Unknown'
        trend_data = get_demand_trends(crop, region)
        return jsonify(trend_data)
    except Exception as e:
        logger.error(f"Demand trends endpoint error: {str(e)}")
        return jsonify({'error': str(e)})

@app.route('/market-price', methods=['GET'])
def fetch_market_price():
    """Fetch market price data for a specific crop."""
    try:
        crop = request.args.get('crop', 'rice')
        city = request.args.get('city', '')
        region = get_region_from_city(city) if city else 'North India'
        price_data = get_market_price_trends(crop, region)
        return jsonify(price_data)
    except Exception as e:
        logger.error(f"Market price endpoint error: {str(e)}")
        return jsonify({'error': str(e)})

@app.route('/regions', methods=['GET'])
def get_regions():
    """Return all available regions and their details."""
    regions = [
        {
            'name': 'North India',
            'states': ['Delhi', 'Haryana', 'Punjab', 'Uttar Pradesh', 'Uttarakhand', 'Himachal Pradesh', 'Jammu & Kashmir'],
            'major_cities': ['Delhi', 'Chandigarh', 'Lucknow', 'Jaipur', 'Dehradun', 'Shimla']
        },
        {
            'name': 'South India',
            'states': ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana'],
            'major_cities': ['Chennai', 'Bangalore', 'Hyderabad', 'Kochi', 'Coimbatore']
        },
        {
            'name': 'East India',
            'states': ['West Bengal', 'Bihar', 'Odisha', 'Jharkhand'],
            'major_cities': ['Kolkata', 'Patna', 'Bhubaneswar', 'Ranchi']
        },
        {
            'name': 'West India',
            'states': ['Maharashtra', 'Gujarat', 'Rajasthan', 'Goa'],
            'major_cities': ['Mumbai', 'Pune', 'Ahmedabad', 'Jaipur', 'Panaji']
        },
        {
            'name': 'Central India',
            'states': ['Madhya Pradesh', 'Chhattisgarh'],
            'major_cities': ['Bhopal', 'Indore', 'Raipur', 'Jabalpur']
        },
        {
            'name': 'Northeast India',
            'states': ['Assam', 'Meghalaya', 'Manipur', 'Nagaland', 'Tripura', 'Arunachal Pradesh', 'Sikkim', 'Mizoram'],
            'major_cities': ['Guwahati', 'Shillong', 'Imphal', 'Agartala']
        }
    ]
    return jsonify(regions)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)

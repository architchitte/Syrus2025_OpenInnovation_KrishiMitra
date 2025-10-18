import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import '../styles/AICropRecommendation.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AICropRecommendation = () => {
  const [city, setCity] = useState('');
  const [month, setMonth] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [demandTrend, setDemandTrend] = useState(null);
  const [region, setRegion] = useState('');
  const [regionDetails, setRegionDetails] = useState(null);
  const [allRegions, setAllRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Predefined data
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  // Fetch all regions on component mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
  const ML_BASE = import.meta.env.VITE_ML_BASE || 'http://localhost:5001';
  const response = await axios.get(`${ML_BASE}/regions`);
        setAllRegions(response.data);
      } catch (err) {
        console.error('Error fetching regions:', err);
      }
    };
    fetchRegions();
  }, []);

  // Combined prediction function
  const predictCrop = async () => {
    if (!city || !month) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Fetch crop predictions with all data
  const ML_BASE = import.meta.env.VITE_ML_BASE || 'http://localhost:5001';
  const predictRes = await axios.post(`${ML_BASE}/predict`, {
        city,
        month: parseInt(month),
      });
      
      if (predictRes.data.error) {
        throw new Error(predictRes.data.error);
      }
      
      // Set all the data from the response
      setRecommendations(predictRes.data.allCrops);
      setWeatherData(predictRes.data.weatherData);
      setDemandTrend(predictRes.data.demand_trend);
      setRegion(predictRes.data.region);
      setRegionDetails(predictRes.data.regionDetails);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error || err.message || 'Error fetching data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to get trend label and class
  const getTrendLabel = (value) => {
    if (value >= 0.7) return { label: 'High', class: 'trend-high' };
    if (value >= 0.4) return { label: 'Moderate', class: 'trend-moderate' };
    return { label: 'Low', class: 'trend-low' };
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Krishi-Mitra Dashboard 🌾</h1>
        <p>Your Smart Agriculture Assistant</p>
      </div>

      {/* Input Section */}
      <div className="form-container card">
        <div className="card-body">
          <div className="form-group">
            <label htmlFor="city">City:</label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="form-control"
              placeholder="Enter city name (e.g., Mumbai, Delhi, Bangalore)"
            />
            {allRegions.length > 0 && (
              <div className="mt-2">
                <details>
                  <summary className="details-toggle">View supported regions and cities</summary>
                  <div className="details-content">
                    {allRegions.map((region, idx) => (
                      <div key={idx} className="region-item">
                        <span className="region-name">{region.name}:</span>
                        <div className="city-list">
                          {region.major_cities.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="month">Month:</label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="form-control"
            >
              <option value="">Select Month</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">{error}</div>
            </div>
          )}

          {/* Single Action Button */}
          <button
            onClick={predictCrop}
            disabled={loading}
            className={`btn btn-primary btn-block ${loading ? 'disabled' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner">
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                Analyzing...
              </>
            ) : (
              'Get Crop Recommendations'
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="results-container">
        {loading && (
          <div className="loading-container fade-in">
            <div className="loading-spinner"></div>
            <p className="loading-text">Analyzing agricultural data...</p>
          </div>
        )}

        {/* Region Information */}
        {region && regionDetails && !error && (
          <div className="card fade-in-1">
            <div className="card-header">
              <div className="icon">📍</div>
              <h2>Region Information</h2>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-card info-blue">
                  <div className="info-label">Detected Region</div>
                  <div className="info-value">{region}</div>
                  <div className="info-label" style={{marginTop: '10px'}}>Climate</div>
                  <div style={{fontSize: '0.95rem'}}>{regionDetails.climate}</div>
                </div>
                <div className="info-card info-green">
                  <div className="info-label">Common Crops in this Region</div>
                  <div className="info-content">
                    {regionDetails.typicalCrops.map((crop, index) => (
                      <span key={index} className="badge badge-best" style={{
                        margin: '0 4px 4px 0',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        borderRadius: '4px',
                        display: 'inline-block',
                        background: 'rgba(56, 161, 105, 0.1)',
                        color: '#38a169'
                      }}>
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weather Data */}
        {weatherData && !error && (
          <div className="card fade-in-2">
            <div className="card-header">
              <div className="icon">🌦️</div>
              <h2>Weather Data</h2>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-card info-blue">
                  <div className="info-label">Temperature</div>
                  <div className="info-value">{weatherData.temperature}°C</div>
                </div>
                <div className="info-card info-green">
                  <div className="info-label">Humidity</div>
                  <div className="info-value">{weatherData.humidity}%</div>
                </div>
                <div className="info-card info-purple">
                  <div className="info-label">Rainfall</div>
                  <div className="info-value">{weatherData.rainfall} mm</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crop Recommendations */}
        {recommendations.length > 0 && !error && (
          <div className="card fade-in-3">
            <div className="card-header">
              <div className="icon">🌱</div>
              <h2>Recommended Crops</h2>
            </div>
            <div className="card-body">
              <div className="recommendation-container">
                {recommendations.map((crop, index) => (
                  <div key={index} className={`recommendation-card ${index === 0 ? 'best-match' : ''}`}>
                    <div className="recommendation-header">
                      <div className="recommendation-title">
                        {index === 0 && <span className="recommendation-badge badge-best">BEST MATCH</span>}
                        {crop.name}
                      </div>
                      <div>
                        <span className="recommendation-badge badge-score">
                          Score: {crop.score}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="recommendation-body">
                      <div className="stats-card">
                        <div className="stats-label">Market Price</div>
                        <div className="stats-value">₹{Math.round(crop.marketPrice)} per quintal</div>
                        <div className="trend-indicator">
                          <span className={getTrendLabel(crop.marketTrend).class}>
                            {getTrendLabel(crop.marketTrend).label} Market Trend
                          </span>
                        </div>
                        <div className="progress-bar-container">
                          <div 
                            className={`progress-bar-fill ${crop.marketTrend >= 0.7 ? 'progress-bar-high' : crop.marketTrend >= 0.4 ? 'progress-bar-moderate' : 'progress-bar-low'}`}
                            style={{ width: `${Math.round(crop.marketTrend * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="stats-card">
                        <div className="stats-label">Demand Trend</div>
                        <div className="stats-value">{getTrendLabel(crop.demandTrend).label}</div>
                        <div className="trend-indicator">
                          <span className={getTrendLabel(crop.demandTrend).class}>
                            {Math.round(crop.demandTrend * 100)}% 
                          </span>
                        </div>
                        <div className="progress-bar-container">
                          <div 
                            className={`progress-bar-fill ${crop.demandTrend >= 0.7 ? 'progress-bar-high' : crop.demandTrend >= 0.4 ? 'progress-bar-moderate' : 'progress-bar-low'}`}
                            style={{ width: `${Math.round(crop.demandTrend * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="alert alert-warning" style={{marginTop: '20px'}}>
                <div className="alert-icon">📝</div>
                <div className="alert-content">
                  <strong>Note:</strong> These recommendations are based on current weather conditions, market trends, and regional suitability. The best match is highlighted above.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AICropRecommendation; 
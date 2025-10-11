import pandas as pd
import os

# Updated dataset with new features
data = {
    "temperature": [22.5, 25.0, 20.0, 23.0, 24.5, 21.0, 26.0, 27.5, 24.0, 23.5, 29, 24, 26, 30, 28, 22, 25, 27, 23, 21],
    "humidity": [80, 75, 85, 78, 82, 70, 65, 72, 80, 77, 85, 73, 76, 79, 82, 75, 78, 70, 68, 72],
    "rainfall": [200, 180, 220, 210, 190, 150, 160, 175, 200, 185, 230, 190, 160, 210, 205, 180, 170, 200, 220, 215],
    "month_season": ["Kharif", "Rabi", "Zaid", "Kharif", "Rabi", "Zaid", "Kharif", "Rabi", "Kharif", "Zaid",
                     "Kharif", "Rabi", "Zaid", "Kharif", "Rabi", "Zaid", "Kharif", "Rabi", "Kharif", "Zaid"],
    "previous_sales": [1200, 1100, 900, 950, 1300, 700, 600, 750, 900, 1100, 1400, 850, 800, 950, 1200, 1000, 650, 780, 1300, 1250],
    "market_price": [35, 45, 40, 30, 50, 28, 25, 32, 34, 42, 60, 38, 36, 45, 55, 48, 33, 31, 44, 49],
    "demand_trend": ["High", "Medium", "Low", "High", "Medium", "Low", "High", "Medium", "High", "Low",
                     "Medium", "High", "Low", "Medium", "High", "Low", "High", "Medium", "Low", "High"],
    "recommended_crops": ["rice", "maize", "chickpea", "lentil", "banana", "wheat",
                           "sorghum", "cotton", "potato", "tomato", "cucumber",
                           "onion", "pulse", "mustard", "sugarcane",
                           "sunflower", "millet", "cabbage",
                           "pumpkin", "zucchini"]
}

# Create DataFrame
df = pd.DataFrame(data)

# Encode categorical variables before saving
df['month_season'] = df['month_season'].astype('category').cat.codes
df['demand_trend'] = df['demand_trend'].astype('category').cat.codes

# Save as crop_data.csv in the model directory
base_dir = os.path.dirname(__file__)
file_path = os.path.join(base_dir, 'crop_data.csv')
df.to_csv(file_path, index=False)
print(f"✅ crop_data.csv successfully created at: {file_path}")

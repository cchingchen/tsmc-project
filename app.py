from flask import Flask, jsonify
from flask_cors import CORS
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/api/devices', methods=['GET'])
def get_devices():
    devices_data = [
        { 'id': 'dev_01', 'name': 'Server Room Main', 'status': 'active', 'humi': 22, 'co2': 450 },
        { 'id': 'dev_02', 'name': 'Office Area Loop', 'status': 'active', 'humi': 45, 'co2': 800 },
        { 'id': 'dev_03', 'name': 'Warehouse Zone 1', 'status': 'warning', 'humi': 65, 'co2': 1200 },
        { 'id': 'dev_04', 'name': 'Cafeteria Sensor', 'status': 'active', 'humi': 55, 'co2': 600 },
        { 'id': 'dev_05', 'name': 'Lab Environment', 'status': 'offline', 'humi': '--', 'co2': '--' },
    ]

    for dev in devices_data:
        if dev['status'] != 'offline':
            current_humi = dev['humi']
            current_co2 = dev['co2']
            dev['humi'] = max(0, min(100, current_humi + random.randint(-2, 2)))
            dev['co2'] = max(0, current_co2 + random.randint(-10, 10))

    return jsonify(devices_data)

@app.route('/api/chart-data', methods=['GET'])
def get_chart_data():
    base_humi = 45
    base_co2 = 800
    
    time_string = datetime.now().strftime('%H:%M:%S')
    humi_val = random.randint(base_humi - 5, base_humi + 5)
    co2_val = random.randint(base_co2 - 5, base_co2 + 5)

    new_point = {
        "time": time_string,
        "humi": humi_val,
        "co2": co2_val
    }

    return jsonify(new_point)

if __name__ == '__main__':
    print("🚀 API Server running...")
    print("   - Devices List: http://localhost:5000/api/devices")
    print("   - Chart Point:  http://localhost:5000/api/chart-data")
    app.run(debug=True, port=5000)
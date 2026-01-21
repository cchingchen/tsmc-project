from flask import Flask, jsonify
from flask_cors import CORS
import random
from datetime import datetime
from common.logger_config import LogManager

logger = LogManager("app").get_logger()

app = Flask(__name__)
CORS(app)

devices_data = [
    { 'id': 'motor-1', 'serial': 'MOTOR-0001', 'status': 'normal', 'rssi': -60, 'vbat': 3.3, 'tiltAngle': 0.1, 'tiltAngleX': 0.05, 'tiltAngleY': 0.05, 'lastUpdate': datetime.now().isoformat() },
    { 'id': 'motor-2', 'serial': 'MOTOR-0002', 'status': 'normal', 'rssi': -55, 'vbat': 3.2, 'tiltAngle': 0.2, 'tiltAngleX': 0.1, 'tiltAngleY': 0.1, 'lastUpdate': datetime.now().isoformat() },
    { 'id': 'motor-3', 'serial': 'MOTOR-0003', 'status': 'warning', 'rssi': -82, 'vbat': 2.9, 'tiltAngle': 15.5, 'tiltAngleX': 10.5, 'tiltAngleY': 5.0, 'lastUpdate': datetime.now().isoformat() },
    { 'id': 'motor-4', 'serial': 'MOTOR-0004', 'status': 'normal', 'rssi': -58, 'vbat': 3.3, 'tiltAngle': 0.1, 'tiltAngleX': 0.1, 'tiltAngleY': 0.0, 'lastUpdate': datetime.now().isoformat() },
    { 'id': 'pipe-1', 'serial': 'PIPE-0001', 'status': 'normal', 'rssi': -62, 'vbat': 3.3, 'tiltAngle': 0.0, 'tiltAngleX': 0.0, 'tiltAngleY': 0.0, 'lastUpdate': datetime.now().isoformat() },
    { 'id': 'pipe-2', 'serial': 'PIPE-0002', 'status': 'maintenance', 'rssi': -90, 'vbat': 2.5, 'tiltAngle': 0.0, 'tiltAngleX': 0.0, 'tiltAngleY': 0.0, 'lastUpdate': datetime.now().isoformat() },
    { 'id': 'pipe-3', 'serial': 'PIPE-0003', 'status': 'normal', 'rssi': -59, 'vbat': 3.2, 'tiltAngle': 0.1, 'tiltAngleX': 0.1, 'tiltAngleY': 0.0, 'lastUpdate': datetime.now().isoformat() },
    { 'id': 'pipe-4', 'serial': 'PIPE-0004', 'status': 'warning', 'rssi': -85, 'vbat': 2.8, 'tiltAngle': 12.0, 'tiltAngleX': 8.0, 'tiltAngleY': 4.0, 'lastUpdate': datetime.now().isoformat() },
]

@app.route('/api/devices', methods=['GET'])
def get_devices():
    global devices_data

    for dev in devices_data:
        if dev['status'] != 'maintenance':
            # Simulate random variations
            dev['rssi'] = max(-90, min(-40, dev['rssi'] + random.randint(-1, 1)))
            dev['vbat'] = max(2.8, min(4.2, dev['vbat'] + random.uniform(-0.01, 0.01)))
            
            # Simulate tilt movement if warning
            if dev['status'] == 'warning':
                dev['tiltAngle'] = max(0, dev['tiltAngle'] + random.uniform(-0.5, 0.5))
            else:
                dev['tiltAngle'] = max(0, min(1.0, dev['tiltAngle'] + random.uniform(-0.1, 0.1)))
                
            dev['lastUpdate'] = datetime.now().isoformat()
    
    response = jsonify(devices_data)
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return response

@app.route('/api/devices/search', methods=['POST'])
def search_devices():
    from flask import request
    
    criteria = request.json or {}
    status_filter = criteria.get('status')
    type_filter = criteria.get('type') # 'motor' or 'pipe'
    
    filtered_devices = []
    
    global devices_data
    for dev in devices_data:
        # Simulate random data update for fresh values
        if dev['status'] != 'maintenance':
             dev['rssi'] = max(-90, min(-40, dev['rssi'] + random.randint(-1, 1)))
             dev['vbat'] = max(2.8, min(4.2, dev['vbat'] + random.uniform(-0.01, 0.01)))
             if dev['status'] == 'warning':
                dev['tiltAngle'] = max(0, dev['tiltAngle'] + random.uniform(-0.5, 0.5))
             else:
                dev['tiltAngle'] = max(0, min(1.0, dev['tiltAngle'] + random.uniform(-0.1, 0.1)))
             dev['lastUpdate'] = datetime.now().isoformat()
        
        # Apply filters
        # 1. Type filter
        if type_filter:
            if type_filter == 'motor' and not dev['id'].startswith('motor'):
                continue
            if type_filter == 'pipe' and not dev['id'].startswith('pipe'):
                continue
                
        # 2. Status filter
        if status_filter and dev['status'] != status_filter:
            continue
            
        filtered_devices.append(dev)
        
    response = jsonify(filtered_devices)
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return response

@app.route('/api/devices/<device_id>', methods=['PUT', 'OPTIONS'])
def update_device(device_id):
    from flask import request
    if request.method == 'OPTIONS':
        return '', 204
        
    global devices_data
    update_data = request.json
    
    for device in devices_data:
        if device['id'] == device_id:
            if 'serial' in update_data:
                device['serial'] = update_data['serial']
            if 'name' in update_data:
                device['serial'] = update_data['name']
            return jsonify(device)
            
    logger.info(f"Device {device_id} not found", extra={"trace_id": "manual_trace_id"})
    return jsonify({"error": "Device not found"}), 404

@app.route('/api/devices/<device_id>/history', methods=['GET'])
def get_device_history(device_id):
    data = []
    now = datetime.now()
    for i in range(100):
        timestamp = now.timestamp() - i * 60
        data.append({
            'timestamp': datetime.fromtimestamp(timestamp).isoformat(),
            'rssi': -50 - random.random() * 30,
            'vbat': 3.2 + random.random() * 0.5,
            'tiltAngle': 5 + random.random() * 5,
            'tiltAngleX': (random.random() - 0.5) * 10,
            'tiltAngleY': (random.random() - 0.5) * 10,
        })
    return jsonify(list(reversed(data)))

@app.route('/api/devices/<device_id>/fft', methods=['GET'])
def get_device_fft(device_id):
    data = []
    num_points = 100
    peaks = [
        { 'freq': 10, 'amplitude': 80 },
        { 'freq': 25, 'amplitude': 60 },
        { 'freq': 50, 'amplitude': 90 },
        { 'freq': 75, 'amplitude': 40 },
    ]
    
    for i in range(num_points):
        frequency = (i / num_points) * 100
        magnitude = random.random() * 10
        
        for peak in peaks:
            distance = abs(frequency - peak['freq'])
            if distance < 5:
                magnitude += peak['amplitude'] * 2.718 ** (-(distance ** 2) / 2)
                
        data.append({ 'frequency': frequency, 'magnitude': magnitude })
        
    return jsonify(data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5001)
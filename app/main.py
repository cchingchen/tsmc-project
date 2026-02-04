from flask import Flask, jsonify, Response, stream_with_context, request
from flask_cors import CORS
import random
from datetime import datetime, timezone, timedelta
import time
import json
from common.logger_config import LogManager

log_manager = LogManager("app")
app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# mock data
devices_data = [
    { 'id': 'motor-1', 'type':'motor','serial': 'MOTOR-0001', 'status': 'normal', 'rssi': -60, 'vbat': 3.3, 'tiltAngle': 0.1, 'tiltAngleX': 0.05, 'tiltAngleY': 0.05, 'lastUpdate': datetime.now().isoformat() },
    { 'id': 'motor-2', 'type':'motor','serial': 'MOTOR-0002', 'status': 'normal', 'rssi': -55, 'vbat': 3.2, 'tiltAngle': 0.2, 'tiltAngleX': 0.1, 'tiltAngleY': 0.1, 'lastUpdate': datetime.now().isoformat() },
    { 'id': 'motor-3', 'type':'motor','serial': 'MOTOR-0003', 'status': 'warning', 'rssi': -82, 'vbat': 2.9, 'tiltAngle': 15.5, 'tiltAngleX': 10.5, 'tiltAngleY': 5.0, 'lastUpdate': datetime.now().isoformat() },
    { 'id': 'motor-4', 'type':'motor','serial': 'MOTOR-0004', 'status': 'normal', 'rssi': -58, 'vbat': 3.3, 'tiltAngle': 0.1, 'tiltAngleX': 0.1, 'tiltAngleY': 0.0, 'lastUpdate': datetime.now().isoformat() },
    { 'id': 'motor-5', 'type':'motor','serial': 'MOTOR-0005', 'status': 'normal', 'rssi': -58, 'vbat': 3.3, 'tiltAngle': 0.1, 'tiltAngleX': 0.1, 'tiltAngleY': 0.0, 'lastUpdate': datetime.now().isoformat() },
    { 'id': 'pipe-1', 'type':'pipe','serial': 'PIPE-0001', 'status': 'normal', 'rssi': -62, 'vbat': 3.3, 'tiltAngle': 0.0, 'tiltAngleX': 0.0, 'tiltAngleY': 0.0, 'lastUpdate': datetime.now().isoformat() },
    { 'id': 'pipe-2', 'type':'pipe','serial': 'PIPE-0002', 'status': 'maintenance', 'rssi': -90, 'vbat': 2.5, 'tiltAngle': 0.0, 'tiltAngleX': 0.0, 'tiltAngleY': 0.0, 'lastUpdate': datetime.now().isoformat() },
    { 'id': 'pipe-3', 'type':'pipe','serial': 'PIPE-0003', 'status': 'normal', 'rssi': -59, 'vbat': 3.2, 'tiltAngle': 0.1, 'tiltAngleX': 0.1, 'tiltAngleY': 0.0, 'lastUpdate': datetime.now().isoformat() },
    { 'id': 'pipe-4', 'type':'pipe','serial': 'PIPE-0004', 'status': 'warning', 'rssi': -85, 'vbat': 2.8, 'tiltAngle': 12.0, 'tiltAngleX': 8.0, 'tiltAngleY': 4.0, 'lastUpdate': datetime.now().isoformat() },
    { 'id': 'pipe-5', 'type':'pipe','serial': 'PIPE-0005', 'status': 'maintenance', 'rssi': -85, 'vbat': 2.8, 'tiltAngle': 12.0, 'tiltAngleX': 8.0, 'tiltAngleY': 4.0, 'lastUpdate': datetime.now().isoformat() },
]


def wrap_response(data=None, message="success", code=200, no_cache=True):
    """統一封裝回應格式以符合前端 ApiResponse<T>"""
    response = jsonify({
        "code": code,
        "message": message,
        "data": data,
        "trace_id": log_manager.get_current_trace_id()
    })
    if no_cache:
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return response, code

def simulate_device_update(dev):
    """模擬設備數據變動"""
    if dev['status'] != 'maintenance':
        dev['rssi'] = max(-90, min(-40, dev['rssi'] + random.randint(-1, 1)))
        dev['vbat'] = max(2.8, min(4.2, dev['vbat'] + random.uniform(-0.01, 0.01)))
        if dev['status'] == 'warning':
            dev['tiltAngle'] = max(0, dev['tiltAngle'] + random.uniform(-0.5, 0.5))
        else:
            dev['tiltAngle'] = max(0, min(1.0, dev['tiltAngle'] + random.uniform(-0.1, 0.1)))
        dev['lastUpdate'] = datetime.now().isoformat()
    return dev

@app.before_request
def start_trace():
    tid = request.headers.get('X-Trace-Id') or log_manager.generate_trace_id()
    log_manager.set_trace_id(tid)

@app.route('/api/devices', methods=['GET'])
def get_devices():
    global devices_data
    log_manager.info(f"獲取設備清單, Trace ID: {log_manager.get_current_trace_id()}")
    
    updated_list = [simulate_device_update(dev.copy()) for dev in devices_data]
    return wrap_response(updated_list)

@app.route('/api/devices/<device_id>', methods=['GET'])
def get_device_detail(device_id):
    global devices_data
    device = next((dev for dev in devices_data if dev['id'] == device_id), None)
    
    if not device:
        log_manager.warning(f"找不到設備: {device_id}")
        return wrap_response(None, message="Device not found", code=404)

    updated_device = simulate_device_update(device)
    return wrap_response(updated_device)

@app.route('/api/devices/search', methods=['POST'])
def search_devices():    
    criteria = request.json or {}
    status_filter = criteria.get('status')
    type_filter = criteria.get('type')
    
    filtered_devices = []
    global devices_data
    
    for dev in devices_data:
        updated_dev = simulate_device_update(dev.copy())
        
        # 類型過濾 (motor/pipe)
        if type_filter:
            if type_filter == 'motor' and not updated_dev['id'].startswith('motor'): continue
            if type_filter == 'pipe' and not updated_dev['id'].startswith('pipe'): continue
        
        # 狀態過濾
        if status_filter and updated_dev['status'] != status_filter: continue
            
        filtered_devices.append(updated_dev)
        
    return wrap_response(filtered_devices)

@app.route('/api/devices/<device_id>', methods=['PUT', 'OPTIONS'])
def update_device(device_id):
    if request.method == 'OPTIONS': return '', 204
        
    global devices_data
    update_data = request.json
    
    for device in devices_data:
        if device['id'] == device_id:
            if 'serial' in update_data: device['serial'] = update_data['serial']
            if 'name' in update_data: device['name'] = update_data['name'] # 假設未來擴充 name 欄位
            if 'status' in update_data: device['status'] = update_data['status']
            
            log_manager.info(f"設備 {device_id} 已更新", update_data=update_data)
            return wrap_response(device, message="設備更新成功")
            
    return wrap_response(None, message="Device not found", code=404)

@app.route('/api/devices/<device_id>/history', methods=['GET'])
def get_device_history(device_id):
    start_str = request.args.get('start')
    end_str = request.args.get('end')
    data = []
    print(start_str, end_str)
    if start_str and end_str:
        try:
            start_dt = datetime.fromisoformat(start_str.replace('Z', ''))
            end_dt = datetime.fromisoformat(end_str.replace('Z', ''))
            current = start_dt
            while current <= end_dt:
                data.append({
                    'timestamp': current.strftime('%Y-%m-%dT%H:%M:%SZ'),
                    'rssi': -60 + random.uniform(-5, 5),
                    'vbat': 3.3 + random.uniform(-0.1, 0.1),
                    'tiltAngle': random.uniform(0, 5),
                    'tiltAngleX': random.uniform(-2, 2),
                    'tiltAngleY': random.uniform(-2, 2),
                })
                current += timedelta(minutes=30)
        except Exception as e:
            return wrap_response(None, message=f"時間格式錯誤: {str(e)}", code=400)
    else:
        now = datetime.now(timezone.utc) 
        for i in range(100):
            dt = now - timedelta(minutes=i)
            data.append({
                'timestamp': dt.strftime('%Y-%m-%dT%H:%M:%SZ'), 
                'rssi': -50 - random.random() * 30,
                'vbat': 3.2 + random.random() * 0.5,
                'tiltAngle': 5 + random.random() * 5,
                'tiltAngleX': (random.random() - 0.5) * 10,
                'tiltAngleY': (random.random() - 0.5) * 10,
            })
        data.reverse()

    return wrap_response(data)

@app.route('/api/devices/<device_id>/fft', methods=['GET'])
def get_device_fft(device_id):
    data = []
    num_points = 100
    peaks = [{'freq': 10, 'amp': 80}, {'freq': 25, 'amp': 60}, {'freq': 50, 'amp': 90}]
    
    for i in range(num_points):
        freq = (i / num_points) * 100
        mag = random.random() * 10
        for p in peaks:
            dist = abs(freq - p['freq'])
            if dist < 5: mag += p['amp'] * 2.718 ** (-(dist ** 2) / 2)
        data.append({'frequency': freq, 'magnitude': mag})
        
    return wrap_response(data)

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return wrap_response(None, message="帳號密碼為必填", code=400)

        if username == "admin" and password == "123456":
            return wrap_response({"token": "fake-jwt-token-for-demo", "username": username}, message="登入成功")
        else:
            return wrap_response(None, message="帳號或密碼錯誤", code=401)
    except Exception as e:
        log_manager.error(f"Login Error: {str(e)}")
        return wrap_response(None, message="伺服器錯誤", code=500)

@app.route('/api/events')
def stream_events():
    def event_generator():
        global devices_data
        last_status = {dev['id']: dev['status'] for dev in devices_data}
        while True:
            try:                
                for dev in devices_data:
                    if last_status.get(dev['id']) != dev['status']:
                        if dev['status'] == 'warning':
                            payload = {
                                "type": "STATUS_CHANGE",
                                "deviceId": dev['id'],
                                "serial": dev['serial'],
                                "message": f"設備 {dev['serial']} 偵測到異常！",
                                "timestamp": datetime.now().isoformat()
                            }
                            yield f"data: {json.dumps(payload)}\n\n"
                        last_status[dev['id']] = dev['status']
                time.sleep(3) 
            except Exception:
                break
    return Response(stream_with_context(event_generator()), mimetype='text/event-stream', 
                    headers={'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5001)
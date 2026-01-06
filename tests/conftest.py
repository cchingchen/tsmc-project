import pytest
import os
from dotenv import load_dotenv
from pymongo import MongoClient
import redis
import paho.mqtt.client as mqtt
import time

load_dotenv()

# --- MongoDB Fixture ---
@pytest.fixture(scope="session")
def mongodb_client():
    host = os.getenv("MONGO_HOST", "localhost")
    port = int(os.getenv("MONGO_PORT", 27017))
    
    client = MongoClient(host=host, port=port)
    
    try:
        client.admin.command('ping')
    except Exception as e:
        pytest.fail(f"無法連線到 MongoDB: {e}")

    yield client
    
    client.close()

@pytest.fixture(scope="function")
def clean_mongo(mongodb_client):
    yield mongodb_client
    mongodb_client.drop_database("test_db")


# --- Redis Fixture ---
@pytest.fixture(scope="session")
def redis_client():
    host = os.getenv("REDIS_HOST", "localhost")
    port = int(os.getenv("REDIS_PORT", 6379))
    
    client = redis.Redis(host=host, port=port, decode_responses=True)
    
    try:
        client.ping()
    except redis.ConnectionError:
        pytest.fail("無法連線到 Redis")
        
    yield client
    client.close()

@pytest.fixture(scope="function")
def clean_redis(redis_client):
    yield redis_client
    redis_client.flushdb()

# --- MQTT Fixture ---
@pytest.fixture(scope="session")
def mqtt_client():
    host = os.getenv("MQTT_HOST", "localhost")
    port = int(os.getenv("MQTT_PORT", 1883))
    
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    
    connection_status = {'connected': False}

    def on_connect(client, userdata, flags, reason_code, properties):
        if reason_code == 0:
            connection_status['connected'] = True

    client.on_connect = on_connect
    
    try:
        client.connect(host, port, 60)
        client.loop_start()
        
        start_time = time.time()
        while not connection_status['connected']:
            if time.time() - start_time > 10:
                client.loop_stop()
                pytest.fail("無法在 10 秒內連線到 MQTT Broker")
            time.sleep(0.1)
            
    except Exception as e:
        pytest.fail(f"無法連線到 MQTT Broker: {e}")
        
    yield client
    
    client.loop_stop()
    client.disconnect()


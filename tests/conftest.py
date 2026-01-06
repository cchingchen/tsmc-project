import pytest
import time
from testcontainers.mongodb import MongoDbContainer
from testcontainers.redis import RedisContainer
from testcontainers.core.container import DockerContainer
from pymongo import MongoClient
import redis
import paho.mqtt.client as mqtt
import time
import os

@pytest.fixture(scope="session")
def mongodb_client():
    """
    Spins up a MongoDB container and yields a configured MongoClient.
    """
    with MongoDbContainer("mongo:latest") as mongo:
        client = mongo.get_connection_client()
        # Verify connection before yielding
        try:
            client.admin.command('ping')
        except Exception as e:
            # Fallback for some environments: ensure we use 127.0.0.1 if localhost fails resolution
            host = mongo.get_container_host_ip()
            port = mongo.get_exposed_port(27017)
            if host == "localhost":
                host = "127.0.0.1"
            client = MongoClient(host=host, port=int(port))
            client.admin.command('ping')
            
        yield client

@pytest.fixture(scope="session")
def redis_client():
    """
    Spins up a Redis container and yields a configured Redis client.
    """
    with RedisContainer("redis:latest") as redis_container:
        host = redis_container.get_container_host_ip()
        port = redis_container.get_exposed_port(6379)
        if host == "localhost":
            host = "127.0.0.1"
        client = redis.Redis(host=host, port=int(port), decode_responses=True)
        try:
            client.ping()
        except redis.ConnectionError:
            # simple retry
            time.sleep(1)
            client.ping()
        yield client

@pytest.fixture(scope="session")
def mqtt_client():
    """
    Spins up an Eclipse Mosquitto container with custom config
    to allow anonymous connections from host.
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    conf_path = os.path.join(current_dir, "mosquitto.conf")

    with DockerContainer("eclipse-mosquitto:latest") \
            .with_exposed_ports(1883) \
            .with_volume_mapping(conf_path, "/mosquitto/config/mosquitto.conf") \
            as mqtt_container:
        
        host = mqtt_container.get_container_host_ip()
        port = mqtt_container.get_exposed_port(1883)
        
        if host == "localhost":
            host = "127.0.0.1"
        
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        
        connection_status = {'connected': False}
        
        def on_connect(client, userdata, flags, reason_code, properties):
            if reason_code == 0:
                connection_status['connected'] = True

        client.on_connect = on_connect
        client.connect(host, int(port), 60)
        client.loop_start()
        
        start_time = time.time()
        while not connection_status['connected']:
            if time.time() - start_time > 10:
                client.loop_stop()
                raise TimeoutError("Could not connect to MQTT Broker. Check mosquitto.conf mapping.")
            time.sleep(0.1)
            
        yield client
        
        client.loop_stop()
        client.disconnect()
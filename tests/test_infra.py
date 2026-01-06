import paho.mqtt.client as mqtt
def test_mongodb(mongodb_client):
    """
    Smoke test for MongoDB: Verify insert and find operations.
    """
    db = mongodb_client.test_db
    collection = db.test_collection
    
    document = {"key": "value", "type": "integration_test"}
    result = collection.insert_one(document)
    
    assert result.inserted_id is not None
    
    fetched_doc = collection.find_one({"_id": result.inserted_id})
    assert fetched_doc is not None
    assert fetched_doc["key"] == "value"

def test_redis(redis_client):
    """
    Smoke test for Redis: Verify set and get operations.
    """
    key = "test_key"
    value = "test_value"
    
    redis_client.set(key, value)
    fetched_value = redis_client.get(key)
    
    assert fetched_value == value

def test_mqtt(mqtt_client):
    """
    Smoke test for MQTT: Verify connection and publish.
    """
    # Verify connection to the broker
    assert mqtt_client.is_connected()
    
    # Test publishing a message (ensure no exception is raised)
    topic = "test/topic"
    payload = "Hello MQTT"
    info = mqtt_client.publish(topic, payload)
    
    info.wait_for_publish()
    assert info.rc == mqtt.MQTT_ERR_SUCCESS
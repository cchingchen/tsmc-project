import paho.mqtt.client as mqtt

def test_mongo_write(clean_mongo):
    db = clean_mongo.get_database("test_db")
    col = db.sensors
    
    col.insert_one({"temp": 25})
    
    assert col.count_documents({}) == 1
    
    clean_mongo.drop_database("test_db")

def test_redis_cache(clean_redis):
    clean_redis.set("status", "active")
    assert clean_redis.get("status") == "active"
    clean_redis.flushdb()

def test_mqtt(mqtt_client):
    assert mqtt_client.is_connected()
    info = mqtt_client.publish("test/topic", "hi")
    info.wait_for_publish()
    assert info.rc == mqtt.MQTT_ERR_SUCCESS
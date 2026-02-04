#  backend mocked data api

## 前置

確定有下載以下：
* Docker
* Docker Compose
-----
## 啟動服務
1. clone branch

2. docker compose 啟動服務
```
docker-compose up -d --build
```

3. 服務跑在 http://localhost:5001/
可以輸入以下指令測試

```
curl -X GET http://localhost:5001/api/devices
```
=> 若有顯示資料表示打通服務



### 查看 log

可以跑以下指令確認服務有沒有跑成功

```bash
docker logs -f iot-server
```
另有設置 log 服務，檔案存放在 ./logs/。

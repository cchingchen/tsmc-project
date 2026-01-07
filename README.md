# HiveMQ Docker 部署


## docker 事前準備

```bash
# 更新系統並安裝 Docker
apt update && apt upgrade -y
apt install -y docker.io docker-compose-v2 wget unzip ufw

# 啟動 Docker 並設定開機自啟
systemctl enable --now docker

# 可以看有沒有亮綠燈顯示 active (running)
systemctl status docker
```

## 專案結構

```bash
hivemq-deployment/
├── docker-compose.yml      
├── conf/                    
│   └── config.xml           # HiveMQ 設定
├── extensions/              # 擴充功能 (例如 file-rbac )
│   └── allow-all-extension/ 

```



## 部署步驟

將此 folder 上傳完成後(scp)，進入伺服器執行以下：

### 1. 搬移專案至 `/opt` (recommend)

專案移至 `/opt/hivemq`：

```bash
# [path] 為從本地上傳此 folder 到 server 的地方
mv /[path]/hivemq-deployment /opt/hivemq
cd /opt/hivemq
```

### 2. 權限

確保 Docker 內的 HiveMQ (UID 10000) 能讀取你上傳的設定：

```bash
# 修正權限 (讓容器內的 UID 10000 有權讀寫)
chown -R 10000:10000 /opt/hivemq
chmod -R 775 /opt/hivemq
chmod -R 777 ./data

# firewall
ufw allow 22/tcp
ufw allow 1883/tcp
```

#### 註：通常是權限比較容易遇到問題

### 3. 啟動服務

```bash
docker compose up -d
```

### 4. 查看是否成功啟動服務

```bash
docker logs hivemq
```

若顯示以下訊息，即啟動服務

```bash
2026-01-07 07:43:28,902 INFO  - Starting with file persistence mode.
2026-01-07 07:43:29,640 INFO  - Starting HiveMQ extension system.
2026-01-07 07:43:29,736 INFO  - Starting File RBAC extension.
2026-01-07 07:43:29,886 INFO  - Extension "HiveMQ File Role Based Access Control Extension" version 4.6.9 started successfully.
2026-01-07 07:43:29,924 INFO  - Started HTTPServer exposing Prometheus metrics on http://0.0.0.0:9399/metrics
2026-01-07 07:43:29,924 INFO  - Extension "Prometheus Monitoring Extension" version 4.0.16 started successfully.
2026-01-07 07:43:29,953 INFO  - Starting TCP listener on address 0.0.0.0 and port 1883
2026-01-07 07:43:29,988 INFO  - Started TCP Listener on address 0.0.0.0 and on port 1883.
2026-01-07 07:43:29,988 INFO  - Started HiveMQ in 3025ms
```

### 5. 測試連上 hivemq

可以撰寫任一連接 mqtt 腳本測試是否可以連上

# Устанавливаем Docker
```
sudo apt update
sudo apt install libseccomp2
sudo apt update
sudo apt install -y apt-transport-https curl
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
sudo apt install -y docker.io
echo 'net.ipv4.ip_forward = 1'| sudo tee -a /etc/sysctl.d/10-ip-forwarding.conf
sudo sysctl net.ipv4.ip_forward=1
sudo systemctl daemon-reload
sudo apt install apt-transport-https --yes
sudo usermod -aG docker $USER
```
# Инициализируем Swarm
```
docker swarm init --advertise-addr <IP host>
```
# Копируем бэкапы с хоста 10.10.150.124
```
sudo cp -r srvadmin@10.10.150.124:/k8s_backup /
pass: Armadill0!#
```

# Распаковываем архивы и создаем каталоги для сервисов
```
cd /
sudo tar -xvf /k8s_backup/Volumes/jira/<archive file>
sudo tar -xvf /k8s_backup/Volumes/bitbucket/<archive file>
sudo tar -xvf /k8s_backup/Volumes/confluence/<archive file>
sudo tar -xvf /k8s_backup/Volumes/chat-data/<archive file>
sudo tar -xvf /k8s_backup/Volumes/traefik-certs/<archive file>

gzip -dk /k8s_backup/Database/jira/<archive file>
gzip -dk /k8s_backup/Database/confluence/<archive file>
gzip -dk /k8s_backup/Database/bitbucket/<archive file>

sudo chown -R $(id -u):$(id -g) /kubernetes_volumes
sudo chown -R $(id -u):$(id -g) /k8s_backup
mkdir /kubernetes_volumes/pgdata1
mkdir /kubernetes_volumes/pgdata2
mkdir /kubernetes_volumes/traefik-conf
mkdir /kubernetes_volumes/traefik-logs
mkdir /kubernetes_volumes/chat-log
cp -a /k8s_backup/k8s-manifests/repo/docker/traefik/config/ /kubernetes_volumes/traefik-conf/
```
# Правим подлючение сервисов к БД
## Bitbucket
```
Правим /kubernetes_volumes/bitbucket-shared/bitbucket.properties
jdbc.url=jdbc:postgresql://<IP host>:5433/bitbucket
```
## Confluence
```
Правим /kubernetes_volumes/confluence-data/confluence.cfg.xml
jdbc:postgresql://<IP host>:5432/confluence
```
## Jira
```
Правим /kubernetes_volumes/persistentVolumes/pvc-a93987db-0166-4451-8c31-eca79acc7ec1/dbconfig.xml
jdbc:postgresql://<IP host>:5432/jira
```
# Меняем права каталогов для доступа сервисов
```
sudo chown -R 2003:2003 /kubernetes_volumes/persistentVolumes/pvc-89bd05a2-bf33-48d5-b767-6102d5b80e73/
sudo chown -R 2003:2003 /kubernetes_volumes/bitbucket-shared/
sudo chown -R 2002:2002 /kubernetes_volumes/confluence-data/
sudo chown -R 2001:2001 /kubernetes_volumes/persistentVolumes/pvc-a93987db-0166-4451-8c31-eca79acc7ec1/
```
# Создаем  Docker Secrets, Volumes, Networks
```
docker secret create chat-config.json /k8s_backup/k8s-manifests/repo/docker/messenger/chat-config.json 
docker secret create firebase-config.json /k8s_backup/k8s-manifests/repo/docker/messenger/firebase-config.json
docker secret create okbtsp-crt /kubernetes_volumes/traefik-certs/cert.crt
docker secret create okbtsp-key /kubernetes_volumes/traefik-certs/cert.key

docker network create --driver overlay docker_net
docker network create --driver overlay traefik_net
docker network create --driver overlay traefik_internal

docker volume create --opt type=none --opt o=bind --opt device=/kubernetes_volumes/pgdata1 pgdata1
docker volume create --opt type=none --opt o=bind --opt device=/kubernetes_volumes/pgdata2 pgdata2
docker volume create --opt type=none --opt o=bind --opt device=/kubernetes_volumes/bitbucket-shared/ bitbucket-shared
docker volume create --opt type=none --opt o=bind --opt device=/kubernetes_volumes/persistentVolumes/pvc-a93987db-0166-4451-8c31-eca79acc7ec1/ jira
docker volume create --opt type=none --opt o=bind --opt device=/kubernetes_volumes/persistentVolumes/pvc-89bd05a2-bf33-48d5-b767-6102d5b80e73 bitbucket
docker volume create --opt type=none --opt o=bind --opt device=/kubernetes_volumes/confluence-data/ confluence
docker volume create --opt type=none --opt o=bind --opt device=/kubernetes_volumes/chat-data/ chat_data
docker volume create --opt type=none --opt o=bind --opt device=/kubernetes_volumes/chat-log/ chat_log
docker volume create --opt type=none --opt o=bind --opt device=/kubernetes_volumes/traefik-conf/ traefik-config
docker volume create --opt type=none --opt o=bind --opt device=/kubernetes_volumes/traefik-logs/ traefik-logs
```
# Deploy Traefik
```
docker stack deploy -c /k8s_backup/k8s-manifests/repo/docker/traefik/traefik.yml proxy
```
# Deploy Postgres
```
docker stack deploy -c /k8s_backup/k8s-manifests/repo/docker/postgres/postgres.yml postgres
```

# Восстанаволиваем БД
## Копируем файлы для БД Jira и Confluence
```
docker cp /k8s_backup/Database/jira/<uzip file> $(docker container ls | grep postgres:9.6 | awk ' {print $1}'):/tmp
docker cp /k8s_backup/Database/confluence/<uzip file> $(docker container ls | grep postgres:9.6 | awk ' {print $1}'):/tmp
```
## Копируем файлы для БД Bitbucket
```
docker cp /k8s_backup/Database/bitbucket/<uzip file> $(docker container ls | grep postgres:13.5 | awk ' {print $1}'):/tmp
```

## Любым доступным способом создаем ДБ jira/confluence/bitbucket
## Если создаем БД через pgAdmin, тогда <IP>:5432 - для БД jira/confluence, <IP>:5433 - для БД bitbucket
### Настройки БД
```
General:
Owner           "limiteduser"

Definition:
Encoding         "UTF8"
Tablespace       "pg_default"
Collation        "C"
Character type   "C"
Connection limit "-1"

Security:
PUBLIC          "Tc"
limiteduser     "CT*c"
```

## Востанавливаем БД jira/confluence
### Заходим в контейнер postgres_pimary
```
docker exec -u root -it $(docker container ls | grep postgres:9.6 | awk ' {print $1}') /bin/bash
```
### В контейнере выполняем
```

psql -U limiteduser postgres
CREATE DATABASE jira WITH OWNER = limiteduser TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'C' LC_CTYPE = 'C' TABLESPACE = pg_default CONNECTION LIMIT = -1 IS_TEMPLATE = False;
GRANT TEMPORARY, CONNECT ON DATABASE jira TO PUBLIC;
GRANT CREATE, CONNECT ON DATABASE jira TO limiteduser;
GRANT TEMPORARY ON DATABASE jira TO limiteduser WITH GRANT OPTION;

CREATE DATABASE confluence WITH OWNER = limiteduser TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'C' LC_CTYPE = 'C' TABLESPACE = pg_default CONNECTION LIMIT = -1 IS_TEMPLATE = False;
GRANT TEMPORARY, CONNECT ON DATABASE confluence TO PUBLIC;
GRANT CREATE, CONNECT ON DATABASE confluence TO limiteduser;
GRANT TEMPORARY ON DATABASE confluence TO limiteduser WITH GRANT OPTION;

psql -U limiteduser <bd name (jira,confluence)>  <  </tmp/<jira/confluence file>

```
### Заходим в контейнер postgres_second
```
docker exec -u root -it $(docker container ls | grep postgres:13.5 | awk ' {print $1}') /bin/bash

```
### В контейнере выполняем
```
psql -U limiteduser postgres
CREATE DATABASE bitbucket WITH OWNER = limiteduser TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'C' LC_CTYPE = 'C' TABLESPACE = pg_default CONNECTION LIMIT = -1 IS_TEMPLATE = False;
GRANT TEMPORARY, CONNECT ON DATABASE bitbucket TO PUBLIC;
GRANT CREATE, CONNECT ON DATABASE bitbucket TO limiteduser;
GRANT TEMPORARY ON DATABASE bitbucket TO limiteduser WITH GRANT OPTION;

psql -U limiteduser bitbucket  <  </tmp/<bitbucket file>
```

# Деплоим сервисы
```
docker stack deploy -c /k8s_backup/k8s-manifests/docker/atlassian/jira/jira.yml atlassian
docker stack deploy -c /k8s_backup/k8s-manifests/repo/docker/atlassian/confluence/confluence.yml atlassian
docker stack deploy -c /k8s_backup/k8s-manifests/docker/atlassian/bitbucket/bitbucket.yml atlassian
docker stack deploy -c /k8s_backup/k8s-manifests/repo/docker/messenger/messenger.yml chat
```
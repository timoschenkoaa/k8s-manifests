
# Устанавливаем network CNI Canico
```
kubectl apply -f  https://docs.projectcalico.org/manifests/calico.yaml
```

# Install Helm for Kuber:
```
curl https://baltocdn.com/helm/signing.asc | sudo apt-key add -
sudo apt-get install apt-transport-https --yes
echo "deb https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install helm
```
```
helm repo add atlassian-data-center https://atlassian.github.io/data-center-helm-charts
helm repo add metallb https://metallb.github.io/metallb
helm repo add traefik https://helm.traefik.io/traefik
helm repo add csi-driver-nfs https://raw.githubusercontent.com/kubernetes-csi/csi-driver-nfs/master/charts
helm repo add kasten https://charts.kasten.io/
helm repo update
```

# Create Namespaces
```
kubectl apply -f manifests/namespaces.yaml
```

# Deploy NFS CSI driver
```
helm install csi-driver-nfs csi-driver-nfs/csi-driver-nfs --namespace kube-system
```

# Deploy Storage Class (Dynamic Provisioning)
```
kubectl apply -f manifests/storage-class.yaml
```

# Deploy LoadBalancer MetalLB:
## Enable IPVS mode:
### see what changes would be made, returns nonzero returncode if different
```
kubectl get configmap kube-proxy -n kube-system -o yaml | \
sed -e "s/strictARP: false/strictARP: true/" | \
kubectl diff -f - -n kube-system
```
### actually apply the changes, returns nonzero returncode on errors only
```
kubectl get configmap kube-proxy -n kube-system -o yaml | \
sed -e "s/strictARP: false/strictARP: true/" | \
kubectl apply -f - -n kube-system
```
### Install MetalLB:
```
helm install metallb metallb/metallb -f manifests/metallb/metallb-values.yaml --namespace metallb
```

# Deploy Traefik:
```
kubectl create secret tls traefik-tls-cert --key manifests/traefik/Certificate.key --cert manifests/traefik/Certificate.crt -n traefik
kubectl -n traefik apply -f manifests/traefik/configmap.yaml
helm  upgrade --install traefik traefik/traefik -f manifests/traefik/traefik-values.yaml --namespace traefik
kubectl -n traefik apply -f manifests/traefik/traefik-auth.yaml
kubectl apply -f manifests/traefik/traefik-ingress.yaml -n traefik
```

# Deploy PostgreSQL for services
```
kubectl -n awx apply -f manifests/postgresql/awx/
kubectl -n bamboo apply -f manifests/postgresql/bamboo/
kubectl -n bitbucket apply -f manifests/postgresql/bitbucket/
kubectl -n confluence apply -f manifests/postgresql/confluence/
kubectl -n jfrog apply -f manifests/postgresql/jfrog/
kubectl -n jira apply -f manifests/postgresql/jira/
```

# Deploy Jira
```
kubectl apply -f manifests/atlassian/jira/jira-configmap-db.yaml
kubectl -n jira create secret generic jira-license --from-literal=license="AAABgA0ODAoPeNp9kc1u4jAURvd+CkuzaRdEMe2gCslS28QLOgQQoV11cwmX1iWxo2uHNm8/IQkSqLRL/1x/53z+k1jDE6i5EFzcjW9GYzHiUbziw3AYsjdCNO+2LJGCqc7QOFQb7bU1Us1WarlYTlLFZlWxRppvnx2SkyIMWWSNh8zPoECZwM7pgj9CvbN7t9M1W1SUvYPDGDzKQ84g/DsQgvUJq7rEdjKaJ4laRpOH6fFIfZWa6nauMrkutMfNMUwloHO5Psbc293auzLIbME+NEFQkt1UmQ8Oi4GzW/8JhEEzqPcoPVXYXftZ80IZl1AbDOPRgMlOcRtN0Wv+QvO9yT5oEsvpJE7VbCBu7sLRbThizUKebfzybuqBPJLcQu6QzekNjHbQCs7/PfJVumARYbtx/ilDlncALw3Q4frwrAZsTKkk7foGY3QZ6bJ9+Kkh4GlPwK9SpD3SNW+keKv3OuaRLQqkTEPOe89O4qdPuVT3Kc7pnNpDXnWKnfV/vF4B/TAsAhRWUIPvF5s9RjY1POdUMDCAT8dRFwIUbNqy1uyo67/EgV1rDB8D1Zk8fvU=X02im"
kubectl -n jira create secret generic jira-postgres --from-literal=username=<db user>  --from-literal=password=<password>
helm upgrade --install jira atlassian-data-center/jira --values manifests/atlassian/jira/values.yaml --namespace jira
```

# Deploy Bitbucket
```
kubectl -n bitbucket create secret generic bitbucket-admin --from-literal=displayName=Administrator --from-literal=emailAddress="atlassian@okbtsp.com" --from-literal=username=Administrator --from-literal=password=<password>
kubectl -n bitbucket create secret generic bitbucket-license --from-literal=license="AAABlQ0ODAoPeNp1kl1v2jAUhu/9KyLtZtOUzjGMUCRLAycrUEIoyaqp4sZYh2IFnMh2SPn3Mwms2qTe+Xz5Oe9rf0pK5UUgPII9HI4CMuphj2W5i0mACjg/gzayVDQYYBziYa8XIFYqy4Vd8iNQK4+lE"
kubectl -n bitbucket create secret generic bitbucket-postgres --from-literal=username=<db user>  --from-literal=password=<password>
helm upgrade --install bitbucket atlassian-data-center/bitbucket --values manifests/atlassian/bitbucket/values.yaml --namespace bitbucket
```

# Deploy Confluence
```
kubectl -n confluence create secret generic db-conf --from-literal=username=<user> --from-literal=password='<pass>' \
--from-literal=db='jdbc:postgresql://postgresql.postgresql-svc.confluence.svc.cluster.local:5432/<db_name>'
kubectl -n confluence create secret generic confluence-license --from-literal=license="AAABNw0ODAoPeNptkD9vwjAQxXd/Cktd2iHICdAGJEuFJAMqAdTQTl0Oc7QWjhPZDmq+fZ0/A0MHL 3733u/ePRTgaA4tDWPK4mU4XUYLmqRHGrFwQXZNeUKzv3xYNJbPGUnRCiNrJyvNk0pfVINaIH0s0 NzQPNE5o/3s15ImVVmiERIU3UqB2iJJDEJnTcEh7wABmwdhTHySA+F2UCJfKbxabOm6ET/g7FW2R HjQxOvyhtyZBoePwoFxaPgFVBc9RGQ5SMXhXL5W15Oz9URUJcluoJoePA73/nGpY1tjD072eZ69J 5vVlqhB+vRFOlNEfKp2qMF3zX5radqxQcQCNusa7M03aGkHyP5tTY/FgRTZjvsXhNOYPc/YCxmRm 5RvN+l/yl14o5UspcMzOTTGn8Li3dV65h8koJL0MCwCFCHB7eCouEHvz6stLs7UgdLFKwDrAhQYo ALXbiO8GQTFJ/OD070B3OlanQ==X02fj"
helm upgrade --install confluence atlassian-data-center/confluence --values manifests/atlassian/confluence/values.yaml --namespace confluence
```


# Deploy Bamboo
```
kubectl -n bamboo apply -f manifests/atlassian/bamboo/
```

# Deploy Jfrog Artifactory
```
kubectl -n jfrog apply -f manifests/jfrog/
```

# Deploy Kibana, ElasticSearch, Fluent
```
kubectl -n kube-logging apply -f manifests/logging/
```

# Deploy Prometheus Monitoring stack
```
helm upgrade --install prometheus-stack prometheus-community/kube-prometheus-stack --values manifests/monitoring/values.yaml --namespace monitoring
kubectl apply -f manifests/monitoring/for_plugin/
```

# Удаление неиспользованных PV/PVC
```
kubectl get pv | tail -n +2 | grep -v Bound | awk '{print $1}' | xargs -I{} kubectl delete pv {}
kubectl -n <namespace> get pvc | tail -n +2 | grep -v Bound | awk '{print $1}' | xargs -I{} kubectl -n <namespace> delete pvc {}
```
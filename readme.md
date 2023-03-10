# Configure project
1. run npm i 
2. execute the step of AWS Backend's readme. 
3. create a file in "CM-K8S-BACKEND/Shared/" named AWSCredentials.ts
4. The content must be like this: 
```
export class AWSCredentials {
  static accessKey = <yourAccessKey>
  static secretKey = <yourSecretKey>
}
```
3. set up k3s user credentials in Shared/AWSCredentials
# How to deploy
1. install k3s and k3d utility : curl -s https://raw.githubusercontent.com/rancher/k3d/main/install.sh | bash
2. create the cluster: k3d cluster create cm -p "80:80@loadbalancer"
3. launch the deploy sh : 
    1. cd sh
    2. ./deploy-CM.sh
4. check the pod status: kubectl get pods  -A
5. check the services status: kubectl get services  -A
6. check the ingress rules: kubectl describe ingress cm



# Useful commands:
kubectl delete service cm-campusservice
kubectl delete deployment cm-campusservice
kubectl create -f deployment.yaml
kubectl create -f service.yaml
kubectl get services  -A
kubectl get deployments  -A
kubectl get pods  -A
kubectl get ing -A
kubectl describe ingress cm -n ingress-basic

//kubernetes config:
1. curl -s https://raw.githubusercontent.com/rancher/k3d/main/install.sh | bash
2. k3d cluster create testp -p "80:80@loadbalancer"
3. kubectl config view
4. kubectl config current-context
1. npx tsc
2. docker build -t scionticdx/campusservice . 
3. docker push scionticdx/campusservice:latest
// delete old deployment
4. kubectl delete deployment cm-campusservice
5. kubectl delete service cm-campusservice
//create new deployment
6. kubectl create -f deployment.yaml
7. kubectl create -f service.yaml

//ingress
kubectl delete ing cm
kubectl create -f ingress.yaml

//port forwarding to test:
kubectl port-forward cm-campusservice-698cbcd58-fmfc2 80:80
//see logs of the ingress (traefik)
sudo kubectl --namespace default logs cm-authservice-5994c86544-cqftv

//restart traefik 
kubectl scale deployment traefik  --replicas=0 -n kube-system
kubectl scale deployment traefik  --replicas=1 -n kube-system

//pod shell
kubectl exec --stdin --tty cm-campusservice-698cbcd58-57zn5 -- /bin/bash

//get service endpoints 
kubectl get endpoints <name>

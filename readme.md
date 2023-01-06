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
8. kubectl create -f ingress.yaml


//port forwarding to test:
kubectl port-forward cm-campusservice-698cbcd58-fmfc2 80:80

//see logs of the ingress (traefik)
sudo kubectl --namespace kube-system logs traefik-67987d5d7f-flp67


//restart traefik 
kubectl scale deployment traefik  --replicas=0 -n kube-system
kubectl scale deployment traefik  --replicas=1 -n kube-system


//pod shell
kubectl exec --stdin --tty cm-campusservice-698cbcd58-57zn5 -- /bin/bash

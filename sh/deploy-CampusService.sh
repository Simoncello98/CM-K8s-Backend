npx tsc
docker image rm scionticdx/campusservice
docker build -t scionticdx/campusservice ../CampusService/. 
docker push scionticdx/campusservice:latest
kubectl delete deployment cm-campusservice
kubectl delete service cm-campusservice
kubectl create -f ../CampusService/deployment.yaml
kubectl create -f ../CampusService/service.yaml
npx tsc
ln ../PeopleServices/CampusService/dockerfile ../dockerfile #added cause docker file seems to not work with relative path in parent folders

docker image rm scionticdx/campusservice
docker build -t scionticdx/campusservice ../. 

unlink ../dockerfile #added cause docker file seems to not work with relative path in parent folders

docker push scionticdx/campusservice:latest
kubectl delete deployment cm-campusservice
kubectl delete service cm-campusservice
kubectl create -f ../PeopleServices/CampusService/deployment.yaml
kubectl create -f ../PeopleServices/CampusService/service.yaml
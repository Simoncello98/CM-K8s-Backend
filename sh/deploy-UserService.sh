npx tsc
ln ../PeopleServices/UserService/dockerfile ../dockerfile #added cause docker file seems to not work with relative path in parent folders

docker image rm scionticdx/userservice
docker build -t scionticdx/userservice ../. 

unlink ../dockerfile #added cause docker file seems to not work with relative path in parent folders

docker push scionticdx/userservice:latest
kubectl delete deployment cm-userservice
kubectl delete service cm-userservice
kubectl create -f ../PeopleServices/UserService/deployment.yaml
kubectl create -f ../PeopleServices/UserService/service.yaml
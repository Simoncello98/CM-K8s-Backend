npx tsc
ln ../PeopleServices/VisitorService/dockerfile ../dockerfile #added cause docker file seems to not work with relative path in parent folders

docker image rm scionticdx/visitorservice
docker build -t scionticdx/visitorservice ../. 

unlink ../dockerfile #added cause docker file seems to not work with relative path in parent folders

docker push scionticdx/visitorservice:latest
kubectl delete deployment cm-visitorservice
kubectl delete service cm-visitorservice
kubectl create -f ../PeopleServices/VisitorService/deployment.yaml
kubectl create -f ../PeopleServices/VisitorService/service.yaml
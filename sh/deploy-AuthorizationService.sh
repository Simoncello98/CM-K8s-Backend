npx tsc
ln ../Authorization/AuthorizationService/dockerfile ../dockerfile #added cause docker file seems to not work with relative path in parent folders

docker image rm scionticdx/authservice
docker build -t scionticdx/authservice ../. 

unlink ../dockerfile #added cause docker file seems to not work with relative path in parent folders

docker push scionticdx/authservice:latest
kubectl delete deployment cm-authservice
kubectl delete service cm-authservice
kubectl create -f ../Authorization/AuthorizationService/deployment.yaml
kubectl create -f ../Authorization/AuthorizationService/service.yaml
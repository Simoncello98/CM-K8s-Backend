npx tsc
ln ../PeopleServices/CampusXCompanyService/dockerfile ../dockerfile #added cause docker file seems to not work with relative path in parent folders

docker image rm scionticdx/campusxcompanyservice
docker build -t scionticdx/campusxcompanyservice ../. 

unlink ../dockerfile #added cause docker file seems to not work with relative path in parent folders

docker push scionticdx/campusxcompanyservice:latest
kubectl delete deployment cm-campusxcompanyservice
kubectl delete service cm-campusxcompanyservice
kubectl create -f ../PeopleServices/CampusXCompanyService/deployment.yaml
kubectl create -f ../PeopleServices/CampusXCompanyService/service.yaml
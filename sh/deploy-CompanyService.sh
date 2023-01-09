npx tsc
ln ../PeopleServices/CompanyService/dockerfile ../dockerfile #added cause docker file seems to not work with relative path in parent folders

docker image rm scionticdx/companyservice
docker build -t scionticdx/companyservice ../. 

unlink ../dockerfile #added cause docker file seems to not work with relative path in parent folders

docker push scionticdx/companyservice:latest
kubectl delete deployment cm-companyservice
kubectl delete service cm-companyservice
kubectl create -f ../PeopleServices/CompanyService/deployment.yaml
kubectl create -f ../PeopleServices/CompanyService/service.yaml
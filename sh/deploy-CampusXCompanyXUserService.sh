npx tsc
ln ../PeopleServices/CampusXCompanyXUserService/dockerfile ../dockerfile #added cause docker file seems to not work with relative path in parent folders

docker image rm scionticdx/campusxcompanyxuserservice
docker build -t scionticdx/campusxcompanyxuserservice ../. 

unlink ../dockerfile #added cause docker file seems to not work with relative path in parent folders

docker push scionticdx/campusxcompanyxuserservice:latest
kubectl delete deployment cm-campusxcompanyxuserservice
kubectl delete service cm-campusxcompanyxuserservice
kubectl create -f ../PeopleServices/CampusXCompanyXUserService/deployment.yaml
kubectl create -f ../PeopleServices/CampusXCompanyXUserService/service.yaml
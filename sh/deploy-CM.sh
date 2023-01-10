
./deploy-AuthorizationService.sh
./deploy-CampusService.sh
./deploy-CampusXCompanyService.sh
./deploy-CampusXCompanyXUserService.sh
./deploy-CompanyService.sh
./deploy-UserService.sh
./deploy-VisitorService.sh
kubectl delete ing cm
cd ../
kubectl create -f ingress.yaml
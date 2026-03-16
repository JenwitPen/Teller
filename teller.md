
1:create project name is Teller using NestJs + TypeScript 
2:craete goose db migration sql server 
3:craete script sql server for transaction-history , account schema on teller db, no foreign key 
4:create folder for controller , services , repositorys,models ,
5:create env file for config db connection url jdbc:sqlserver://;serverName=localhost;databaseName=teller;encrypt=true , username sa,password MyPass@word 
6:create api for transaction-history , account using schema on teller db, raw sql, must use account_id for condition only,no use id for condition, use get post http method for api only  
7:validate mandatory field for  request body  
8:validate mandatory field for  request header  
9:craete curl for call all api  
10:default port 8000 
11:move query from .service to repository 
12:create api update balance by account_id then if api update balance success then insert transaction-history with transaction_type = 'DEPOSIT' or 'WITHDRAW' 
14:refactor code account_id/balance using  Pessimistic Locking (SQL Server)  
15:read docker-compose-redis.yml then create service to connect redis and set/get/lock value from redis  
16:create api for account_id/balance v2 use redis for caching data and lock data when update balance  
17:สร้าง api สำหรับ login โดยส่ง username password และจะต้อง retrun jwt ไปให้ 
18: add branch_code, account_type, currency_code, account_name, status,  version, closed_at to account table then 
- create script alter column  
- create initail 5 account  script 
- modify code 
- modify curl for call all api at scripts/curls.sh
19: add branch_code, updated_at, status(ACTIVE,INACTIVE), employee_id to user table then 
- create script alter column  
- create initail 5 user  script 
- modify code 
- modify curl for call all api at scripts/curls.sh
20: add branch_code, employee_id, employee_id to transaction_history table then 
- create script alter column  
- modify code 
- modify curl for call all api at scripts/curls.sh
21: create api for get list transaction-history by account_id and branch_code and employee_id and transaction_type and date range and page
22: create api for get list transaction-history by account_id and date range and page
23: create swagger then add @ApiProperty() for all api request then add @ApiProperty() for all api response
24: create api for aculator health check for livenessprobe and readinessprobe
25: modify project using typeORM for insert update but keep raw sql for select data then config default teller db
26: add user role column at user table then create script alter column  then modify code and curl for call all api at scripts/curls.sh
27: create logout api for user then modify code and curl for call all api at scripts/curls.sh
28: modify login and logout api check duplicate login ( can login 1 device only)
29: modify accounts api for get list all or search by account_id and branch_code and account_type and page
30: create edit account api (post method )for update account_name and account_type and currency_code and account_name and status and version and closed_at then modify code and curl for call all api at scripts/curls.sh
31: add role to user table then create script alter column  then modify code and curl for call all api at scripts/curls.sh

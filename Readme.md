docker-compose -f docker-compose-db.yml up -d

docker-compose -f docker-compose-redis.yml up -d

create teller db

ืnpm run migration:up

npm run start:dev

http://localhost:8000/api/docs


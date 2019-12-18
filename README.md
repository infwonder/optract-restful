## TESTs ##

### Docker server ###

docker run -d --rm -p 8080:8080 infwonder/optract-restful:latest

### curl tests ###

#### articles (AID list)
curl localhost:8080/articles

#### article cache dump ####
curl localhost:8080/article/cache

#### article one AID ###
curl localhost:8080/article/__aid__

#### Eth status ####
curl localhost:8080/status

#### Post PoC ####
curl localhost:8080/tx/__address__/vote -X POST -H "Content-Type: application/json" -d '{"test": "txdata"}'

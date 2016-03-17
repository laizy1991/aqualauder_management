AquaLauder Management
===============
### ENVIRONMENT

* JDK 7+
* Tomcat 7+
* Mysql 5+

### HOW TO DEPLOY
###### 数据源配置
```
db.url=jdbc:mysql://host/db?useUnicode=true&characterEncoding=utf8  
db.driver=com.mysql.jdbc.Driver
db.user=****
db.pass=****
```
###### 打包部署
````
#git clone ${URL}
# play run aqualauder_management
or
# play war aqualauder_management -o ./aqualauder_management.war --zip
# mv aqualauder_management.war ${webServerWorkingDirectory}
````

AquaLauder Management
===============
### ENVIRONMENT

* JDK 7+
* Tomcat 7+
* Mysql 5+

### HOW TO DEPLOY
###### 初始化数据库

* 
* 

###### 打包安装

````
# clone当前项目地址
git clone ${URL}
````

###### 调整日志
log4j.properties

````
#DEBUG/INFO/WARN/ERROR，调整后无需重启，即时生效
log4j.logger.com.asiainfo=DEBUG

#调整应用日志文件绝对路径
log4j.appender.logfile.File=${TOMCAT_HOME}/logs/TokenServer.log
````

###### 数据源配置


###### 应用配置

###### 部署
package org.camunda.cockpit.plugin.statistics.test.query;

import javax.sql.DataSource;

import org.camunda.cockpit.plugin.statistics.test.util.AbstractDBQueryTest;

import com.mysql.jdbc.jdbc2.optional.MysqlDataSource;

public class MySQLQueryTest extends AbstractDBQueryTest {
  
  public MySQLQueryTest() {
    super();
  }

  @Override
  public String getDatabaseIdentifier() {
    return "mysql";
  }

  @Override
  public DataSource getDataSource() {
    
    MysqlDataSource mysqlDataSource = new MysqlDataSource();
    mysqlDataSource.setUser(this.testProperties.getProperty("mysql.username"));
    mysqlDataSource.setPassword(this.testProperties.getProperty("mysql.password"));
    mysqlDataSource.setServerName(this.testProperties.getProperty("mysql.servername"));
    mysqlDataSource.setPort(Integer.parseInt(this.testProperties.getProperty("mysql.port")));
    mysqlDataSource.setDatabaseName(this.testProperties.getProperty("mysql.db"));
    
    return mysqlDataSource;
    
  }

}

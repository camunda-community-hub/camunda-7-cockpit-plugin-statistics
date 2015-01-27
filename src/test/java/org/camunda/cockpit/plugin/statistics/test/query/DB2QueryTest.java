package org.camunda.cockpit.plugin.statistics.test.query;

import javax.sql.DataSource;

import org.camunda.cockpit.plugin.statistics.test.util.AbstractDBQueryTest;

import com.ibm.db2.jcc.DB2SimpleDataSource;

public class DB2QueryTest extends AbstractDBQueryTest {
  
  public DB2QueryTest() {
    super();
  }

  @Override
  public String getDatabaseIdentifier() {
    return "db2";
  }

  @Override
  public DataSource getDataSource() {
    
    DB2SimpleDataSource db2Datasource = new com.ibm.db2.jcc.DB2SimpleDataSource();
    db2Datasource.setServerName(this.testProperties.getProperty("db2.servername"));
    db2Datasource.setPortNumber(Integer.parseInt(this.testProperties.getProperty("db2.port")));
    db2Datasource.setDatabaseName(this.testProperties.getProperty("db2.db"));
    db2Datasource.setUser(this.testProperties.getProperty("db2.username"));
    db2Datasource.setPassword(this.testProperties.getProperty("db2.password"));
    
    return db2Datasource;
    
  }

}

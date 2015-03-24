package org.camunda.cockpit.plugin.statistics.test.query;

import javax.sql.DataSource;

import org.camunda.cockpit.plugin.statistics.test.util.AbstractDBQueryTest;
import org.junit.Ignore;

import com.microsoft.sqlserver.jdbc.SQLServerDataSource;

public class MSSQLQueryTest extends AbstractDBQueryTest {

  @Override
  public String getDatabaseIdentifier() {
    return "mssql"; 
  }

  @Override
  public DataSource getDataSource() {
    SQLServerDataSource sqlServerDataSource = new SQLServerDataSource();
    sqlServerDataSource.setUser(this.testProperties.getProperty("mssql.username"));
    sqlServerDataSource.setPassword(this.testProperties.getProperty("mssql.password"));
    sqlServerDataSource.setServerName(this.testProperties.getProperty("mssql.server"));
    sqlServerDataSource.setDatabaseName(this.testProperties.getProperty("mssql.database"));
    sqlServerDataSource.setSelectMethod(this.testProperties.getProperty("mssql.selectMethod"));
    return sqlServerDataSource;
  }

}

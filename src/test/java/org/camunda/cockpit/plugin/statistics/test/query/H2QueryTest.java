package org.camunda.cockpit.plugin.statistics.test.query;

import javax.sql.DataSource;

import org.camunda.cockpit.plugin.statistics.test.util.AbstractDBQueryTest;
import org.h2.jdbcx.JdbcDataSource;

public class H2QueryTest extends AbstractDBQueryTest {
  
  public H2QueryTest() {
    super();
  }

  @Override
  public String getDatabaseIdentifier() {
    return "h2";
  }

  @Override
  public DataSource getDataSource() {
    JdbcDataSource h2DataSource = new JdbcDataSource();
    String h2ConnectionUrl = this.testProperties.getProperty("h2.url");
    h2DataSource.setURL(h2ConnectionUrl);
    h2DataSource.setUser(this.testProperties.getProperty("h2.username"));
    h2DataSource.setPassword(this.testProperties.getProperty("h2.password"));
    return h2DataSource;
  }


}

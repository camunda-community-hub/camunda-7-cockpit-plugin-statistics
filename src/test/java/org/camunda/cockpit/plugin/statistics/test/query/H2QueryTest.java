package org.camunda.cockpit.plugin.statistics.test.query;

import javax.sql.DataSource;

import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.camunda.bpm.cockpit.Cockpit;
import org.camunda.bpm.cockpit.plugin.test.AbstractCockpitPluginTest;
import org.camunda.bpm.engine.impl.interceptor.Command;
import org.camunda.bpm.engine.impl.interceptor.CommandContext;
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
    String h2ConnectionUrl = "jdbc:h2:mem:camunda;DB_CLOSE_DELAY=1000";
    h2DataSource.setURL(h2ConnectionUrl);
    h2DataSource.setUser("sa");
    h2DataSource.setPassword("");
    return h2DataSource;
  }


}

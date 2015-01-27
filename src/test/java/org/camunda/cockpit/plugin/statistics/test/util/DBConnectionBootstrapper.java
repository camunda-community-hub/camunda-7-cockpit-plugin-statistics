package org.camunda.cockpit.plugin.statistics.test.util;

import javax.sql.DataSource;

public interface DBConnectionBootstrapper {

  public String getDatabaseIdentifier();
  public DataSource getDataSource();

}

package org.camunda.cockpit.plugin.statistics.test;

import org.camunda.cockpit.plugin.statistics.test.query.DB2QueryTest;
import org.camunda.cockpit.plugin.statistics.test.query.H2QueryTest;
import org.camunda.cockpit.plugin.statistics.test.query.MSSQLQueryTest;
import org.camunda.cockpit.plugin.statistics.test.query.MySQLQueryTest;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

/*
 * Depending on your running databases add or remove classes from the test suite
 */
@RunWith(Suite.class)
@SuiteClasses({DB2QueryTest.class, MySQLQueryTest.class, H2QueryTest.class, MSSQLQueryTest.class, StatisticsPluginTest.class})
public class StatisticsPluginTestSuite {

}

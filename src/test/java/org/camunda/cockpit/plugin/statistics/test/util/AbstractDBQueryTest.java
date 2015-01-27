package org.camunda.cockpit.plugin.statistics.test.util;

import java.io.IOException;
import java.io.Reader;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.mapping.Environment;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.apache.ibatis.transaction.jdbc.JdbcTransactionFactory;
import org.camunda.bpm.cockpit.plugin.test.AbstractCockpitPluginTest;
import org.camunda.bpm.engine.impl.db.ListQueryParameterObject;
import org.camunda.cockpit.plugin.statistics.test.StatisticsPluginTest;
import org.junit.Test;

public abstract class AbstractDBQueryTest extends AbstractCockpitPluginTest implements GeneralStatisticsPluginQueries, DBConnectionBootstrapper {
  
  protected SqlSessionFactory testSqlSessionFactory;
  protected Environment testDBEnvironment;
  protected JdbcTransactionFactory testTransactionFactory;
  protected Properties testProperties;
  protected SqlSession sqlSession;
  
  protected AbstractDBQueryTest() {
    
    try {
      //read my-batis config and create sql session factory
      Reader reader = Resources.getResourceAsReader("mybatis-config.xml");
      this.testSqlSessionFactory = new SqlSessionFactoryBuilder().build(reader);
      
      //read properties
      this.testProperties = new Properties();
      this.testProperties.load(StatisticsPluginTest.class.getResourceAsStream("/testdbs.properties"));
      
      //get transaction factory
      this.testTransactionFactory = new JdbcTransactionFactory();
      
      
      //initialize Environment
      this.testDBEnvironment = new Environment(getDatabaseIdentifier(), this.testTransactionFactory, getDataSource());
      this.testSqlSessionFactory.getConfiguration().setEnvironment(this.testDBEnvironment);
      this.testSqlSessionFactory.getConfiguration().setDatabaseId(getDatabaseIdentifier());
      
      this.sqlSession = getSession();
      
    } catch (IOException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }

  }
  
  protected SqlSession getSession() {
    return testSqlSessionFactory.openSession();
  }

  protected ListQueryParameterObject getSimpleListQueryParameterObject(Object parameter) {
    return new ListQueryParameterObject(parameter, 0, 2147483647);
  }
  
  protected ListQueryParameterObject getMapListQueryParameterObject(String key, String value) {
    Map<String, String> paramMap = new HashMap<String, String>();
    paramMap.put(key, value);
    return new ListQueryParameterObject(paramMap, 0, 2147483647);
  }
  
  /*
   * activity related queries
   */
  
  //order by proc def key
  @Test
  public void testQueryActivityInstanceCountOByProcDef() {
    sqlSession.selectList("cockpit.statistics.selectActivityInstanceCountsByProcessDefinition");
  }
  
  //filter by proc def key
  @Test
  public void testQueryActivityInstanceCountFByProcDef() {
    sqlSession.selectList("cockpit.statistics.selectActivityInstanceCountsByProcessDefinition", getSimpleListQueryParameterObject("test"));
  }
  
  //single historic activities
  @Test
  public void testQueryHistoricActivityInstances() {
    sqlSession.selectList("cockpit.statistics.selectHistoricActivityInformationWithProcDefKey", getSimpleListQueryParameterObject("test"));
  }
  
  /*
   * user task related queries
   */
  
  //ended user tasks count by process definition
  
  @Test
  public void testQueryEndedUserTasksByProcDef() {
    sqlSession.selectList("cockpit.statistics.selectHistoricUserTasksCountByProcDefKey");
  }
  
  //ended user tasks count by task definition and name
  
  @Test
  public void testQueryEndedUserTasksByTaskDefName() {
    sqlSession.selectList("cockpit.statistics.selectHistoricUserTasksCountByTaskDefAndName");
  }
  
  //single ended user tasks with name, start and end date
  
  @Test
  public void testQueryEndedUserTasksNameStartEnd() {
    sqlSession.selectList("cockpit.statistics.selectHistoricUserTaskTimeSpec");
  }
  
  //select running user tasks grouped by taskname filtered by Proc def key, no filter
  
  @Test
  public void testQueryRunningUserTaskCountGroupedByTaskNameFilteredByProcDefKey() {
    sqlSession.selectList("cockpit.statistics.selectRunningUserTaskCountGroupedByTaskNameFilteredByProcDefKey");
  }
  
  //select running user tasks grouped by taskname filtered by Proc def key
  @Test
  public void testQueryRunningUserTaskCountGroupedByTaskNameFilteredByProcDefKeyWithParam() {
    sqlSession.selectList("cockpit.statistics.selectRunningUserTaskCountGroupedByTaskNameFilteredByProcDefKey", getSimpleListQueryParameterObject("test"));
  }
  
  //running user tasks aggregated count by proc def key
  
  @Test
  public void testQueryRunningUserTasksCountByProcDefKey() {
    sqlSession.selectList("cockpit.statistics.selectRunningUserTasksCountByProcDefKey");
  }
  
  //single running user tasks with name and date
  
  @Test
  public void testQueryRunningUserTaskTimeSpec() {
    sqlSession.selectList("cockpit.statistics.selectRunningUserTasksCountByProcDefKey");
  }
  
  /*
   * process related queries
   */
  
  //single process instances with start and end time and proc def key
  
  @Test
  public void testQueryProcessInstanceStartEnd() {
    sqlSession.selectList("cockpit.statistics.selectProcessInstancesStartEnd");
  }
  
  //single process instances with start and end time and duration filtered by proc def key(s)
  
  @Test
  public void testQueryProcessInstanceStartEndDurByProcDefKey() {
    sqlSession.selectList("cockpit.statistics.selectDurationOfTheChosenProcesses",getMapListQueryParameterObject("procDefKey","test"));
  }
  
  //aggregated process instance incidents by proc def key
  
  @Test
  public void testQueryIncidentsPerProcDefKey() {
    sqlSession.selectList("cockpit.statistics.selectIncidentCountsByProcessDefinition");
  }
  
  //aggregated process definitions that have finished instances
  
  @Test
  public void testQueryProcDefsWithFinishedInstances() {
    sqlSession.selectList("cockpit.statistics.selectProcessesWithFinishedInstances");
  }
  
  //aggregated process definition informations (durations, count) by key and version
  
  @Test
  public void testQueryProcDefInformationByKeyAndVersion() {
    sqlSession.selectList("cockpit.statistics.selectProcessInstanceVersionCountsByProcessDefinition");
  }


}

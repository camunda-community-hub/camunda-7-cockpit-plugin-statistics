package com.novatec.camunda.webapp.statistics.test;

import java.io.IOException;
import java.io.Reader;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.mapping.Environment;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.apache.ibatis.transaction.TransactionFactory;
import org.apache.ibatis.transaction.jdbc.JdbcTransactionFactory;
import org.camunda.bpm.cockpit.Cockpit;
import org.camunda.bpm.cockpit.plugin.spi.CockpitPlugin;
import org.camunda.bpm.cockpit.plugin.test.AbstractCockpitPluginTest;
import org.camunda.bpm.engine.ProcessEngineConfiguration;
import org.camunda.bpm.engine.ProcessEngines;
import org.camunda.bpm.engine.impl.db.ListQueryParameterObject;
import org.camunda.bpm.engine.impl.interceptor.Command;
import org.camunda.bpm.engine.impl.interceptor.CommandContext;
import org.camunda.cockpit.plugin.statistics.StatisticsPlugin;
import org.h2.jdbcx.JdbcDataSource;
import org.h2.tools.RunScript;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import com.ibm.db2.jcc.DB2SimpleDataSource;
import com.mysql.jdbc.authentication.MysqlClearPasswordPlugin;
import com.mysql.jdbc.jdbc2.optional.MysqlDataSource;



public class StatisticsPluginTest extends AbstractCockpitPluginTest {

    SqlSessionFactory testSqlSessionFactory;
    Environment db2Environment;
    Environment mysqlEnvironment;
    Environment h2Environment;
  
    @Before
    public void init() {
      
      try {
        
        
        
        //read my-batis config and create sql session factory
        String resource = "mybatis-config.xml";
        Reader reader = Resources.getResourceAsReader(resource);
        testSqlSessionFactory = new SqlSessionFactoryBuilder().build(reader);
      
        //standard for all databases
        TransactionFactory jdbcTransactionFactory = new JdbcTransactionFactory();
        
        
        /*
         * initialize Environments:
         * DB2
         * MySQL
         * H2
         */
        
        Properties props = new Properties(); 
        props.load(StatisticsPluginTest.class.getResourceAsStream("/testdbs.properties"));
        
        DB2SimpleDataSource db2Datasource = new com.ibm.db2.jcc.DB2SimpleDataSource();
        db2Datasource.setServerName(props.getProperty("db2.servername"));
        db2Datasource.setPortNumber(Integer.parseInt(props.getProperty("db2.port")));
        db2Datasource.setDatabaseName(props.getProperty("db2.db"));
        db2Datasource.setUser(props.getProperty("db2.username"));
        db2Datasource.setPassword(props.getProperty("db2.password"));
        db2Environment = new Environment("db2", jdbcTransactionFactory, db2Datasource);
        
        MysqlDataSource mysqlDataSource = new MysqlDataSource();
        mysqlDataSource.setUser(props.getProperty("mysql.username"));
        mysqlDataSource.setPassword(props.getProperty("mysql.password"));
        mysqlDataSource.setServerName(props.getProperty("mysql.servername"));
        mysqlDataSource.setPort(Integer.parseInt(props.getProperty("mysql.port")));
        mysqlDataSource.setDatabaseName(props.getProperty("mysql.db"));
        mysqlEnvironment = new Environment("mysql", jdbcTransactionFactory, mysqlDataSource);
        
        JdbcDataSource h2DataSource = new JdbcDataSource();
        String h2ConnectionUrl = "jdbc:h2:mem;DB_CLOSE_DELAY=-1;MVCC=TRUE;DB_CLOSE_ON_EXIT=TRUE;";//INIT=RUNSCRIPT FROM 'classpath:h2_engine_7.1.0-Final.sql'";
        h2DataSource.setURL(h2ConnectionUrl);
        h2DataSource.setUser("sa");
        h2DataSource.setPassword("sa");
        h2Environment = new Environment("h2", jdbcTransactionFactory, h2DataSource);
        
        
      } catch (IOException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
      }
      
    }
    
    @After
    public void cleanUp() {
      try {
        h2Environment.getDataSource().getConnection().createStatement().execute("DROP ALL OBJECTS DELETE FILES;");
      } catch (SQLException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
      }
    }
      
    
    private SqlSession getDB2Session() {
      testSqlSessionFactory.getConfiguration().setEnvironment(db2Environment);
      testSqlSessionFactory.getConfiguration().setDatabaseId("db2");
      return testSqlSessionFactory.openSession();
    }
    
    private SqlSession getMySqlSession() {
      testSqlSessionFactory.getConfiguration().setEnvironment(mysqlEnvironment);
      testSqlSessionFactory.getConfiguration().setDatabaseId("mysql");
      return testSqlSessionFactory.openSession();
    }
    
    /*
     * get new h2 session from camunda context
     */
    private SqlSession getH2Session() {
      
      SqlSessionFactory factory =  Cockpit.getCommandExecutor("default").executeCommand(new Command<SqlSessionFactory>() {

        @Override
        public SqlSessionFactory execute(CommandContext commandContext) {
          return commandContext.getDbSqlSession().getDbSqlSessionFactory().getSqlSessionFactory();
        }
      });
      
      return factory.openSession();
      
    }
    
    private ListQueryParameterObject getSimpleListQueryParameterObject(Object parameter) {
      return new ListQueryParameterObject(parameter, 0, 2147483647);
    }
    
    private ListQueryParameterObject getMapListQueryParameterObject(String key, String value) {
      Map<String, String> paramMap = new HashMap<String, String>();
      paramMap.put(key, value);
      return new ListQueryParameterObject(paramMap, 0, 2147483647);
    }
  
    @Test
    public void testPluginDiscovery() {
        CockpitPlugin thisPlugin = Cockpit.getRuntimeDelegate().getAppPluginRegistry().getPlugin(StatisticsPlugin.ID);
        Assert.assertNotNull(thisPlugin);
    }

    /*
     * activity related queries
     */
    
    //order by proc def key
    @Test
    public void testQueryActivityInstanceCountOByProcDefDB2() {
      getDB2Session().selectList("cockpit.statistics.selectActivityInstanceCountsByProcessDefinition");
    }
    
    @Test
    public void testQueryActivityInstanceCountOByProcDefMYSQL() {
      getMySqlSession().selectList("cockpit.statistics.selectActivityInstanceCountsByProcessDefinition");
    }
    
    @Test
    public void testQueryActivityInstanceCountOByProcDefH2() {
      getH2Session().selectList("cockpit.statistics.selectActivityInstanceCountsByProcessDefinition");
    }
    
    //filter by proc def key
    @Test
    public void testQueryActivityInstanceCountFByProcDefDB2() {
      getDB2Session().selectList("cockpit.statistics.selectActivityInstanceCountsByProcessDefinition", getSimpleListQueryParameterObject("test"));
    }
    
    @Test
    public void testQueryActivityInstanceCountFByProcDefMYSQL() {
      getMySqlSession().selectList("cockpit.statistics.selectActivityInstanceCountsByProcessDefinition", getSimpleListQueryParameterObject("test"));
    }
    
    @Test
    public void testQueryActivityInstanceCountFByProcDefH2() {
      getH2Session().selectList("cockpit.statistics.selectActivityInstanceCountsByProcessDefinition", getSimpleListQueryParameterObject("test"));
    }
    
    //single historic activities
    @Test
    public void testQueryHistoricActivityInstancesDB2() {
      getDB2Session().selectList("cockpit.statistics.selectHistoricActivityInformationWithProcDefKey", getSimpleListQueryParameterObject("test"));
    }
    
    @Test
    public void testQueryHistoricActivityInstancesMYSQL() {
      getMySqlSession().selectList("cockpit.statistics.selectHistoricActivityInformationWithProcDefKey", getSimpleListQueryParameterObject("test"));
    }
    
    @Test
    public void testQueryHistoricActivityInstancesH2() {
      getH2Session().selectList("cockpit.statistics.selectHistoricActivityInformationWithProcDefKey", getSimpleListQueryParameterObject("test"));
    }
    
    /*
     * user task related queries
     */
    
    //ended user tasks count by process definition
    
    @Test
    public void testQueryEndedUserTasksByProcDefDB2() {
      getDB2Session().selectList("cockpit.statistics.selectHistoricUserTasksCountByProcDefKey");
    }
    
    @Test
    public void testQueryEndedUserTasksByProcDefMYSQL() {
      getMySqlSession().selectList("cockpit.statistics.selectHistoricUserTasksCountByProcDefKey");
    }
    
    @Test
    public void testQueryEndedUserTasksByProcDefH2() {
      getH2Session().selectList("cockpit.statistics.selectHistoricUserTasksCountByProcDefKey");
    }
    
    //ended user tasks count by task definition and name
    
    @Test
    public void testQueryEndedUserTasksByTaskDefNameDB2() {
      getDB2Session().selectList("cockpit.statistics.selectHistoricUserTasksCountByTaskDefAndName");
    }
    
    @Test
    public void testQueryEndedUserTasksByTaskDefNameMYSQL() {
      getMySqlSession().selectList("cockpit.statistics.selectHistoricUserTasksCountByTaskDefAndName");
    }
    
    @Test
    public void testQueryEndedUserTasksByTaskDefNameH2() {
      getH2Session().selectList("cockpit.statistics.selectHistoricUserTasksCountByTaskDefAndName");
    }
    
    //single ended user tasks with name, start and end date
    
    @Test
    public void testQueryEndedUserTasksNameStartEndDB2() {
      getDB2Session().selectList("cockpit.statistics.selectHistoricUserTaskTimeSpec");
    }
    
    @Test
    public void testQueryEndedUserTasksNameStartEndMYSQL() {
      getMySqlSession().selectList("cockpit.statistics.selectHistoricUserTaskTimeSpec");
    }
    
    @Test
    public void testQueryEndedUserTasksNameStartEndH2() {
      getH2Session().selectList("cockpit.statistics.selectHistoricUserTaskTimeSpec");
    }
    
    //select running user tasks grouped by taskname filtered by Proc def key
    
    @Test
    public void testQueryRunningUserTaskCountGroupedByTaskNameFilteredByProcDefKeyDB2() {
      getDB2Session().selectList("cockpit.statistics.selectRunningUserTaskCountGroupedByTaskNameFilteredByProcDefKey");
    }
    
    @Test
    public void testQueryRunningUserTaskCountGroupedByTaskNameFilteredByProcDefKeyDB2P() {
      getDB2Session().selectList("cockpit.statistics.selectRunningUserTaskCountGroupedByTaskNameFilteredByProcDefKey", getSimpleListQueryParameterObject("test"));
    }
    
    @Test
    public void testQueryRunningUserTaskCountGroupedByTaskNameFilteredByProcDefKeyMYSQL() {
      getMySqlSession().selectList("cockpit.statistics.selectRunningUserTaskCountGroupedByTaskNameFilteredByProcDefKey");
    }
    
    @Test
    public void testQueryRunningUserTaskCountGroupedByTaskNameFilteredByProcDefKeyMYSQLP() {
      getMySqlSession().selectList("cockpit.statistics.selectRunningUserTaskCountGroupedByTaskNameFilteredByProcDefKey", getSimpleListQueryParameterObject("test"));
    }
    
    @Test
    public void testQueryRunningUserTaskCountGroupedByTaskNameFilteredByProcDefKeyH2() {
      getH2Session().selectList("cockpit.statistics.selectRunningUserTaskCountGroupedByTaskNameFilteredByProcDefKey");
    }
    
    @Test
    public void testQueryRunningUserTaskCountGroupedByTaskNameFilteredByProcDefKeyH2P() {
      getH2Session().selectList("cockpit.statistics.selectRunningUserTaskCountGroupedByTaskNameFilteredByProcDefKey", getSimpleListQueryParameterObject("test"));
    }
    
    //running user tasks aggregated count by proc def key
    
    @Test
    public void testQueryRunningUserTasksCountByProcDefKeyDB2() {
      getDB2Session().selectList("cockpit.statistics.selectRunningUserTasksCountByProcDefKey");
    }
    
    @Test
    public void testQueryRunningUserTasksCountByProcDefKeyMYSQL() {
      getMySqlSession().selectList("cockpit.statistics.selectRunningUserTasksCountByProcDefKey");
    }
    
    @Test
    public void testQueryRunningUserTasksCountByProcDefKeyH2() {
      getH2Session().selectList("cockpit.statistics.selectRunningUserTasksCountByProcDefKey");
    }
    
    //single running user tasks with name and date
    
    @Test
    public void testQueryRunningUserTaskTimeSpecDB2() {
      getDB2Session().selectList("cockpit.statistics.selectRunningUserTasksCountByProcDefKey");
    }
    
    @Test
    public void testQueryRunningUserTaskTimeSpecMYSQL() {
      getMySqlSession().selectList("cockpit.statistics.selectRunningUserTasksCountByProcDefKey");
    }
    
    @Test
    public void testQueryRunningUserTaskTimeSpecH2() {
      getH2Session().selectList("cockpit.statistics.selectRunningUserTasksCountByProcDefKey");
    }
    
    /*
     * process related queries
     */
    
    //single process instances with start and end time and proc def key
    
    @Test
    public void testQueryProcessInstanceStartEndDB2() {
      getDB2Session().selectList("cockpit.statistics.selectProcessInstancesStartEnd");
    }
    
    @Test
    public void testQueryProcessInstanceStartEndMYSQL() {
      getMySqlSession().selectList("cockpit.statistics.selectProcessInstancesStartEnd");
    }
    
    @Test
    public void testQueryProcessInstanceStartEndH2() {
      getH2Session().selectList("cockpit.statistics.selectProcessInstancesStartEnd");
    }
    
    
    //single process instances with start and end time and duration filtered by proc def key(s)
    
    @Test
    public void testQueryProcessInstanceStartEndDurByProcDefKeyDB2() {
      getDB2Session().selectList("cockpit.statistics.selectDurationOfTheChosenProcesses",getMapListQueryParameterObject("procDefKey","test"));
    }
    
    @Test
    public void testQueryProcessInstanceStartEndDurByProcDefKeyMYSQL() {
      getMySqlSession().selectList("cockpit.statistics.selectDurationOfTheChosenProcesses",getMapListQueryParameterObject("procDefKey","test"));
    }
    
    @Test
    public void testQueryProcessInstanceStartEndDurByProcDefKeyH2() {
      getH2Session().selectList("cockpit.statistics.selectDurationOfTheChosenProcesses",getMapListQueryParameterObject("procDefKey","test"));
    }
    
    //aggregated process instance incidents by proc def key
    
    @Test
    public void testQueryIncidentsPerProcDefKeyDB2() {
      getDB2Session().selectList("cockpit.statistics.selectIncidentCountsByProcessDefinition");
    }
    
    @Test
    public void testQueryIncidentsPerProcDefKeyMYSQL() {
      getMySqlSession().selectList("cockpit.statistics.selectIncidentCountsByProcessDefinition");
    }
    
    @Test
    public void testQueryIncidentsPerProcDefKeyH2() {
      getH2Session().selectList("cockpit.statistics.selectIncidentCountsByProcessDefinition");
    }

    //aggregated process definitions that have finished instances
    
    @Test
    public void testQueryProcDefsWithFinishedInstancesDB2() {
      getDB2Session().selectList("cockpit.statistics.selectProcessesWithFinishedInstances");
    }
    
    @Test
    public void testQueryProcDefsWithFinishedInstancesMYSQL() {
      getMySqlSession().selectList("cockpit.statistics.selectProcessesWithFinishedInstances");
    }
    
    @Test
    public void testQueryProcDefsWithFinishedInstancesH2() {
      getH2Session().selectList("cockpit.statistics.selectProcessesWithFinishedInstances");
    }
    
    //aggregated process definition informations (durations, count) by key and version
    
    @Test
    public void testQueryProcDefInformationByKeyAndVersionDB2() {
      getDB2Session().selectList("cockpit.statistics.selectProcessInstanceVersionCountsByProcessDefinition");
    }
    
    @Test
    public void testQueryProcDefInformationByKeyAndVersionMYSQL() {
      getMySqlSession().selectList("cockpit.statistics.selectProcessInstanceVersionCountsByProcessDefinition");
    }
    
    @Test
    public void testQueryProcDefInformationByKeyAndVersionH2() {
      getH2Session().selectList("cockpit.statistics.selectProcessInstanceVersionCountsByProcessDefinition");
    }
       
    
    
}


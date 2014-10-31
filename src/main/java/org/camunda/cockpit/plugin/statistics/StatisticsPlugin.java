package org.camunda.cockpit.plugin.statistics;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.camunda.bpm.cockpit.plugin.spi.impl.AbstractCockpitPlugin;
import org.camunda.cockpit.plugin.statistics.resources.StatisticsPluginRootResource;

/**
 * Statistics Plugin
 *
 * @author EH, EKL, ...
 */
public class StatisticsPlugin extends AbstractCockpitPlugin {

    public static final String ID = "statistics-plugin";

    public String getId() {
        return ID;
    }

    /**
     * {@inheritDoc }
     *
     * @return
     */
    @Override
    public Set<Class<?>> getResourceClasses() {
        Set<Class<?>> classes = new HashSet<Class<?>>();

        classes.add(StatisticsPluginRootResource.class);

        return classes;
    }

    /**
     * {@inheritDoc }
     *
     * @return
     */
    @Override
    public List<String> getMappingFiles() {
        List<String> mappingFiles = new ArrayList<String>();
        
        //add all activity related mapping files
        mappingFiles.addAll(getActivityRelatedMappingFiles());
        
        //add all process instance related mapping files
        mappingFiles.addAll(getProcessInstanceRelatedMappingFiles());
        
        //add all user task related mapping files
        mappingFiles.addAll(getUserTaskRelatedMappingFiles());
        
        //add other mapping files
        mappingFiles.addAll(getOtherMappingFiles());
        
        return mappingFiles;
    }
    
    private List<String> getOtherMappingFiles() {
      List<String> getOtherMappingFiles = new ArrayList<String>();

      //variable sizes
      getOtherMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/other/variablesSize.xml");
      return getOtherMappingFiles;
    }
    
    private List<String> getActivityRelatedMappingFiles() {
      List<String> activityRelatedMappingFiles = new ArrayList<String>();
      
      activityRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/activity/activityInstances.xml");
      activityRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/activity/activityInstancesFilterByProcDefKey.xml");
      activityRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/activity/historicActivityInformation.xml");
      
      return activityRelatedMappingFiles;
    }
    
    private List<String> getProcessInstanceRelatedMappingFiles() {
      List<String> procinstRelatedMappingFiles = new ArrayList<String>();
      
      procinstRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/process/processInstanceCountByState.xml");
      procinstRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/process/processInstanceVersions.xml");
      procinstRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/process/runningProcessInstancesOByProcDefKey.xml");
      procinstRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/process/processesWithFinishedInstances.xml");
      procinstRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/process/processInstanceStartEnd.xml");
      procinstRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/process/processInstancesWithIncidentCount.xml");
      procinstRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/process/durationsOfChosenProcess.xml");
      return procinstRelatedMappingFiles;
    }
    
    private List<String> getUserTaskRelatedMappingFiles() {
      List<String> usertaskRelatedMappingFiles = new ArrayList<String>();
      
      usertaskRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/usertask/historicUserTasks.xml");
      usertaskRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/usertask/runningUserTasksCountByProcDef.xml");
      usertaskRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/usertask/endedUserTasksCountByProcDef.xml");
      usertaskRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/usertask/runningUserTasksTimeSpec.xml");
      usertaskRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/usertask/historicUserTasksTimeSpec.xml");
      usertaskRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/usertask/historicUserTasksTimeSpecFilterByProcDefKey.xml");
      usertaskRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/usertask/historicUserTasksTimeSpecFilterByProcDefKeyAndTimeSpec.xml");
      
      return usertaskRelatedMappingFiles;
    }
    
}

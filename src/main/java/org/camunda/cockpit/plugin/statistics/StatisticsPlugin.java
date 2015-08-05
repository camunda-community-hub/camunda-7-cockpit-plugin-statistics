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

      //variable sizes -> if needed
      //getOtherMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/other/variablesSize.xml");
      
      //common mapping content
      getOtherMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/common/commonQueryParts.xml");
      return getOtherMappingFiles;
    }
    
    private List<String> getActivityRelatedMappingFiles() {
      List<String> activityRelatedMappingFiles = new ArrayList<String>();
      activityRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/activity/singleActivities.xml");
      activityRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/activity/aggregatedActivities.xml");
      return activityRelatedMappingFiles;
    }
    
    private List<String> getProcessInstanceRelatedMappingFiles() {
      List<String> procinstRelatedMappingFiles = new ArrayList<String>();
      
      procinstRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/process/aggregatedProcessInstances.xml");
      return procinstRelatedMappingFiles;
    }
    
    private List<String> getUserTaskRelatedMappingFiles() {
      List<String> usertaskRelatedMappingFiles = new ArrayList<String>();
      
      usertaskRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/usertask/singleUserTasks.xml");
      usertaskRelatedMappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/usertask/aggregatedUserTasks.xml");
      return usertaskRelatedMappingFiles;
    }
    
}

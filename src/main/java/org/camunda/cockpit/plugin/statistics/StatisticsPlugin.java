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
        mappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/processInstanceCountByState.xml");
        mappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/processInstanceVersions.xml");
        mappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/activityInstances.xml");
        mappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/historicUserTasks.xml");
        mappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/variablesSize.xml");
        mappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/incidentCount.xml");
        mappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/durations.xml");
        mappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/processesWithFinishedInstances.xml");
        mappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/processInstanceStartEnd.xml");
        mappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/runningUserTasksCountByProcDef.xml");
        mappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/endedUserTasksCountByProcDef.xml");
        mappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/runningUserTasksTimeSpec.xml");
        mappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/historicUserTasksTimeSpec.xml");
        mappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/runningProcessInstancesOByProcDefKey.xml");
        mappingFiles.add("org/camunda/cockpit/plugin/statistics/queries/historicActivityInformation.xml");
        return mappingFiles;
    }
}

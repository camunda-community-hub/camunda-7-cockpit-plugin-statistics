package org.camunda.cockpit.plugin.statistics.resources;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import javax.ws.rs.GET;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.bpm.engine.history.HistoricTaskInstance;

/**
 * This class provides data for all existing user tasks. They have to be
 * selected with a time selection and will be sorted by time.
 *
 * @author EH
 */
public class AllTaskInstanceResourceIG extends AbstractCockpitPluginResource {

    private String time;
    private String processDefinition;

    public AllTaskInstanceResourceIG(String engineName,String time , String processDefinition) {
        super(engineName);
        this.time = time;
        this.processDefinition = processDefinition;
    }

    /**
     * Builds up the data for historic tasks.
     *
     * @return The historic task instances in orderby the start time
     */
    @GET
    public List<HistoricTaskInstance> getAllTaskInstances() {
        List<HistoricTaskInstance> taskInstances = null;
        if (processDefinition == null || processDefinition.isEmpty() || processDefinition.equalsIgnoreCase("")) {
            taskInstances = getProcessEngine()
                    .getHistoryService()
                    .createHistoricTaskInstanceQuery()
                    .orderByProcessDefinitionId()
                    .orderByTaskDefinitionKey()
                    .desc()
                    .list();
        } else {
            taskInstances = getProcessEngine()
                    .getHistoryService()
                    .createHistoricTaskInstanceQuery()
                    .processDefinitionId(processDefinition)
                    .orderByProcessDefinitionId()
                    .orderByTaskDefinitionKey()
                    .desc()
                    .list();
        }
        
        return taskInstances;
    }

}

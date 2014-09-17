package org.camunda.cockpit.plugin.statistics.resources;

import java.util.Date;
import java.util.List;
import javax.ws.rs.GET;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.bpm.engine.history.HistoricActivityInstance;

/**
 * This class provides data for all existing activities. They have to be
 * selected with a time selection and will be sorted by time.
 *
 * @author EH
 */
public class AllActivityInstanceResource extends AbstractCockpitPluginResource {

    private Date start;
    private Date end;
    private String processDefinition;

    public AllActivityInstanceResource(String engineName, Date start, Date end, String processDefinition) {
        super(engineName);
        this.start = start;
        this.end = end;
        this.processDefinition = processDefinition;
    }

    /**
     * Method for quering the database information on activity instances.
     *
     * @return A {@link HistoricActivityInstance} sorted and selected by
     * StartTime
     */
    @GET
    public List<HistoricActivityInstance> getAllActivityInstances() {
        if ( processDefinition == null || processDefinition.isEmpty() || processDefinition.equalsIgnoreCase("")) {
            return getProcessEngine()
                    .getHistoryService()
                    .createHistoricActivityInstanceQuery()
                    .startedAfter(start)
                    .startedBefore(end)
                    .orderByHistoricActivityInstanceStartTime()
                    .desc()
                    .list();
        } else {
            return getProcessEngine()
                    .getHistoryService()
                    .createHistoricActivityInstanceQuery()
                    .processDefinitionId(processDefinition)
                    .startedAfter(start)
                    .startedBefore(end)
                    .orderByHistoricActivityInstanceStartTime()
                    .desc()
                    .list();
        }
    }

}

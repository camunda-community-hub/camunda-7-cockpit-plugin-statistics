package org.camunda.cockpit.plugin.statistics.resources;

import java.util.Date;
import java.util.List;
import javax.ws.rs.GET;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.bpm.engine.history.HistoricProcessInstance;

/**
 * This class provides data for all existing process instances. They have to be
 * selected with a time selection and will be sorted by time.
 *
 * @author EH
 */
public class AllProcessInstanceResource extends AbstractCockpitPluginResource {

    private Date start;
    private Date end;

    public AllProcessInstanceResource(String engineName, Date start, Date end) {
        super(engineName);
        this.start = start;
        this.end = end;
    }

    /**
     * Method for quering the database information on process instances.
     *
     * @return A {@link HistoricProcessInstance} sorted and selected by
     * StartTime
     */
    @GET
    public List<HistoricProcessInstance> getAllProcessInstances() {
        List<HistoricProcessInstance> processInstances = getProcessEngine()
                .getHistoryService()
                .createHistoricProcessInstanceQuery()
                .startedAfter(start)
                .startedBefore(end)
                .orderByProcessDefinitionId()
                .desc()
                .list();
        return processInstances;
    }

}

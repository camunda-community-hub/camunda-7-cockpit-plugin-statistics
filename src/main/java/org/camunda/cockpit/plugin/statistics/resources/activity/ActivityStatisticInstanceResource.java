package org.camunda.cockpit.plugin.statistics.resources.activity;

import java.util.List;
import javax.ws.rs.GET;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.bpm.engine.history.HistoricActivityStatistics;

/**
 * This class provides statistics of a selected process instance. You have to
 * provide an id of the process instance.
 *
 * @author EH
 */
public class ActivityStatisticInstanceResource extends AbstractCockpitPluginResource {

    private String processInstance;
    private int firstResult;
    private int maxResults;

    public ActivityStatisticInstanceResource(String engineName, String processInstance, int firstResult, int maxResults) {
        super(engineName);
        this.processInstance = processInstance;
        this.firstResult = firstResult;
        this.maxResults = maxResults;
    }

    /**
     * This method generates data with the needed class params.
     *
     * @return
     */
    @GET
    public List<HistoricActivityStatistics> getActivityInstanceCounts() {
        if (maxResults == 0) {
            return getProcessEngine()
                    .getHistoryService()
                    .createHistoricActivityStatisticsQuery(processInstance)
                    .includeCanceled()
                    .includeFinished()
                    .includeCompleteScope()
                    .orderByActivityId()
                    .desc()
                    .list();
        } else {
            return getProcessEngine()
                    .getHistoryService()
                    .createHistoricActivityStatisticsQuery(processInstance)
                    .includeCanceled()
                    .includeFinished()
                    .includeCompleteScope()
                    .orderByActivityId()
                    .desc()
                    .listPage(firstResult, maxResults);
        }
    }

}

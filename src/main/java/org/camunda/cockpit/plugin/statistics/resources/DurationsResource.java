package org.camunda.cockpit.plugin.statistics.resources;

import java.util.List;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.cockpit.plugin.statistics.db.DurationDto;

import java.util.ArrayList;

/**
 * Provides all duration information
 *
 * @author EH
 */
public class DurationsResource extends AbstractCockpitPluginResource {

    private List<String> processDefKeys;

    public DurationsResource(String engineName, List<String> processDefKeys) {
        super(engineName);
        this.processDefKeys = processDefKeys;
    }

    /**
     * This method gains the data for the duration. It filters the information
     * with the process def key
     *
     * @return
     */
    @GET
    public List<DurationDto> getDurations() {
        List<DurationDto> durationsList = getQueryService()
                .executeQuery("cockpit.statistics.selectDurationOfEachProcess", new QueryParameters<DurationDto>());
        List<DurationDto> backList = new ArrayList<DurationDto>();
        // return all 
        if (processDefKeys.isEmpty()) {
            backList = durationsList;
        } else {
            for (DurationDto duration : durationsList) {
                for (String processDefKey : processDefKeys) {
                    if (duration.getProcessDefinitionKey().equalsIgnoreCase(processDefKey)) {
                        backList.add(duration);
                    }
                }
            }
        }
        return backList;
    }

}

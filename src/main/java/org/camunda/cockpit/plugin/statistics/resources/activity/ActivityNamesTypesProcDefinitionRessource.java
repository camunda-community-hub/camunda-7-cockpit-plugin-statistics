package org.camunda.cockpit.plugin.statistics.resources.activity;

import java.util.List;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.cockpit.plugin.statistics.dto.activity.ActivityInstanceCountDto;

public class ActivityNamesTypesProcDefinitionRessource extends AbstractCockpitPluginResource {
	public ActivityNamesTypesProcDefinitionRessource(String engineName) {
		super(engineName);
    }
	
	/**
     * This method read the information of the defined mapping.xml file from
     * myBatis. {@link org.camunda.cockpit.plugin.statistics.queries.aggregatedActivities.xml}
     *
     * @return
     */
    @GET
    public List<ActivityInstanceCountDto> getActivityNamesTypesProcDefinition() {
    	
    	return getQueryService().executeQuery("cockpit.statistics.selectActivityNamesTypesProcessDefinition",
    	    new QueryParameters<ActivityInstanceCountDto>());
    	
    }

}

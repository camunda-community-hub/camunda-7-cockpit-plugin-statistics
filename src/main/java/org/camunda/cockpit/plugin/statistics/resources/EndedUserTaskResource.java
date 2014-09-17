package org.camunda.cockpit.plugin.statistics.resources;

import java.util.List;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.cockpit.plugin.statistics.db.EndedUserTaskDto;

public class EndedUserTaskResource extends AbstractCockpitPluginResource {
	
	public EndedUserTaskResource(String engineName) {
		super(engineName);
    }
	
    @GET
    public List<EndedUserTaskDto> getEndedUserTaskCounts() {
    	
    	return getQueryService().executeQuery("cockpit.statistics.selectEndedUserTasksCountByProcDefKey",
                new QueryParameters<EndedUserTaskDto>());
    	
    }

}


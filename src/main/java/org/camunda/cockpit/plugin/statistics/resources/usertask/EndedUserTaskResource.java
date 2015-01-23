package org.camunda.cockpit.plugin.statistics.resources.usertask;

import java.util.List;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.cockpit.plugin.statistics.dto.usertask.EndedUserTaskDto;

public class EndedUserTaskResource extends AbstractCockpitPluginResource {
	
	public EndedUserTaskResource(String engineName) {
		super(engineName);
    }
	
    @GET
    public List<EndedUserTaskDto> getEndedUserTaskCounts() {
    	
    	return getQueryService().executeQuery("cockpit.statistics.selectHistoricUserTasksCountByProcDefKey",
                new QueryParameters<EndedUserTaskDto>());
    	
    }

}


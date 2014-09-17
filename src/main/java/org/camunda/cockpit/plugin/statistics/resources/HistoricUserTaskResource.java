package org.camunda.cockpit.plugin.statistics.resources;

import java.util.List;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.cockpit.plugin.statistics.db.HistoricUserTaskDto;

/**
 * This class aggregate the user task information. The duration will be
 * calculated as average, maximum and minimum.
 *
 * @author EH
 */
public class HistoricUserTaskResource extends AbstractCockpitPluginResource {
	
	public HistoricUserTaskResource(String engineName) {
		super(engineName);
    }
	
    /**
     * This method read the information of the defined mapping.xml file from
     * myBatis. {@link com.novatec.camunda.webapp.statistics.queries.userTasks.xml}
     *
     * @return
     */
    @GET
    public List<HistoricUserTaskDto> getActivityInstanceCounts() {
    	
        return getQueryService().executeQuery("cockpit.statistics.selectHistoricUserTasksCount",
                new QueryParameters<HistoricUserTaskDto>());
    }

}

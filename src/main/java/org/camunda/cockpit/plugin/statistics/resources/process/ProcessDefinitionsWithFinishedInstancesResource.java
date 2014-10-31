package org.camunda.cockpit.plugin.statistics.resources.process;

import java.util.List;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.cockpit.plugin.statistics.dto.process.ProcessDefinitionsWithFinishedInstancesDto;

public class ProcessDefinitionsWithFinishedInstancesResource extends AbstractCockpitPluginResource {

    public ProcessDefinitionsWithFinishedInstancesResource(String engineName) {
        super(engineName);
    }

    @GET
    public List<ProcessDefinitionsWithFinishedInstancesDto> getKeys() {
        return getQueryService().executeQuery("cockpit.statistics.selectProcessesWithFinishedInstances",
                new QueryParameters<ProcessDefinitionsWithFinishedInstancesDto>());
    }

}

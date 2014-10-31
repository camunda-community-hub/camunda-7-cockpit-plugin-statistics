package org.camunda.cockpit.plugin.statistics.resources.process;

import java.util.List;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.cockpit.plugin.statistics.dto.process.ProcessInstanceDto;

/**
 *
 * @author IG
 */
public class ProcessInstanceStartEndResource extends AbstractCockpitPluginResource {

    public ProcessInstanceStartEndResource(String engineName) {
        super(engineName);
    }

    /**
     * @return
     */
    @GET
    public List<ProcessInstanceDto> getProcessInstanceStartEnds() {
        return getQueryService().executeQuery("cockpit.statistics.selectProcessInstancesStartEnd",
                new QueryParameters<ProcessInstanceDto>());

    }

}

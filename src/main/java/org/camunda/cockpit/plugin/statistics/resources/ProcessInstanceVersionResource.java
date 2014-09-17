package org.camunda.cockpit.plugin.statistics.resources;

import java.util.List;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.cockpit.plugin.statistics.db.ProcessInstanceVersionsCountDto;

/**
 * This class aggregate the process instance information. The duration will be
 * calculated as average, maximum and minimum.
 *
 * @author EH
 */
public class ProcessInstanceVersionResource extends AbstractCockpitPluginResource {

    public ProcessInstanceVersionResource(String engineName) {
        super(engineName);
    }

    /**
     * This method read the information of the defined mapping.xml file from
     * myBatis.
     * {@link org.camunda.cockpit.plugin.statistics.queries.processInstances.xml}
     *
     * @return
     */
    @GET
    public List<ProcessInstanceVersionsCountDto> getProcessInstanceCounts() {
        return getQueryService().executeQuery("cockpit.statistics.selectProcessInstanceVersionCountsByProcessDefinition",
                new QueryParameters<ProcessInstanceVersionsCountDto>());
    }

}

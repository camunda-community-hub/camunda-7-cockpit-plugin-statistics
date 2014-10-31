package org.camunda.cockpit.plugin.statistics.resources.process;

import java.util.List;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.bpm.engine.rest.dto.runtime.IncidentDto;

/**
 * This class aggregate the incident information of activities and show the
 * failed activities.
 *
 * @author EH
 */
public class IncidentResource extends AbstractCockpitPluginResource {

    public IncidentResource(String engineName) {
        super(engineName);
    }

    /**
     * This method read the information of the defined mapping.xml file from
     * myBatis.
     * {@link org.camunda.cockpit.plugin.statistics.queries.incidentCount.xml}
     *
     * @return
     */
    @GET
    public List<IncidentDto> getActivityInstanceCounts() {
        return getQueryService().executeQuery("cockpit.statistics.selectIncidentCountsByProcessDefinition",
                new QueryParameters<IncidentDto>());
    }

}

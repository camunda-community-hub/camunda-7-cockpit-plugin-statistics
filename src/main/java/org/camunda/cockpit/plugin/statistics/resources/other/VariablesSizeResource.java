package org.camunda.cockpit.plugin.statistics.resources.other;

import java.util.List;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.cockpit.plugin.statistics.dto.other.VariablesSizeDto;

/**
 * This class aggregate all variables sizes and calculate the average, maximum
 * and minimum.
 *
 * @author EH
 */
public class VariablesSizeResource extends AbstractCockpitPluginResource {

    public VariablesSizeResource(String engineName) {
        super(engineName);
    }

    /**
     * This method read the information of the defined mapping.xml file from
     * myBatis.
     * {@link org.camunda.cockpit.plugin.statistics.queries.variablesSize.xml}
     *
     * @return
     */
    @GET
    public List<VariablesSizeDto> getActivityInstanceCounts() {
        return getQueryService().executeQuery(
                "cockpit.statistics.selectVariblesSizes",
                new QueryParameters<VariablesSizeDto>());
    }

}

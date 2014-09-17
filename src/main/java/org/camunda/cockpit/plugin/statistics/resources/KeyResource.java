package org.camunda.cockpit.plugin.statistics.resources;

import java.util.List;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.cockpit.plugin.statistics.db.KeyDto;

public class KeyResource extends AbstractCockpitPluginResource {

    public KeyResource(String engineName) {
        super(engineName);
    }

    @GET
    public List<KeyDto> getKeys() {
        return getQueryService().executeQuery("cockpit.statistics.selectProcessesWithFinishedInstances",
                new QueryParameters<KeyDto>());
    }

}

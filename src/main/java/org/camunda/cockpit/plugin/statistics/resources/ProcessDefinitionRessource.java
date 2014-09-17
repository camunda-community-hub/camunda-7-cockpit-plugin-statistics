package org.camunda.cockpit.plugin.statistics.resources;

import java.util.List;
import javax.ws.rs.GET;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.bpm.engine.repository.ProcessDefinition;

/**
 * This class provides data for all existing process definitions. They have to be
 * selected with a time selection and will be sorted by time.
 *
 * @author EH
 */
public class ProcessDefinitionRessource extends AbstractCockpitPluginResource {


    /**
     * This is the constructor. Here you can set all preferences of the needed
     * data.
     *
     * @param engineName You have to set the engine name. Default value:
     * 'default'. (required)
     * @param firstResult Pagination start value. (required)
     * @param maxResults Your Page lenght can be defined. (required)
     * @param processDefinition Define a explicit process definition, then you
     * can get all versions. (optional, default='null')
     */
    public ProcessDefinitionRessource(String engineName) {
        super(engineName);
    }

    /**
     * Method for quering the database information on process definitions.
     *
     * @return A {@link ProcessDefinition} sorted and selected by StartTime
     */
    @GET
    public List<ProcessDefinition> getAllProcessDefinitions() {
            return getProcessEngine()
                    .getRepositoryService()
                    .createProcessDefinitionQuery()
                    .list();
            
    }

}

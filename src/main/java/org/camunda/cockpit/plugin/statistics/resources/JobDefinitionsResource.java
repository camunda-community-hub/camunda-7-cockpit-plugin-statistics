package org.camunda.cockpit.plugin.statistics.resources;

import java.util.List;

import javax.ws.rs.GET;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.bpm.engine.management.JobDefinition;

/**
 * This class shows the job definition informations.
 *
 * @author EH
 */
public class JobDefinitionsResource extends AbstractCockpitPluginResource {

    private int firstResult;
    private int maxResults;
    private String jobType;

    public JobDefinitionsResource(String engineName, int firstResult, int maxResults, String jobType) {
        super(engineName);
        this.firstResult = firstResult;
        this.maxResults = maxResults;
        this.jobType = jobType;
    }

    /**
     * Get the job definitions by limit and job type
     *
     * @return
     */
    @GET
    public List<JobDefinition> getActivityInstanceCounts() {
        if (jobType == null) {
            // Get all jobs
            return getProcessEngine()
                    .getManagementService()
                    .createJobDefinitionQuery()
                    .orderByJobDefinitionId()
                    .desc()
                    .listPage(firstResult, maxResults);
        } else {
            // Get jobs by type
            return getProcessEngine()
                    .getManagementService()
                    .createJobDefinitionQuery()
                    .jobType(jobType)
                    .orderByJobDefinitionId()
                    .desc()
                    .listPage(firstResult, maxResults);
        }
    }

}

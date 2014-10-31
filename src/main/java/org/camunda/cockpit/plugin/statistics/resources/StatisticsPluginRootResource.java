package org.camunda.cockpit.plugin.statistics.resources;

import java.util.List;

import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;

import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginRootResource;
import org.camunda.cockpit.plugin.statistics.StatisticsPlugin;
import org.camunda.cockpit.plugin.statistics.resources.activity.ActivityInstanceResource;
import org.camunda.cockpit.plugin.statistics.resources.activity.ActivityStatisticInstanceResource;
import org.camunda.cockpit.plugin.statistics.resources.activity.HistoricActivityInformationResource;
import org.camunda.cockpit.plugin.statistics.resources.other.JobDefinitionsResource;
import org.camunda.cockpit.plugin.statistics.resources.other.OpLogResource;
import org.camunda.cockpit.plugin.statistics.resources.other.VariablesDataResource;
import org.camunda.cockpit.plugin.statistics.resources.other.VariablesSizeResource;
import org.camunda.cockpit.plugin.statistics.resources.process.DurationsResource;
import org.camunda.cockpit.plugin.statistics.resources.process.IncidentResource;
import org.camunda.cockpit.plugin.statistics.resources.process.ProcessDefinitionRessource;
import org.camunda.cockpit.plugin.statistics.resources.process.ProcessDefinitionsWithFinishedInstancesResource;
import org.camunda.cockpit.plugin.statistics.resources.process.ProcessInstanceResource;
import org.camunda.cockpit.plugin.statistics.resources.process.ProcessInstanceStartEndResource;
import org.camunda.cockpit.plugin.statistics.resources.process.ProcessInstanceVersionResource;
import org.camunda.cockpit.plugin.statistics.resources.rServe.RserveResource;
import org.camunda.cockpit.plugin.statistics.resources.usertask.AllTaskInstanceResource;
import org.camunda.cockpit.plugin.statistics.resources.usertask.EndedUserTaskResource;
import org.camunda.cockpit.plugin.statistics.resources.usertask.HistoricUserTaskResource;
import org.camunda.cockpit.plugin.statistics.resources.usertask.RunningUserTaskResource;
import org.camunda.cockpit.plugin.statistics.util.UtilParser;

/**
 * This class provides the rest api for the statistics plugin
 *
 * @author EH, EKL, ..
 */
@Path("plugin/" + StatisticsPlugin.ID)
public class StatisticsPluginRootResource extends
        AbstractCockpitPluginRootResource {

    public StatisticsPluginRootResource(String pluginName) {
      super(pluginName);
    }

    public StatisticsPluginRootResource() {
      super(StatisticsPlugin.ID);
    }

    /**
     * This method provides aggregated process instance information.
     *
     * @param engineName Name the selectable engine.
     * @return
     */
    @Path("{engineName}/process-instance")
    public ProcessInstanceResource getProcessInstanceResource(
        @PathParam("engineName") String engineName,
        @QueryParam("procDefKey") String procDefKey) {
      return subResource(new ProcessInstanceResource(engineName, procDefKey), engineName);
    }

    /**
     * This method provides aggregated process instance information.
     *
     * @param engineName Name the selectable engine.
     * @return
     */
    @Path("{engineName}/process-instance-version")
    public ProcessInstanceVersionResource getProcessInstanceVersionResource(
        @PathParam("engineName") String engineName) {
      return subResource(new ProcessInstanceVersionResource(engineName), engineName);
    }


    /**
     * This method provides aggregated activity instance information.
     *
     * @param engineName Name the selectable engine.
     * @return
     */
    @Path("{engineName}/activity-instance")
    public ActivityInstanceResource getActivityInstanceResource(
            @PathParam("engineName") String engineName,
            @QueryParam("procDefKey") String procDefKey) {
        return subResource(new ActivityInstanceResource(engineName, procDefKey), engineName);
    }
    
    /**
     * This method provides information on historic activity instances. Currently name, type and duration
     *
     * @param engineName Name the selectable engine.
     * @return
     */
    @Path("{engineName}/historic-activity-information")
    public HistoricActivityInformationResource getHistoricActivityDurationsResource(
            @PathParam("engineName") String engineName,
            @QueryParam("procDefKey") String procDefKey,
            @QueryParam("activityName") String activityName,
            @QueryParam("activityType") String activityType) {
        return subResource(new HistoricActivityInformationResource(engineName, procDefKey,activityName,activityType), engineName);
    }

    /**
     * This method provides aggregated activity instance information.
     *
     * @param engineName Name the selectable engine.
     * @param processInstance Name the selectable process instance.
     * @param firstResult Define the first selectable item.
     * @param maxResults Define the count of results.
     * @return
     */
    @Path("{engineName}/activity-statistics")
    public ActivityStatisticInstanceResource getActivityInstanceResource(
            @PathParam("engineName") String engineName,
            @QueryParam("processInstance") String processInstance,
            @QueryParam("firstresult") int firstResult,
            @QueryParam("maxresults") int maxResults) {
        return subResource(new ActivityStatisticInstanceResource(engineName, processInstance, firstResult, maxResults), engineName);
    }


    /**
     * This method provides aggregated historic user task information.
     *
     * @param engineName Name the selectable engine.
     * @return
     */
    @Path("{engineName}/historic-user-tasks")
    public HistoricUserTaskResource getHistoricUserTaskResource(
            @PathParam("engineName") String engineName) {
        return subResource(new HistoricUserTaskResource(engineName), engineName);
    }
    
    /**
     * This method provides running user task information.
     *
     * @param engineName Name the selectable engine.
     * @return
     */
    @Path("{engineName}/running-user-tasks")
    public RunningUserTaskResource getRunningUserTaskResource(
            @PathParam("engineName") String engineName) {
        return subResource(new RunningUserTaskResource(engineName), engineName);
    }
    

    /**
     * This method provides ended user task information.
     *
     * @param engineName Name the selectable engine.
     * @return
     */
    @Path("{engineName}/ended-user-tasks")
    public EndedUserTaskResource getEndedUserTaskResource(
            @PathParam("engineName") String engineName) {
        return subResource(new EndedUserTaskResource(engineName), engineName);
    }
    
    /**
     * This method provides the user task instances with the selected Time.
     *
     * @param engineName Name the selectable engine.
     * @param processDefinitionKey Select your Process with the ID (optional)
     * @param start Define the start time: yyyy-MM-dd'T'HH:mm:ss (required)
     * @param end Define the end time: yyyy-MM-dd'T'HH:mm:ss (required)
     * @return
     *
     */
    @Path("{engineName}/all-user-tasks")
    public AllTaskInstanceResource getAllTaskInstanceResource(
            @PathParam("engineName") String engineName,
            @QueryParam("procDefKey") String procDefKey,
            @QueryParam("dateSpecifier") String dateSpecifier) {
        return subResource(new AllTaskInstanceResource(engineName, procDefKey, dateSpecifier), engineName);
    }
    

    /**
     * This method provides aggregated variable size information.
     *
     * @param engineName Name the selectable engine.
     * @return
     */
    @Path("{engineName}/variables-size")
    public VariablesSizeResource getVariablesSizeResource(
            @PathParam("engineName") String engineName) {
        return subResource(new VariablesSizeResource(engineName), engineName);
    }

    @Path("{engineName}/incidents")
    public IncidentResource getIncidentResource(
            @PathParam("engineName") String engineName) {
        return subResource(new IncidentResource(engineName), engineName);
    }

    /**
     * This method provides the operations log in a specific time.
     *
     * @param engineName Name the selectable engine.
     * @param start Define the start time: yyyy-MM-dd'T'HH:mm:ss
     * @param end Define the end time: yyyy-MM-dd'T'HH:mm:ss
     * @return
     */
    @Path("{engineName}/oplog")
    public OpLogResource getOpLogResource(
            @PathParam("engineName") String engineName,
            @QueryParam("startdate") String start,
            @QueryParam("enddate") String end) {
        return subResource(new OpLogResource(engineName, UtilParser.getDateFromString(start),
                UtilParser.getDateFromString(end)), engineName);
    }

    /**
     * This method provides job definition information.
     *
     * @param engineName Name the selectable engine.
     * @param jobType Name the selectable job type.
     * @param start Define the first selectable item.
     * @param end Define the count of results.
     * @return
     */
    @Path("{engineName}/job-definitions")
    public JobDefinitionsResource getJobDefinitionsResource(
            @PathParam("engineName") String engineName,
            @QueryParam("jobtype") String jobType,
            @QueryParam("firstresult") int start,
            @QueryParam("maxresults") int end) {
        return subResource(new JobDefinitionsResource(engineName, start, end, jobType), engineName);
    }

    /**
     * This method provides the durations. These can be selected by the process
     * definition keys. If you do not provide a process definition key. All
     * durations will be sent to client.
     *
     * @param engineName Name the selectable engine. (required)
     * @param processDefKeys Select your process definitions. (optional)
     * @return
     */
    @Path("{engineName}/durations")
    public DurationsResource getDurationsResource(
            @PathParam("engineName") String engineName,
            @QueryParam("processdefkey") List<String> processDefKeys) {
        return subResource(new DurationsResource(engineName, processDefKeys), engineName);
    }

    /**
     *
     * @param engineName Name the selectable engine. (required)
     * @return
     */
    @Path("{engineName}/keys")
    public ProcessDefinitionsWithFinishedInstancesResource getKeyResource(@PathParam("engineName") String engineName) {
        return subResource(new ProcessDefinitionsWithFinishedInstancesResource(engineName), engineName);
    }

    /**
     *
     * @param engineName Name the selectable engine. (required)
     * @return
     */
    @Path("{engineName}/rserve")
    public RserveResource getRserveResource(
    		@PathParam("engineName") String engineName, 
    	@QueryParam("processdefkey") List<String> processDefKeys) {
        return subResource(new RserveResource(engineName, processDefKeys), engineName);
    }

    /**
     * This method provides the business data.
     *
     * @param engineName Name the selectable engine. (required)
     * @param firstResult Define the first selectable item. (required)
     * @param maxResults Define the count of results. (required)
     * @param activityInstanceIdIn Select the data from a specific activity.
     * (optional)
     * @return
     */
    @Path("{engineName}/businessdata")
    public VariablesDataResource getBusinessDataResource(@PathParam("engineName") String engineName,
            @QueryParam("firstresult") int firstResult,
            @QueryParam("maxresults") int maxResults,
            @QueryParam("activityinstanceidin") String activityInstanceIdIn) {
        return subResource(new VariablesDataResource(engineName, firstResult, maxResults, activityInstanceIdIn), engineName);
    }

    /**
     *
     * @param engineName Name the selectable engine. (required)
     * @return
     */
    @Path("{engineName}/process-instance-start-end")
    public ProcessInstanceStartEndResource getProcessInstanceStartEndResource(@PathParam("engineName") String engineName) {
        return subResource(new ProcessInstanceStartEndResource(engineName), engineName);
    }
    
    /**
    *
    * @param engineName Name the selectable engine. (required)
    * @return
    */
   @Path("{engineName}/process-definitions")
   public ProcessDefinitionRessource getProcessDefinitions(@PathParam("engineName") String engineName) {
       return subResource(new ProcessDefinitionRessource(engineName), engineName);
   }
    
    
}

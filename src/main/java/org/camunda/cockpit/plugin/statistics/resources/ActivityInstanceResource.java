package org.camunda.cockpit.plugin.statistics.resources;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.cockpit.plugin.statistics.db.ActivityInstanceCountDto;

/**
 * This class provides statistic information of activities.
 *
 * @author EH
 */
public class ActivityInstanceResource extends AbstractCockpitPluginResource {
	
	private String procDefKey;

    public ActivityInstanceResource(String engineName, String procDefKey) {
    	super(engineName);
    	this.procDefKey = procDefKey;
    }

    /**
     * Database will be queried without any parameter.
     *
     * @return
     */
    @GET
    public List<ActivityInstanceCountDto> getActivityInstanceCounts() {
    	if(procDefKey==null || procDefKey.equals("undefined")) {
    		return getQueryService().executeQuery("cockpit.statistics.selectActivityInstanceCountsOByProcessDefinition",
                    new QueryParameters<ActivityInstanceCountDto>());
    	} else {
    		List<ActivityInstanceCountDto> results = new ArrayList<ActivityInstanceCountDto>();
    		List<ActivityInstanceCountDto> resultsFromQuery =getQueryService().executeQuery("cockpit.statistics.selectActivityInstanceCountsOByProcessDefinition",
                    new QueryParameters<ActivityInstanceCountDto>());
    		
    		for(ActivityInstanceCountDto actInstanceCountDto : resultsFromQuery) {
    			if(actInstanceCountDto.getProcDefKey().equals(procDefKey)) {
    				results.add(actInstanceCountDto);
    			}
    		}
    		
    		return results;
    		
    	}
        
    }

}

package org.camunda.cockpit.plugin.statistics.resources.activity;

import java.util.List;
import java.util.Map;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.bpm.engine.impl.interceptor.Command;
import org.camunda.bpm.engine.impl.interceptor.CommandContext;
import org.camunda.cockpit.plugin.statistics.dto.activity.ActivityInstanceCountDto;
import org.camunda.cockpit.plugin.statistics.util.StatisticsPluginConstants;

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
      
      final String mappingId = "cockpit.statistics.selectActivityInstanceCountsByProcessDefinition";
      
    	if(procDefKey==null || procDefKey.equals("undefined")) {
    		return getQueryService().executeQuery(mappingId,
                    new QueryParameters<ActivityInstanceCountDto>());
    	} else {
    	  
      	  //do query with parameters
          Command<List<ActivityInstanceCountDto>> command = new Command<List<ActivityInstanceCountDto>>() {
            @SuppressWarnings("unchecked")
            public List<ActivityInstanceCountDto> execute(CommandContext commandContext) {
                  
              return (List<ActivityInstanceCountDto>) commandContext.getDbSqlSession().selectList(mappingId, procDefKey);
              
            }
          };

          return getCommandExecutor().executeCommand(command);

    		
    	}
        
    }

}

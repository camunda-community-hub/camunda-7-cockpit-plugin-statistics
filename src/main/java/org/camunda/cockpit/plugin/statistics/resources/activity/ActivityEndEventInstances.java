package org.camunda.cockpit.plugin.statistics.resources.activity;

import java.util.List;
import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.bpm.engine.impl.db.ListQueryParameterObject;
import org.camunda.bpm.engine.impl.interceptor.Command;
import org.camunda.bpm.engine.impl.interceptor.CommandContext;
import org.camunda.cockpit.plugin.statistics.dto.activity.ActivityInstanceCountDto;

/**
 * This class provides statistic information of activities.
 *
 * @author bbb
 */
public class ActivityEndEventInstances extends AbstractCockpitPluginResource {
	
	private String procDefId;

    public ActivityEndEventInstances(String engineName, String procDefId) {
    	super(engineName);
    	this.procDefId = procDefId;
    }

    /**
     * Database will be queried without any parameter.
     *
     * @return
     */
    @GET
    public List<ActivityInstanceCountDto> getActivityEndEventInstanceCounts() {
      
      final String mappingId = "cockpit.statistics.selectEndEventsProcessDefinition";
    	if(procDefId==null || procDefId.equals("undefined")) {
    		return getQueryService().executeQuery(mappingId,
                    new QueryParameters<ActivityInstanceCountDto>());
    	} else {
    	  
      	  //do query with parameters
          Command<List<ActivityInstanceCountDto>> command = new Command<List<ActivityInstanceCountDto>>() {
            @SuppressWarnings("unchecked")
            public List<ActivityInstanceCountDto> execute(CommandContext commandContext) {
                  
              return (List<ActivityInstanceCountDto>) commandContext.getDbSqlSession().selectList(mappingId, new ListQueryParameterObject(procDefId, 0, 2147483647));
              
            }
          };

          return getCommandExecutor().executeCommand(command);

    		
    	}
        
    }

}

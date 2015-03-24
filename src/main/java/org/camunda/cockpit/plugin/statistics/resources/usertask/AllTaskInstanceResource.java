package org.camunda.cockpit.plugin.statistics.resources.usertask;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.bpm.engine.impl.db.ListQueryParameterObject;
import org.camunda.bpm.engine.impl.interceptor.Command;
import org.camunda.bpm.engine.impl.interceptor.CommandContext;
import org.camunda.cockpit.plugin.statistics.dto.usertask.UserTaskTimeSpecDto;

/**
 * This class provides data for all existing user tasks. They have to be
 * selected with a time selection and will be sorted by time.
 *
 * @author EH
 */
public class AllTaskInstanceResource extends AbstractCockpitPluginResource {

    private String dateSpecifier;
    private String processDefinitionKey;

    public AllTaskInstanceResource(String engineName, String processDefinitionKey, String dateSpecifier) {
        super(engineName);
        this.processDefinitionKey = processDefinitionKey;
        this.dateSpecifier = dateSpecifier;
    }

    /**
     * Builds up the data for historic tasks.
     *
     * @return The historic task instances in orderby the start time
     */
    @GET
    public List<UserTaskTimeSpecDto> getAllTaskInstances() {
        List<UserTaskTimeSpecDto> taskInstances = new ArrayList<UserTaskTimeSpecDto>();
        
        String param ="";
        //allways needed
        List<UserTaskTimeSpecDto> historicResultsByQuery=getQueryService().executeQuery("cockpit.statistics.selectHistoricUserTaskTimeSpec",
                new QueryParameters<UserTaskTimeSpecDto>());

        Map<String, String> params = new HashMap<String, String>();
        
        if((processDefinitionKey==null || processDefinitionKey.equals("undefined")) && (dateSpecifier==null || dateSpecifier.equals("undefined"))) {
          
        	//no param set, return all
          params.put("procDefSpec", "");
          params.put("timeSpec", "");
          return getCommandExecutor().executeCommand(getParameterizedQueryCommandWithParamsMap("selectHistoricUserTaskTimeSpec", param));

        } else if(dateSpecifier==null || dateSpecifier.equals("undefined")) {

        	//only date spec missing, do query with filter!

          params.put("procDefSpec", "WHERE def.KEY_ = \'"+processDefinitionKey+"\'");
          params.put("timeSpec", "");
          param = " WHERE def.KEY_ = \'"+processDefinitionKey+"\'";
          return getCommandExecutor().executeCommand(getParameterizedQueryCommandWithParamsMap("selectHistoricUserTaskTimeSpec", param));

        } else {
        
	          if(dateSpecifier.equals("endTime")) {
	            
	            
	            
  	        	if(processDefinitionKey!=null && !processDefinitionKey.equals("undefined")) {

                params.put("procDefSpec", "WHERE def.KEY_ = \'"+processDefinitionKey+"\'");
                params.put("timeSpec", "AND END_TIME_ IS NOT NULL");
                param = " WHERE def.KEY_ = \'"+processDefinitionKey+"\' AND END_TIME_ IS NOT NULL";
                return getCommandExecutor().executeCommand(getParameterizedQueryCommandWithParamsMap("selectHistoricUserTaskTimeSpec", param));
                
  	        	} else {
  	        	  params.put("procDefSpec", "");
  	        	  params.put("timeSpec", "WHERE END_TIME_ IS NOT NULL");
  	        	  param = " WHERE END_TIME_ IS NOT NULL";
                return getCommandExecutor().executeCommand(getParameterizedQueryCommandWithParamsMap("selectHistoricUserTaskTimeSpec", param));
  	        	}
	
	          } else if(dateSpecifier.equals("startTime")) {

	            
	            
	            if(processDefinitionKey!=null && !processDefinitionKey.equals("undefined")) {
                //do Filter, if proc definition is set
                params.put("procDefSpec", "WHERE def.KEY_ = \'"+processDefinitionKey+"\'");
                params.put("timeSpec", "AND START_TIME_ IS NOT NULL");
                param = " WHERE def.KEY_ = \'"+processDefinitionKey+"\' AND START_TIME_ IS NOT NULL";
                return getCommandExecutor().executeCommand(getParameterizedQueryCommandWithParamsMap("selectHistoricUserTaskTimeSpec", param));
                
              } else {
                
                params.put("procDefSpec", "");
                params.put("timeSpec", "WHERE START_TIME_ IS NOT NULL");
                param =" WHERE START_TIME_ IS NOT NULL";
                return getCommandExecutor().executeCommand(getParameterizedQueryCommandWithParamsMap("selectHistoricUserTaskTimeSpec", param));
                
              }
	        	} 

	        }
        
        return taskInstances;
    }

    
    private Command<List<UserTaskTimeSpecDto>> getParameterizedQueryCommandWithParamsMap(final String queryId, final String param) {
      

      //do query with parameters to filter
      Command<List<UserTaskTimeSpecDto>> command = new Command<List<UserTaskTimeSpecDto>>() {
        @SuppressWarnings("unchecked")
        public List<UserTaskTimeSpecDto> execute(CommandContext commandContext) {
           List<UserTaskTimeSpecDto> results = (List<UserTaskTimeSpecDto>) commandContext.getDbSqlSession().selectList("cockpit.statistics."+queryId, new ListQueryParameterObject(param, 0, 2147483647));
           return results;
        }
      };
      
      return command;
    }

}

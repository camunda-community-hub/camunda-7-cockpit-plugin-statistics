package org.camunda.cockpit.plugin.statistics.resources;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.cockpit.plugin.statistics.db.UserTaskTimeSpecDto;

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
        
        //allways needed
    	List<UserTaskTimeSpecDto> historicResultsByQuery=getQueryService().executeQuery("cockpit.statistics.selectHistoricUserTaskTimeSpec",
                new QueryParameters<UserTaskTimeSpecDto>());
        
        if((processDefinitionKey==null || processDefinitionKey.equals("undefined")) && (dateSpecifier==null || dateSpecifier.equals("undefined"))) {
        	//no param set, return all
        	
        	return historicResultsByQuery;

        } else if(dateSpecifier==null || dateSpecifier.equals("undefined")) {

        	//only date spec missing
        	
      		//do Filter
  	    	for(UserTaskTimeSpecDto timeSpecDto: historicResultsByQuery) {
  	    		if(timeSpecDto.getProcDefKey().equals(processDefinitionKey)) {
  	    			taskInstances.add(timeSpecDto);
  	    		}
  	    	}
        } else {
        
	          if(dateSpecifier.equals("endTime")) {

  	        	if(processDefinitionKey!=null && !processDefinitionKey.equals("undefined")) {
  	        		//do Filter, if proc definition is set
    			    	for(UserTaskTimeSpecDto timeSpecDto: historicResultsByQuery) {
    			    		if(timeSpecDto.getProcDefKey().equals(processDefinitionKey)) {
    			    			taskInstances.add(timeSpecDto);
    			    		}
    			    	}
  	        	} else {
  	        		//only all old user tasks
  	        		taskInstances.addAll(historicResultsByQuery);
  	        	}
	
	          } else if(dateSpecifier.equals("startTime")) {

		        	
	        		//do Filter, if proc definition is set
		        	for(UserTaskTimeSpecDto timeSpecDto: historicResultsByQuery) {
		        		if(timeSpecDto.getProcDefKey().equals(processDefinitionKey)) {
		        			taskInstances.add(timeSpecDto);
		        		}
		        	}
	        	} else {
	        		//no proc definition is set -> take all
	        		return historicResultsByQuery;
	        	}

	        }
        
        return taskInstances;
    }

}

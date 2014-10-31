package org.camunda.cockpit.plugin.statistics.resources.process;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.cockpit.plugin.statistics.dto.process.ProcessInstanceCountDto;
import org.camunda.cockpit.plugin.statistics.dto.process.RunningProcessInstanceDto;

/**
 * This class aggregate the process instance information. The duration will be
 * calculated as average, maximum and minimum.
 *
 * @author EH
 */
public class ProcessInstanceResource extends AbstractCockpitPluginResource {
	
	private String procDefKey;

    public ProcessInstanceResource(String engineName, String procDefKey) {
        super(engineName);
        this.procDefKey = procDefKey;
    }

    /**
     * This method read the information of the defined mapping.xml file from
     * myBatis.
     * {@link org.camunda.cockpit.plugin.statistics.queries.processInstances.xml}
     *
     * @return
     */
    @GET
    public List<ProcessInstanceCountDto> getProcessInstanceCounts() {
    	
      List<ProcessInstanceCountDto> resultsByQuery =  getQueryService().executeQuery("cockpit.statistics.selectProcessInstanceCountsByProcessDefinition",
          new QueryParameters<ProcessInstanceCountDto>());
      List<RunningProcessInstanceDto> runningInstanceInformation = getQueryService().executeQuery("cockpit.statistics.selectRunningProcessInstancesCountOByProcDefKey",
          new QueryParameters<RunningProcessInstanceDto>());
      
    	if(procDefKey==null || procDefKey.equals("undefined")) {
    	  
   	  
    	  for(ProcessInstanceCountDto resultInQuery:resultsByQuery) {
    	    for(RunningProcessInstanceDto runningProcInstanceDto:runningInstanceInformation) {
    	      if(runningProcInstanceDto.getProcDefKey().equals(resultInQuery.getProcessDefinitionKey())) {
    	        resultInQuery.setRunningInstanceCount(runningProcInstanceDto.getCount());
    	      }
    	    }
    	  }
    	  
    		return resultsByQuery;
    	} else {
    	  
    		List<ProcessInstanceCountDto> results = new ArrayList<ProcessInstanceCountDto>();
    		
    		for(ProcessInstanceCountDto procInstDto:resultsByQuery) {
    			if(procInstDto.getProcessDefinitionKey().equals(procDefKey)) {
            for(RunningProcessInstanceDto runningProcInstanceDto:runningInstanceInformation) {
              if(runningProcInstanceDto.getProcDefKey().equals(procDefKey)) {
                procInstDto.setRunningInstanceCount(runningProcInstanceDto.getCount());
              }
            }
            results.add(procInstDto);
    			}
    		}
    		
    		return results;
    	}
        
    }

}

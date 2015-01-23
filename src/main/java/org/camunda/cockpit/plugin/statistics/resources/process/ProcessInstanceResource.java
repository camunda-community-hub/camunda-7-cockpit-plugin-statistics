package org.camunda.cockpit.plugin.statistics.resources.process;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.GET;

import org.apache.ibatis.executor.ReuseExecutor;
import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.cockpit.plugin.statistics.dto.process.ProcessDefinitionsWithFinishedInstancesDto;
import org.camunda.cockpit.plugin.statistics.dto.process.ProcessInstanceCountDto;
import org.camunda.cockpit.plugin.statistics.dto.process.ProcessInstanceVersionsCountDto;
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
      
      List<ProcessInstanceVersionsCountDto> queryResults = getQueryService().executeQuery("cockpit.statistics.selectProcessInstanceVersionCountsByProcessDefinition",
          new QueryParameters<ProcessInstanceVersionsCountDto>());

      List<ProcessInstanceCountDto> results = new ArrayList<ProcessInstanceCountDto>();
      
      String currentPdKey = "";
      int runningInstanceCount = 0;
      int endedInstanceCount = 0;
      int failedInstanceCount = 0;
      
      
      for(int i=0; i<queryResults.size(); i++) {
        
        ProcessInstanceVersionsCountDto countDto = queryResults.get(i);
        
        if(procDefKey==null || procDefKey.equals("undefined")) {
      
          if(countDto.getRunningInstanceCount()>0) {
  
            if(i==0) {
              currentPdKey = countDto.getProcessDefinitionKey(); 
            }
        
            if(!countDto.getProcessDefinitionKey().equals(currentPdKey)) {
              
              ProcessInstanceCountDto resultToAdd = new ProcessInstanceCountDto();
              resultToAdd.setRunningInstanceCount(runningInstanceCount);
              resultToAdd.setEndedInstanceCount(endedInstanceCount);
              resultToAdd.setFailedInstanceCount(failedInstanceCount);
              resultToAdd.setProcessDefinitionKey(currentPdKey);
              results.add(resultToAdd);
              
              currentPdKey = countDto.getProcessDefinitionKey();
              runningInstanceCount = 0;
              endedInstanceCount = 0;
              failedInstanceCount = 0;
              
            }
            
            runningInstanceCount += countDto.getRunningInstanceCount();
            failedInstanceCount += countDto.getFailedInstanceCount();
            endedInstanceCount += countDto.getEndedInstanceCount();
  
          }
        
        } else {
          if(countDto.getProcessDefinitionKey().equals(procDefKey)) {
            runningInstanceCount += countDto.getRunningInstanceCount();
            failedInstanceCount += countDto.getFailedInstanceCount();
            endedInstanceCount += countDto.getEndedInstanceCount();
          }
          if(i==(queryResults.size()-1)) {
            ProcessInstanceCountDto resultToAdd = new ProcessInstanceCountDto();
            resultToAdd.setRunningInstanceCount(runningInstanceCount);
            resultToAdd.setEndedInstanceCount(endedInstanceCount);
            resultToAdd.setFailedInstanceCount(failedInstanceCount);
            resultToAdd.setProcessDefinitionKey(procDefKey);
            results.add(resultToAdd);
          }
        }
      }
      
      return results;
    	
     
        
    }

}

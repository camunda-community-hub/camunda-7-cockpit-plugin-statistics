package org.camunda.cockpit.plugin.statistics.resources.process;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.cockpit.plugin.statistics.dto.process.ProcessDefinitionsWithFinishedInstancesDto;
import org.camunda.cockpit.plugin.statistics.dto.process.ProcessInstanceVersionsCountDto;

public class ProcessDefinitionsWithFinishedInstancesResource extends AbstractCockpitPluginResource {

    public ProcessDefinitionsWithFinishedInstancesResource(String engineName) {
        super(engineName);
    }

    @GET
    public List<ProcessDefinitionsWithFinishedInstancesDto> getKeys() {
      /*
       * use generic process instance query that gets running, ended and failed counts as well as some other aggregated values
       */
      
      List<ProcessInstanceVersionsCountDto> queryResults = getQueryService().executeQuery("cockpit.statistics.selectProcessInstanceVersionCountsByProcessDefinition",
                new QueryParameters<ProcessInstanceVersionsCountDto>());

      List<ProcessDefinitionsWithFinishedInstancesDto> results = new ArrayList<ProcessDefinitionsWithFinishedInstancesDto>();
      
      String currentPdKey = "";
      
      for(int i=0; i<queryResults.size(); i++) {
        ProcessInstanceVersionsCountDto countDto = queryResults.get(i);

        if(countDto.getRunningInstanceCount()>0) {
          if(i==0) {
            currentPdKey = countDto.getProcessDefinitionKey(); 
          }

          if(!countDto.getProcessDefinitionKey().equals(currentPdKey)) {
            results.add(new ProcessDefinitionsWithFinishedInstancesDto(currentPdKey));
            currentPdKey = countDto.getProcessDefinitionKey();
          } 
        }
      }
      
      return results;
       
    }

}

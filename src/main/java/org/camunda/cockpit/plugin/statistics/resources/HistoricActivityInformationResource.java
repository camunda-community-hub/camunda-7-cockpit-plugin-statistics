package org.camunda.cockpit.plugin.statistics.resources;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.cockpit.plugin.statistics.db.HistoricActivityInformationDto;

public class HistoricActivityInformationResource extends
    AbstractCockpitPluginResource {

  private String procDefKey;
  private String activityName;
  private String activityType;
  
  public HistoricActivityInformationResource(String engineName, String procDefKey, String activityName, String activityType) {
    super(engineName);
    this.procDefKey=procDefKey; 
    this.activityName = activityName;
    this.activityType = activityType;
  }
  
  /**
   * This method read the information of the defined mapping.xml file from
   * myBatis.
   *
   * @return
   */
  @GET
  public List<HistoricActivityInformationDto> getActivityInstanceCounts() {
    
    List<HistoricActivityInformationDto> resultsByQuery = getQueryService().executeQuery("cockpit.statistics.selectHistoricActivityInformationWithProcDefKey",
        new QueryParameters<HistoricActivityInformationDto>());
    
    if(!procDefKey.equals("undefined")) {
      
     List<HistoricActivityInformationDto> results = new ArrayList<HistoricActivityInformationDto>();
      
     for(HistoricActivityInformationDto hisActInfDto:resultsByQuery) {

       //sanitizing strings in case user did some weird stuff like \n ;) 
       
       hisActInfDto.setActivityName(hisActInfDto.getActivityName().replaceAll("[\u0000-\u001f]", ""));
       activityName=activityName.replaceAll("[\u0000-\u001f]", "");
       
       if(hisActInfDto.getProcDefKey().equals(procDefKey) && hisActInfDto.getActivityName().equals(activityName) && hisActInfDto.getType().equals(activityType)) {
         results.add(hisActInfDto);
       }
     }
     
     resultsByQuery = results;
    }
    
    return resultsByQuery;
      
  }

}

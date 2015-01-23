package org.camunda.cockpit.plugin.statistics.dto.common;

import java.util.Date;

public class CommonDatesDto {

  private Date startTime;
  private Date endTime;
  
  public Date getStartTime() {
    return startTime;
  }
  public void setStartTime(Date startTime) {
    this.startTime = startTime;
  }
  public Date getEndTime() {
    return endTime;
  }
  public void setEndTime(Date endTime) {
    this.endTime = endTime;
  }
    
}

package org.camunda.cockpit.plugin.statistics.dto.activity;

import java.util.Date;

public class HistoricActivityInformationDto {
  
  private String procDefKey;
  private int duration;
  private String type;
  private String activityName;
  private String id;
  private Date startTime;
  private Date endTime;
  
  public String getProcDefKey() {
    return procDefKey;
  }
  public void setProcDefKey(String procDefKey) {
    this.procDefKey = procDefKey;
  }
  public int getDuration() {
    return duration;
  }
  public void setDuration(int duration) {
    this.duration = duration;
  }
  public String getType() {
    return type;
  }
  public void setType(String type) {
    this.type = type;
  }
  public String getActivityName() {
    return activityName;
  }
  public void setActivityName(String activityName) {
    this.activityName = activityName;
  }
  public String getId() {
    return id;
  }
  public void setId(String id) {
    this.id = id;
  }
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

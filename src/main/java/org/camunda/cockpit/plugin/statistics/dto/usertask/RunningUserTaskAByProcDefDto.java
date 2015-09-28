package org.camunda.cockpit.plugin.statistics.dto.usertask;

public class RunningUserTaskAByProcDefDto {
  
  private int count;
  private int assigned;
  private String activityName;
  private String procDefKey;
  
  
  public int getCount() {
    return count;
  }
  public void setCount(int count) {
    this.count = count;
  }
  public int getAssigned() {
    return assigned;
  }
  public void setAssigned(int assigned) {
    this.assigned = assigned;
  }
 
  public String getActivityName() {
    return activityName;
  }
  public void setActivityName(String activityName) {
    this.activityName = activityName;
  }
  public String getProcDefKey() {
    return procDefKey;
  }
  public void setProcDefKey(String procDefKey) {
    this.procDefKey = procDefKey;
  }

}

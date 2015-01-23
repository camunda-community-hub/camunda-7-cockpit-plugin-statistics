package org.camunda.cockpit.plugin.statistics.dto.process;

import org.camunda.cockpit.plugin.statistics.dto.common.CommonDatesDto;

public class ProcessInstanceDurationDto extends CommonDatesDto{
  
	private String processDefinitionKey;
	private long duration;
	
	public long getDuration() {
    return duration;
  }
  public void setDuration(long duration) {
    this.duration = duration;
  }
  public String getProcessDefinitionKey() {
		return processDefinitionKey;
	}
	public void setProcessDefinitionKey(String processDefinitionKey) {
		this.processDefinitionKey = processDefinitionKey;
	}
	
}

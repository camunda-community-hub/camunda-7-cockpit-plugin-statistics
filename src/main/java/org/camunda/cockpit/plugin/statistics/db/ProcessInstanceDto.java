package org.camunda.cockpit.plugin.statistics.db;

import java.util.Date;

public class ProcessInstanceDto {
	private String processDefinitionKey;
	private Date startingTime;
	private Date endingTime;


	public String getKey() {
		return processDefinitionKey;
	}
	public void setKey(String key) {
		this.processDefinitionKey = key;
	}
	public Date getStartingTime() {
		return startingTime;
	}
	public void setStartingTime(Date startingTime) {
		this.startingTime = startingTime;
	}
	public Date getEndingTime() {
		return endingTime;
	}
	public void setEndingTime(Date endingTime) {
		this.endingTime = endingTime;
	}

}

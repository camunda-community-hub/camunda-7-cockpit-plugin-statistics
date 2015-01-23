package org.camunda.cockpit.plugin.statistics.dto.usertask;

import java.util.Date;

import org.camunda.cockpit.plugin.statistics.dto.common.CommonDatesDto;

public class UserTaskTimeSpecDto extends CommonDatesDto {
	
	private String userTaskName;
	private String procDefKey;
	private long duration;
	
	public long getDuration() {
		return duration;
	}
	public void setDuration(long duration) {
		this.duration = duration;
	}
	public String getUserTaskName() {
		return userTaskName;
	}
	public void setUserTaskName(String userTaskName) {
		this.userTaskName = userTaskName;
	}
	public String getProcDefKey() {
		return procDefKey;
	}
	public void setProcDefKey(String procDefKey) {
		this.procDefKey = procDefKey;
	}

}

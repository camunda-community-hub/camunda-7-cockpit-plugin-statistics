package org.camunda.cockpit.plugin.statistics.dto.usertask;

import java.util.Date;

public class UserTaskTimeSpecDto {
	
	private String userTaskName;
	private Date startDate;
	private Date endDate;
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
	public Date getStartDate() {
		return startDate;
	}
	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}
	public Date getEndDate() {
		return endDate;
	}
	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}
	public String getProcDefKey() {
		return procDefKey;
	}
	public void setProcDefKey(String procDefKey) {
		this.procDefKey = procDefKey;
	}

}

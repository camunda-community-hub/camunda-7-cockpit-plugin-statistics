package org.camunda.cockpit.plugin.statistics.dto.activity;

import org.camunda.cockpit.plugin.statistics.dto.common.CommonDatesDto;

public class HistoricActivityInformationDto extends CommonDatesDto {

	private String procDefKey;
	private long duration;
	private String type;
	private String activityName;
	private String id;
	private String assignee;

	public String getProcDefKey() {
		return procDefKey;
	}
	public void setProcDefKey(String procDefKey) {
		this.procDefKey = procDefKey;
	}
	public long getDuration() {
		return duration;
	}
	public void setDuration(long duration) {
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
	public String getAssignee() {
		return assignee;
	}
	public void setAssignee(String assignee) {
		this.assignee = assignee;
	}

}

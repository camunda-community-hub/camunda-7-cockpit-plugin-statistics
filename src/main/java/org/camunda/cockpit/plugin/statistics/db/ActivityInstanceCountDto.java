package org.camunda.cockpit.plugin.statistics.db;

public class ActivityInstanceCountDto {

	private String activityName;
	private long count;
	private long avgDuration;
	private long minDuration;
	private long maxDuration;
	private String type;
	private String procDefKey;
	

	public String getActivityName() {
		return activityName;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public void setActivityName(String activityName) {
		this.activityName = activityName;
	}

	public long getAvgDuration() {
		return avgDuration;
	}

	public void setAvgDuration(long avgDuration) {
		this.avgDuration = avgDuration;
	}

	public long getMinDuration() {
		return minDuration;
	}

	public void setMinDuration(long minDuration) {
		this.minDuration = minDuration;
	}

	public long getMaxDuration() {
		return maxDuration;
	}

	public void setMaxDuration(long maxDuration) {
		this.maxDuration = maxDuration;
	}

	public long getCount() {
		return count;
	}

	public void setCount(long count) {
		this.count = count;
	}

	public String getProcDefKey() {
		return procDefKey;
	}

	public void setProcDefKey(String procDefKey) {
		this.procDefKey = procDefKey;
	}

}

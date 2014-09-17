package org.camunda.cockpit.plugin.statistics.db;

public class HistoricUserTaskDto {

	private String taskKey;
	private String name;
	private int count;
	private long duration;
	private long min_duration;
	private long max_duration;

	public String getTaskKey() {
		return taskKey;
	}

	public void setTaskKey(String taskKey) {
		this.taskKey = taskKey;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public long getDuration() {
		return duration;
	}

	public void setDuration(long duration) {
		this.duration = duration;
	}

	public long getMin_duration() {
		return min_duration;
	}

	public void setMin_duration(long min_duration) {
		this.min_duration = min_duration;
	}

	public long getMax_duration() {
		return max_duration;
	}

	public void setMax_duration(long max_duration) {
		this.max_duration = max_duration;
	}

	public int getCount() {
		return count;
	}

	public void setCount(int count) {
		this.count = count;
	}

}

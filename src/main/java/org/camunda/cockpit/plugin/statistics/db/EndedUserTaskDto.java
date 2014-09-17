package org.camunda.cockpit.plugin.statistics.db;

public class EndedUserTaskDto {

	private int count;
	private String procDefKey;
	private long duration;
  private long minDuration;
	private long maxDuration;

	public int getCount() {
		return count;
	}

	public void setCount(int count) {
		this.count = count;
	}

	public String getProcDefKey() {
		return procDefKey;
	}

	public void setProcDefKey(String procDefKey) {
		this.procDefKey = procDefKey;
	}

	public long getMaxDuration() {
		return maxDuration;
	}

	public void setMaxDuration(long maxDuration) {
		this.maxDuration = maxDuration;
	}

	public long getMinDuration() {
		return minDuration;
	}

	public void setMinDuration(long minDuration) {
		this.minDuration = minDuration;
	}
	
	 public long getDuration() {
	    return duration;
	  }

	  public void setDuration(long duration) {
	    this.duration = duration;
	  }

}

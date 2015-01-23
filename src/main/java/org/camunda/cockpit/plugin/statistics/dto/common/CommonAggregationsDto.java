package org.camunda.cockpit.plugin.statistics.dto.common;

public class CommonAggregationsDto {
  
  private long avgDuration;
  private long minDuration;
  private long maxDuration;
  private long count;
  
  public long getCount() {
    return count;
  }
  public void setCount(long count) {
    this.count = count;
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

}

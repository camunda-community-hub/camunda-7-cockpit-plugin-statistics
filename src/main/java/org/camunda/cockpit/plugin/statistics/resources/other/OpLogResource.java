package org.camunda.cockpit.plugin.statistics.resources.other;

import java.util.List;
import javax.ws.rs.GET;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import java.util.Date;
import org.camunda.bpm.engine.history.UserOperationLogEntry;

/**
 * This class provides data for all existing operation logs. They have to be
 * selected with a time selection and will be sorted by time.
 *
 * @author EH
 */
public class OpLogResource extends AbstractCockpitPluginResource {

    private Date start;
    private Date end;

    public OpLogResource(String engineName, Date start, Date end) {
        super(engineName);
        this.start = start;
        this.end = end;
    }

    /**
     * This method get all operations data out of the database. It have to be
     * selected by time.
     *
     * @return
     */
    @GET
    public List<UserOperationLogEntry> getOpLogCounts() {
        return getProcessEngine()
                .getHistoryService()
                .createUserOperationLogQuery()
                .afterTimestamp(start)
                .beforeTimestamp(end)
                .orderByTimestamp()
                .desc()
                .list();
    }

}

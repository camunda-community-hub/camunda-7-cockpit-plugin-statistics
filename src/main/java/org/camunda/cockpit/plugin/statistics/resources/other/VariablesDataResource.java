package org.camunda.cockpit.plugin.statistics.resources.other;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.bpm.engine.history.HistoricProcessInstance;
import org.camunda.bpm.engine.impl.util.json.JSONObject;
import org.camunda.bpm.engine.runtime.VariableInstance;
import org.camunda.cockpit.plugin.statistics.util.BusinessData;

/**
 * This class provides data for all existing process instances. They have to be
 * selected with a time selection and will be sorted by time.
 *
 * @author EH
 */
public class VariablesDataResource extends AbstractCockpitPluginResource {

    private int firstResult;
    private int maxResults;
    private String activityInstanceIdIn;
    private static Set<Object> visited = new HashSet<Object>();

    public VariablesDataResource(String engineName, int firstResult, int maxResults, String activityInstanceIdIn) {
        super(engineName);
        this.firstResult = firstResult;
        this.maxResults = maxResults;
        this.activityInstanceIdIn = activityInstanceIdIn;
    }

    /**
     * Method for quering the database information on process instances.
     *
     * @return A {@link HistoricProcessInstance} sorted and selected by
     * StartTime
     */
    @GET
    public List<BusinessData> getAllProcessInstances() {
        List<VariableInstance> varInstances = null;
        if (activityInstanceIdIn == null) {
            varInstances = getProcessEngine()
                    .getRuntimeService()
                    .createVariableInstanceQuery()
                    .listPage(firstResult, maxResults);
        } else {
            varInstances = getProcessEngine()
                    .getRuntimeService()
                    .createVariableInstanceQuery()
                    .activityInstanceIdIn(activityInstanceIdIn)
                    .listPage(firstResult, maxResults);
        }
        List<BusinessData> bData = new ArrayList<BusinessData>();
        for (VariableInstance varInstance : varInstances) {
            StringBuilder sb = new StringBuilder();
            try {
                if (varInstance.getTypeName().equalsIgnoreCase("string")) {
                    sb.append(varInstance.getValue().toString());
                } else if (varInstance.getTypeName().equalsIgnoreCase("integer")) {
                    sb.append((Integer) varInstance.getValue());
                } else if (varInstance.getTypeName().equalsIgnoreCase("bytes")) {
                    ByteArrayOutputStream out = new ByteArrayOutputStream();
                    ObjectOutputStream os;
                    try {
                        os = new ObjectOutputStream(out);
                        os.writeObject(varInstance.getValue());
                        // generate a parseable jsonobject
                        sb.append(new String(out.toByteArray(), "UTF-8"));
                    } catch (IOException ex) {
                        Logger.getLogger(VariablesDataResource.class.getName()).log(Level.SEVERE, "Could not deserilize byte array.", ex);
                    }
                } else if (varInstance.getTypeName().equalsIgnoreCase("date")) {
                    sb.append((Date) varInstance.getValue());
                } else if (varInstance.getTypeName().equalsIgnoreCase("long")) {
                    sb.append((Long) varInstance.getValue());
                } else if (varInstance.getTypeName().equalsIgnoreCase("short")) {
                    sb.append((Short) varInstance.getValue());
                } else if (varInstance.getTypeName().equalsIgnoreCase("double")) {
                    sb.append((Double) varInstance.getValue());
                } else if (varInstance.getTypeName().equalsIgnoreCase("float")) {
                    sb.append((Float) varInstance.getValue());
                } else if (varInstance.getTypeName().equalsIgnoreCase("boolean")) {
                    sb.append((Boolean) varInstance.getValue());
                } else {
                    sb.append(new JSONObject(varInstance.getValue()));
                    //printFields(sb, varInstance);
                }
            } catch (NullPointerException npe) {
                sb.append("object is null");
            }
            String reflected = sb.toString();
            try {
                bData.add(new BusinessData(varInstance.getId(),
                        varInstance.getName(),
                        varInstance.getTypeName(),
                        reflected,
                        varInstance.getValue().toString(),
                        varInstance.getProcessInstanceId(),
                        varInstance.getExecutionId(),
                        varInstance.getTaskId(),
                        varInstance.getActivityInstanceId(),
                        varInstance.getErrorMessage()));
            } catch (NullPointerException npe) {
                // Nothing to handle, if an object is null, then you don't do anything
                //System.out.println("object was null ... ");
            }
        }
        return bData;
    }

    /**
     * This method print the fields of objects recursively. (Not used)
     *
     * @param sb {@link StringBuilder} is used to print into a String.
     * @param varInstance This object ({@link VariableInstance}) will be traced.
     */
    private void printFields(StringBuilder sb, VariableInstance varInstance) {
        sb.append(varInstance.getValue().getClass().getName());
        sb.append(": ");
        for (Field f : varInstance.getValue().getClass().getDeclaredFields()) {
            f.setAccessible(true);
            try {
                String type = f.getType().toString();

                if (type.contains("class")) {
                    if (visited.contains(f.get(varInstance.getValue()))) {
                        // necessary to prevent stack overflow
                        // value = "CYCLE DETECTED";
                        // System.out.println("CYCLE DETECTED");
                        // Do Nothing! A cycle should not be handeld, only ignored
                    } else {
                        // recursing deeper
                        visited.add(f.get(varInstance.getValue()));
                        sb.append("[");
                        printFields(sb, varInstance);
                        sb.append("]");
                    }
                } else {
                    sb.append("[");
                    sb.append(type);
                    sb.append(":");
                    sb.append(f.getName());
                    sb.append(":");
                    sb.append(f.get(varInstance.getValue()));
                    sb.append("], ");
                }
            } catch (IllegalArgumentException ex) {
                // Cannot be handled
            } catch (IllegalAccessException ex) {
                // Shouldn't happen see: f.setAccessible(true);
            }
        }
    }

}

package org.camunda.cockpit.plugin.statistics.resources;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.GET;

import org.camunda.bpm.cockpit.db.QueryParameters;
import org.camunda.bpm.cockpit.plugin.resource.AbstractCockpitPluginResource;
import org.camunda.cockpit.plugin.statistics.db.DurationDto;
import org.camunda.cockpit.plugin.statistics.db.RserveDto;
import org.rosuda.REngine.REXP;
import org.rosuda.REngine.REXPMismatchException;
import org.rosuda.REngine.Rserve.RConnection;
import org.rosuda.REngine.Rserve.RserveException;

public class RserveResource extends AbstractCockpitPluginResource {

    public RserveResource(String engineName) {
        super(engineName);
    }

    @GET
    public List<RserveDto> getRerveData() {

        //get the data we want to send to Rserve from Database
        List<DurationDto> data = getQueryService().executeQuery("cockpit.statistics.selectDurationOfEachProcess",
                new QueryParameters<DurationDto>());

        //connect to RServer
        double result = 0;
        try {
            RConnection c = new RConnection();
            System.out.println("Connection established");

            REXP rx = c.eval("x<-5");
            result = rx.asDouble();

        } catch (RserveException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();

        } catch (REXPMismatchException e) {
            e.printStackTrace();
            System.err.println("REXPMismatchException" + e.getMessage());
        }
        RserveDto firstTry = new RserveDto();
        firstTry.setFirstTry(result);

        List<RserveDto> list = new ArrayList<RserveDto>();
        list.add(firstTry);

        return list;
    }

}

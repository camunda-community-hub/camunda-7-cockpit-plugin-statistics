/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.camunda.cockpit.plugin.statistics.util;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This class provides util methods for the plugin. All methods should be
 * static.
 *
 * @author EH
 */
public class UtilParser {

    private static final Logger logger = Logger.getLogger(UtilParser.class.getName());

    /**
     * Util converter method. It builds a Date from a String. Please consider,
     * that the String have to be in this format: yyyy-MM-dd'T'HH:mm:ss
     *
     * @param dateString in this pattern: "yyyy-MM-dd'T'HH:mm:ss"
     * @return A fully generated {@link Date}.
     */
    public static Date getDateFromString(String dateString) {
        try {
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd-HH:mm:ss");
            Date date = df.parse(dateString);
            return date;
        } catch (ParseException e) {
            logger.log(Level.SEVERE, "Date format should be yyyy-MM-dd-HH:mm:ss");
            return null;
        }
    }
}

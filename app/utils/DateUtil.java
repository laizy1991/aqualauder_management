package utils;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import play.Logger;

public class DateUtil {

    /** 常规日期格式，24小时制格式  **/
    public static final String NORMAL_DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";
    
    public static final String ONLY_DATE_FORMAT = "yyyy-MM-dd";
    
    public static final String ONLY_DAY_FORMAT = "MM-dd";
    
    public static final String STACK_DATE_FORMAT = "yyyyMMdd";
    
    public static final long ONE_DAY_TS = 24 * 60 * 60 * 1000L;
    
    /**
     * 返回昨天日期：yyyyMMdd
     * @return
     */
    public static int getYesterday() {
        SimpleDateFormat sdf = new SimpleDateFormat(STACK_DATE_FORMAT);
        long yesterday = DateUtil.getOneDayAgo();
        String dateStr = sdf.format(new Date(yesterday));
        return Integer.parseInt(dateStr);
    }
    
    /**
     * 获取一天的开始和结束
     * @param date yyyyMMdd
     * @return
     * @throws ParseException
     */
    public static Long[] getBeginAndEndOfDate(int date) {
        Long[] times = new Long[2];
        
        SimpleDateFormat sdf = new SimpleDateFormat(STACK_DATE_FORMAT);
        Date beginTime;
        try {
            beginTime = sdf.parse(String.valueOf(date));
            times[0] = beginTime.getTime();
            times[1] = beginTime.getTime() + ONE_DAY_TS;
        } catch (ParseException e) {
            Logger.error(e, "");
        }
        return times;
    }
    
    public static long getOneDayAgo()
    {
        return System.currentTimeMillis() - ONE_DAY_TS;
    }
    
    /**
     * 获取当前时间，日期格式为默认的yyyy-MM-dd HH:mm:ss
     * @return
     */
    public static String getCurrentDate() {
        SimpleDateFormat sdf = new SimpleDateFormat(NORMAL_DATE_FORMAT);
        return sdf.format(new Date());
    }
    
    /**
     * 毫秒数转换为常见日期格式的字符串，如yyyy-MM-dd HH:mm:ss
     * @param time
     * @return
     */
    public static String getDateString(Long time) {
        if(LongUtil.isNullOrZero(time)) {
            return null;
        }
        SimpleDateFormat sdf = new SimpleDateFormat(NORMAL_DATE_FORMAT);
        return sdf.format(new Date(time));
    }
    
    /**
     * 毫秒数转换为指定日期格式的字符串，如yyyy-MM-dd HH:mm:ss，或yyyy-MM-dd
     * @param time
     * @return
     */
    public static String getDateString(Long time, String pattern) {
        if(LongUtil.isNullOrZero(time)) {
            return null;
        }
        SimpleDateFormat sdf = new SimpleDateFormat(pattern);
        return sdf.format(new Date(time));
    }
    
    /**
     * 根据传入的日期字符串和转换格式，转换成对应的长整型
     * @param dateStr
     * @param pattern
     * @return
     * @author chenxx
     */
    public static Long getDateTime(String dateStr, String pattern) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat();
            sdf.applyPattern(pattern);
            return sdf.parse(dateStr).getTime();
        } catch (ParseException e) {
            Logger.error(e, "DateUtil - getDateTime");
        }
        return null;
    }
    
    /**
     * 常见日期格式的字符串，如yyyy-MM-dd HH:mm:ss转换为毫秒数，如果传入的是HH:mm:ss格式的，
     * 则认为是当天的日期，加上当天的年月日，进行转换
     * @param timeStr
     * @return
     */
    public static Long getDateTime(String timeStr) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat();
            
            if(timeStr.split(" ").length == 1) {
                sdf.applyPattern(ONLY_DATE_FORMAT);
                timeStr = sdf.format(new Date()) + " " + timeStr; 
            }
            sdf.applyPattern(NORMAL_DATE_FORMAT);
            return sdf.parse(timeStr).getTime();
        } catch (ParseException e) {
            Logger.error(e, "DateUtil - getDateTime");
        }
        return null;
    }
    
    public static String getDay() {
        SimpleDateFormat sdf = new SimpleDateFormat(ONLY_DAY_FORMAT);
        return sdf.format(new Date());
    }
    
    /**
     * 获取某天凌晨的毫秒时间
     * @param time
     * @return
     */
    public static long getMorning(Date d) {
        Calendar currentDate = Calendar.getInstance();   
        currentDate.setTime(d);
        currentDate.set(Calendar.HOUR_OF_DAY, 0);  
        currentDate.set(Calendar.MINUTE, 0);  
        currentDate.set(Calendar.SECOND, 0);  
        return currentDate.getTimeInMillis();
    }
    
    /**
     * 获取某天凌晨的毫秒时间
     * @param time
     * @return
     */
    public static long getOtherDayMorning(int offset) {
        Calendar currentDate = Calendar.getInstance();  
        currentDate.setTime(new Date());
        currentDate.add(Calendar.DATE, offset);
        currentDate.set(Calendar.HOUR_OF_DAY, 0);  
        currentDate.set(Calendar.MINUTE, 0);  
        currentDate.set(Calendar.SECOND, 0);  
        return currentDate.getTimeInMillis();
    }
    
    /**
     * 获取某月第一天凌晨的毫秒时间
     * @param time
     * @return
     */
    public static long getMonthFristDayMorning() {
        Calendar currentDate = Calendar.getInstance();  
        currentDate.add(Calendar.MONTH, 0);
        currentDate.set(Calendar.DAY_OF_MONTH,1);//设置为1号,当前日期既为本月第一天   
        currentDate.set(Calendar.HOUR_OF_DAY, 0);  
        currentDate.set(Calendar.MINUTE, 0);  
        currentDate.set(Calendar.SECOND, 0);  
        return currentDate.getTimeInMillis();
    }
    
    /**
     * 根据常见日期格式的字符串，转换为毫秒数
     * @param timeStr
     * @return
     */
    public static Long getDate(String timeStr) {
        String pattern = "";
        if(timeStr.split(" ").length == 1) {
            pattern = ONLY_DATE_FORMAT;
        } else {
            pattern = NORMAL_DATE_FORMAT;
        }
        return getDate(timeStr, pattern);
    }
    
    /**
     * 根据常见日期格式的字符串，转换为毫秒数
     * @param timeStr
     * @return
     */
    public static Long getDate(String timeStr, String pattern) {
        try {
            if(StringUtil.isNullOrEmpty(timeStr)) {
                return null;
            }
            if(StringUtil.isNullOrEmpty(pattern)) {
                pattern = NORMAL_DATE_FORMAT;
            }
            SimpleDateFormat sdf = new SimpleDateFormat();
            sdf.applyPattern(pattern);
            return sdf.parse(timeStr).getTime();
        } catch (Exception e) {
            Logger.warn("DateUtil - getDate format failed");
        }
        return null;
    }
    
    /**
     * 获取某个时间段内的所有日期  日期格式 yyyy-MM-dd
     * @param startDate 开始日期
     * @param endDate   结束日期
     * @return
     */
    public static List<String> getDateListByRange(String startDate, String endDate) {
        List<String> dateList = new ArrayList<String>();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Date begin = new Date();
        Date end = new Date();
        try {
            begin = sdf.parse(startDate);
            end = sdf.parse(endDate);
            double between = (end.getTime() - begin.getTime()) / 1000;// 除以1000是为了转换成秒
            double day = between / (24 * 3600);
            for (int i = 1; i <= day; i++) {
                Calendar cd = Calendar.getInstance();
                cd.setTime(sdf.parse(startDate));
                cd.add(Calendar.DATE, i);// 增加一天
                dateList.add(sdf.format(cd.getTime()));
            }
        } catch (ParseException e) {
            Logger.error(e, "DateUtil - getDateListByRange");
        }
        return dateList;
    }
    public static String format(Date date,String pattern)
    {
        SimpleDateFormat sdf = new SimpleDateFormat(pattern);
        return sdf.format(date);
    }
}

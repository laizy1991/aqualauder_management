package utils;

import java.io.UnsupportedEncodingException;

public class StringUtil {

	/**
	 * 判断字符串是否为null或空串
	 * @param str
	 * @return
	 */
	public static boolean isNullOrEmpty(String str) {
		return (null == str || "".equals(str));
	}
	
	/**
	 * utf-8转码
	 * @param str
	 * @return
	 * @throws UnsupportedEncodingException 
	 */
	public static String str2Utf8(String str) throws UnsupportedEncodingException {
		return new String(str.getBytes(),"utf-8");
	}
	
	/**
	 * 截取字符串
	 * @param str
	 * @param startIndex
	 * @param endIndex
	 * @return
	 * @author chenxx
	 */
	public static String subString(String str, int startIndex, int endIndex) {
		if(str.length() < endIndex) {
			return str;
		}
		return str.substring(startIndex, endIndex);
	}
	
	/**
	 * 合并多个换行
	 * @param str
	 * @return
	 * @author chenxx
	 */
	public static String replaceOverWrap(String str) {
		if(isNullOrEmpty(str)) {
			return str;
		}
		if(str.indexOf("\r\n") > 0) {
			return str.replaceAll("(\\r\\n)+", "\n");
		} else if(str.indexOf("\n") > 0) {
			return str.replaceAll("(\\n)+", "\n");
		}
		return str;
	}
}

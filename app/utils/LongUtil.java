package utils;

/**
 * 长整型工具类型
 *
 */
public class LongUtil {

	/**
	 * 判断Long对象是否为空或为0
	 * @param i
	 * @return
	 * @author chenxx
	 */
	public static boolean isNullOrZero(Long i) {
		return (null == i) || (i.longValue() == 0);
	}
}

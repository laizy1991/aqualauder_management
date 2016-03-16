package common.core;

import models.Administrator;
import play.mvc.Controller;
import dto.SessionInfo;

/**
 * 
 * @author Daniel@warthog.cn
 * @createDate 2016年3月16日
 *
 */
public class BaseController extends Controller {
	
	protected static SessionInfo sessionInfo;
	
	protected static Long privilegeFlag = 0L;

	protected static boolean checkRouterPrivilege(SessionInfo sessionInfo) {
		return true;
	}
	
	public static Administrator getAdmin() {
	    return sessionInfo.getAdmin();
	}
}

package controllers;

import org.apache.commons.lang.StringUtils;

import play.i18n.Messages;
import service.AdminService;

import common.annotation.GuestAuthorization;
import common.core.WebController;

import dto.SessionInfo;
import exception.BusinessException;

/**
 * 
 * @author Daniel@warthog.cn
 * @createDate 2016年3月16日
 *
 */
public class Application extends WebController {

    @GuestAuthorization
    public static void login() {
        renderTemplate(loginTpl);
    }

    @GuestAuthorization
    public static void logined(String userName, String password) {
        String errorMsg = null;

        if (StringUtils.isBlank("userName")) {
            errorMsg = Messages.get("user.mobile.invalid");
            renderTemplate(loginTpl, errorMsg);
        }

        if (StringUtils.isBlank("password")) {
            errorMsg = Messages.get("user.password.invalid");
            renderTemplate(loginTpl, errorMsg);
        }

        try {
            SessionInfo sessionInfo = AdminService.login(userName, password);
            if (sessionInfo == null) {
                errorMsg = Messages.get("user.login.failed");
                renderTemplate(loginTpl, errorMsg);
            }
            session.put("sid", sessionInfo.getSessionId());
            redirect("Application.index");
        } catch (BusinessException e) {
            errorMsg = e.getMessage();
        }
        renderTemplate(loginTpl, errorMsg);
    }

    public static void logout() {
        String sessionId = session.get("sid");
        SessionInfo sessionInfo = AdminService.getSessionInfo(sessionId);

        if (sessionInfo != null) {
            AdminService.logout(sessionId);
            session.remove("sid");
        }
        login();
    }

    public static void index() {
        render();
    }

}

package service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import models.Administrator;
import utils.EncryptionUtil;
import utils.IdGenerator;
import dao.AdminDao;
import dto.SessionInfo;
import exception.BusinessException;

public class AdminService {
    //session信息目前放内存，之后保存到缓存中
    private static Map<String, SessionInfo> sessions = new ConcurrentHashMap<String, SessionInfo>();
    //加密盐
    private static final String SLAT = "lllaqenk";
    
    public static SessionInfo getSessionInfo(String sessionId) {
        if(sessionId == null) {
            return null;
        }
        return sessions.get(sessionId);
    }
    

    public static SessionInfo login(String userName, String password) throws BusinessException {
        System.err.println(userName);
        System.err.println(password);
        Administrator admin = AdminDao.getByName(userName);
        if (admin == null) {
            throw new BusinessException("User not exists");
        }
        
        //TODO MD5加密
        String md5 = EncryptionUtil.md5(password + SLAT);
        System.err.println(md5);
        if (!admin.getPassword().equals(md5)) {
            throw new BusinessException("Password incorrect");
        }
        
        SessionInfo sessionInfo = new SessionInfo();
        sessionInfo.setSessionId(IdGenerator.getUUID());
        sessionInfo.setAdmin(admin);
    
        //暂时放内存，之后放缓存
        sessions.put(sessionInfo.getSessionId(), sessionInfo);
        return sessionInfo;
    }
    
    public static void logout(String sessionId) {
        sessions.remove(sessionId);
    }
}
